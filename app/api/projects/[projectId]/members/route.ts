import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db/client"
import { logger } from "@/lib/logger"
import crypto from "crypto"

/**
 * GET /api/projects/[projectId]/members
 * Get all members of a project
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create an authenticated Supabase client with the user's token
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const { env } = await import('@/lib/env')
    
    const supabase = createSupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )
    
    // Validate token by getting user - pass token directly
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Check access - verify user is project owner or member
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const isOwner = String(project.user_id) === String(user.id)
    
    // Get members using authenticated client
    const { data: membersData, error: membersError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', params.projectId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (membersError) {
      // If not owner, check if user is a member
      if (!isOwner) {
        const { data: userMember } = await supabase
          .from('project_members')
          .select('*')
          .eq('project_id', params.projectId)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (!userMember) {
          return NextResponse.json(
            { error: "Forbidden - No access to this project" },
            { status: 403 }
          )
        }
      } else {
        throw membersError
      }
    }

    // If not owner, only return their own membership
    const members = isOwner 
      ? (membersData || [])
      : (membersData || []).filter((m: any) => m.user_id === user.id)

    return NextResponse.json({ members })
  } catch (error: unknown) {
    logger.error("Error fetching project members:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch members"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[projectId]/members
 * Add a member to a project (by email - creates invitation)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create an authenticated Supabase client with the user's token
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const { env } = await import('@/lib/env')
    
    const supabase = createSupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )
    
    // Validate token by getting user - pass token directly
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Check if user is project owner
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Forbidden - Only project owner can add members" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, role = 'viewer' } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    if (!['editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'editor' or 'viewer'" },
        { status: 400 }
      )
    }

    // Prevent self-invitation (project owner is already a member)
    if (user.email?.toLowerCase() === email.toLowerCase()) {
      return NextResponse.json(
        { error: "You are already the project owner. You cannot invite yourself." },
        { status: 400 }
      )
    }

    // Try to check if user exists in auth system (requires admin, so we'll handle gracefully)
    let invitedUser = null
    try {
      const { data: { users }, error: adminError } = await supabase.auth.admin.listUsers()
      if (!adminError && users) {
        invitedUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
      }
    } catch (error) {
      // Admin access not available - that's okay, we'll just create an invitation
      logger.log("Admin access not available for user lookup, creating invitation instead")
    }

    if (invitedUser) {
      // User exists - add directly as member
      try {
        const member = await db.addProjectMember(
          params.projectId,
          invitedUser.id,
          role as 'editor' | 'viewer',
          user.id
        )

        // Log activity using authenticated client
        try {
          const activity = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            project_id: params.projectId,
            user_id: user.id,
            activity_type: 'member_joined',
            description: `${invitedUser.email} was added as ${role}`,
            metadata: { memberId: member.id, role },
          }
          await supabase.from('project_activity').insert(activity)
        } catch (activityError) {
          // Don't fail the request if activity logging fails
          logger.error("Failed to log activity:", activityError)
        }

        return NextResponse.json({ member })
      } catch (error: any) {
        // If member already exists, return existing member
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          const members = await db.getProjectMembers(params.projectId)
          const existingMember = members.find((m: any) => m.user_id === invitedUser.id)
          if (existingMember) {
            return NextResponse.json({ member: existingMember, message: "Member already exists" })
          }
        }
        throw error
      }
    } else {
      // User doesn't exist or admin access unavailable - create invitation
      const inviteToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      const normalizedEmail = email.toLowerCase().trim()

      // Check if invitation already exists for this email and project
      const { data: existingInvitation } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', params.projectId)
        .eq('email', normalizedEmail)
        .is('accepted_at', null)
        .is('declined_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (existingInvitation) {
        return NextResponse.json(
          { 
            error: "An invitation has already been sent to this email address for this project.",
            invitation: existingInvitation,
            message: "Invitation already exists"
          },
          { status: 400 }
        )
      }

      // Use the authenticated server client to create invitation (bypasses RLS with proper auth)
      const invitation = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        project_id: params.projectId,
        email: normalizedEmail,
        role,
        token: inviteToken,
        invited_by: user.id,
        expires_at: expiresAt,
      }

      if (existingInvitation) {
        return NextResponse.json(
          { 
            error: "An invitation has already been sent to this email address for this project.",
            invitation: existingInvitation,
            message: "Invitation already exists"
          },
          { status: 400 }
        )
      }

      const { data: invitationData, error: inviteError } = await supabase
        .from('project_invitations')
        .insert(invitation)
        .select()
        .single()

      if (inviteError) {
        logger.error("Error creating invitation:", inviteError)
        
        // Handle duplicate key error gracefully
        if (inviteError.code === '23505' || inviteError.message.includes('duplicate') || inviteError.message.includes('unique')) {
          return NextResponse.json(
            { 
              error: "An invitation has already been sent to this email address for this project.",
              message: "Please wait for the existing invitation to be accepted or expired."
            },
            { status: 400 }
          )
        }
        
        throw new Error(`Failed to create invitation: ${inviteError.message}`)
      }

      // Log activity using authenticated client
      try {
        const activity = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          project_id: params.projectId,
          user_id: user.id,
          activity_type: 'member_invited',
          description: `Invitation sent to ${email} as ${role}`,
          metadata: { invitationId: invitationData.id, email, role },
        }
        await supabase.from('project_activity').insert(activity)
      } catch (activityError) {
        // Don't fail the request if activity logging fails
        logger.error("Failed to log activity:", activityError)
      }

      // Send invitation email
      const { env } = await import('@/lib/env')
      const { sendInvitationEmail } = await import('@/lib/email')
      
      const inviteUrl = `${env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${inviteToken}`
      
      // Get project name for email
      const project = await db.getProjectById(params.projectId)
      const projectName = project?.name || 'a project'
      
      // Send email (non-blocking - don't fail if email fails)
      sendInvitationEmail({
        to: normalizedEmail,
        inviterName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Someone',
        inviterEmail: user.email || '',
        projectName,
        inviteUrl,
        role,
      }).catch((emailError) => {
        // Log but don't fail the request
        logger.error("Failed to send invitation email (invitation still created):", emailError)
      })

      return NextResponse.json({ 
        invitation: invitationData,
        inviteUrl,
        message: "Invitation created and email sent. User will need to sign up to accept."
      })
    }
  } catch (error: unknown) {
    logger.error("Error adding project member:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to add member"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

