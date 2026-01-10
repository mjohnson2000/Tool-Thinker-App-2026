import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db/client"

/**
 * GET /api/projects/[projectId]/activity
 * Get activity feed for a project
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
    const { env } = await import("@/lib/env")

    const supabase = createSupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Verify project access
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check access (owner or member)
    if (String(project.user_id) !== String(user.id)) {
      // TODO: Check project_members table
      return NextResponse.json(
        { error: "Unauthorized - No access to this project" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "20")

    // Get activity from project_activity table
    const { data: activities, error } = await supabase
      .from("project_activity")
      .select("*")
      .eq("project_id", params.projectId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      // Table might not exist, try to generate from events
      try {
        const { data: events } = await supabase
          .from("events")
          .select("*")
          .eq("project_id", params.projectId)
          .order("created_at", { ascending: false })
          .limit(limit)

        const activitiesFromEvents = (events || []).map((event: any) => ({
          id: event.id,
          activity_type: event.event_type,
          description: getActivityDescription(event.event_type, event.payload),
          user_id: event.user_id,
          created_at: event.created_at,
          metadata: event.payload,
        }))

        return NextResponse.json({ activities: activitiesFromEvents })
      } catch {
        return NextResponse.json({ activities: [] })
      }
    }

    // Get user emails for activities
    // Note: We can't use admin.getUserById without service role key
    // For now, we'll return user_id and let the frontend handle email display
    const activitiesWithUsers = (activities || []).map((activity: any) => {
      return {
        ...activity,
        user_email: activity.user_email || undefined, // If stored in activity
      }
    })

    return NextResponse.json({ activities: activitiesWithUsers || [] })
  } catch (error: unknown) {
    logger.error("Error fetching activity:", error)
    return NextResponse.json({ activities: [] })
  }
}

function getActivityDescription(type: string, payload: any): string {
  switch (type) {
    case "project_created":
      return "Project created"
    case "project_updated":
      return "Project updated"
    case "step_started":
      return `Started step: ${payload.stepKey || "Unknown"}`
    case "step_completed":
      return `Completed step: ${payload.stepKey || "Unknown"}`
    case "member_invited":
      return `Invited ${payload.email || "member"} to project`
    case "member_joined":
      return `${payload.email || "Member"} joined the project`
    case "comment_added":
      return "Added a comment"
    case "tool_linked":
      return `Linked tool: ${payload.toolName || "Unknown"}`
    default:
      return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
}
