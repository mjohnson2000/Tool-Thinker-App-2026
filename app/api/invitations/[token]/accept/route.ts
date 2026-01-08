import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db/client"
import { logger } from "@/lib/logger"

/**
 * POST /api/invitations/[token]/accept
 * Accept a project invitation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
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

    const member = await db.acceptInvitation(params.token, user.id)

    // Log activity using authenticated client
    try {
      const activity = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        project_id: member.project_id,
        user_id: user.id,
        activity_type: 'member_joined',
        description: `${user.email} joined the project`,
        metadata: { memberId: member.id, role: member.role },
      }
      await supabase.from('project_activity').insert(activity)
    } catch (activityError) {
      logger.error("Failed to log activity:", activityError)
    }

    return NextResponse.json({ 
      member,
      projectId: member.project_id,
      message: "Invitation accepted successfully"
    })
  } catch (error: unknown) {
    logger.error("Error accepting invitation:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to accept invitation"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

