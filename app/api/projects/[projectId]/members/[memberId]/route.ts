import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db/client"
import { logger } from "@/lib/logger"

/**
 * PATCH /api/projects/[projectId]/members/[memberId]
 * Update member role
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
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
        { error: "Forbidden - Only project owner can update member roles" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { role } = body

    if (!role || !['owner', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'owner', 'editor', or 'viewer'" },
        { status: 400 }
      )
    }

    const member = await db.updateMemberRole(params.memberId, role as 'owner' | 'editor' | 'viewer')

    // Log activity using authenticated client
    try {
      const activity = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        project_id: params.projectId,
        user_id: user.id,
        activity_type: 'permission_changed',
        description: `Member role updated to ${role}`,
        metadata: { memberId: params.memberId, role },
      }
      await supabase.from('project_activity').insert(activity)
    } catch (activityError) {
      logger.error("Failed to log activity:", activityError)
    }

    return NextResponse.json({ member })
  } catch (error: unknown) {
    logger.error("Error updating member role:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update member role"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[projectId]/members/[memberId]
 * Remove a member from a project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
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
        { error: "Forbidden - Only project owner can remove members" },
        { status: 403 }
      )
    }

    // Get member info before deleting
    const members = await db.getProjectMembers(params.projectId)
    const member = members.find((m: any) => m.id === params.memberId)

    await db.removeProjectMember(params.memberId)

    // Log activity using authenticated client
    if (member) {
      try {
        const activity = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          project_id: params.projectId,
          user_id: user.id,
          activity_type: 'member_left',
          description: `Member removed from project`,
          metadata: { memberId: params.memberId },
        }
        await supabase.from('project_activity').insert(activity)
      } catch (activityError) {
        logger.error("Failed to log activity:", activityError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error("Error removing member:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to remove member"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

