import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db/client"

/**
 * GET /api/projects/[projectId]/comments
 * Get all comments for a project or step
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

    // Check if user has access (owner or member)
    // For now, we'll allow if user is owner (can enhance with member check)
    if (String(project.user_id) !== String(user.id)) {
      // TODO: Check project_members table for access
      return NextResponse.json(
        { error: "Unauthorized - No access to this project" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const stepId = searchParams.get("step_id")

    // Try to get comments from project_comments table
    let query = supabase
      .from("project_comments")
      .select("*")
      .eq("project_id", params.projectId)
      .order("created_at", { ascending: false })

    if (stepId) {
      query = query.eq("step_id", stepId)
    } else {
      query = query.is("step_id", null)
    }

    const { data: comments, error } = await query

    if (error) {
      // Table might not exist, return empty array
      return NextResponse.json({ comments: [] })
    }

    // Get user emails for comments
    // Note: We can't use admin.getUserById without service role key
    // For now, we'll return user_id and let the frontend handle email display
    // Or we could join with a user_profiles table if it exists
    const commentsWithUsers = (comments || []).map((comment: any) => {
      // Try to get email from project_members if available
      // Otherwise, return user_id for frontend to handle
      return {
        ...comment,
        user_email: comment.user_email || undefined, // If stored in comment
      }
    })

    return NextResponse.json({ comments: commentsWithUsers || [] })
  } catch (error: unknown) {
    logger.error("Error fetching comments:", error)
    return NextResponse.json({ comments: [] })
  }
}

/**
 * POST /api/projects/[projectId]/comments
 * Create a new comment
 */
export async function POST(
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

    if (String(project.user_id) !== String(user.id)) {
      // TODO: Check project_members table for editor access
      return NextResponse.json(
        { error: "Unauthorized - No access to comment on this project" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { comment_text, step_id, mentions } = body

    if (!comment_text || !comment_text.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      )
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      const { data, error } = await supabase
        .from("project_comments")
        .insert({
          id: commentId,
          project_id: params.projectId,
          step_id: step_id || null,
          user_id: user.id,
          comment_text: comment_text.trim(),
          mentions: mentions || [],
        })
        .select()
        .single()

      if (error) {
        // Table might not exist
        return NextResponse.json(
          { error: "Comments feature not available. Please run the database migration." },
          { status: 503 }
        )
      }

      return NextResponse.json({ comment: data })
    } catch (error) {
      return NextResponse.json(
        { error: "Comments feature not available. Please run the database migration." },
        { status: 503 }
      )
    }
  } catch (error: unknown) {
    logger.error("Error creating comment:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create comment"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

