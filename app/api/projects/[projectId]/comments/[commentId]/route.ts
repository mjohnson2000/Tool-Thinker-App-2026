import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db/client"

/**
 * PATCH /api/projects/[projectId]/comments/[commentId]
 * Update a comment
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; commentId: string } }
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

    // Get comment and verify ownership
    const { data: comment, error: commentError } = await supabase
      .from("project_comments")
      .select("*")
      .eq("id", params.commentId)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    if (String(comment.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - You can only edit your own comments" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { comment_text } = body

    if (!comment_text || !comment_text.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      )
    }

    const { data: updatedComment, error: updateError } = await supabase
      .from("project_comments")
      .update({
        comment_text: comment_text.trim(),
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.commentId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Failed to update comment" },
        { status: 500 }
      )
    }

    return NextResponse.json({ comment: updatedComment })
  } catch (error: unknown) {
    logger.error("Error updating comment:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update comment"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[projectId]/comments/[commentId]
 * Delete a comment
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; commentId: string } }
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

    // Get comment and verify ownership or project ownership
    const { data: comment, error: commentError } = await supabase
      .from("project_comments")
      .select("*")
      .eq("id", params.commentId)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    // Verify project ownership
    const project = await db.getProjectById(params.projectId)
    const isCommentOwner = String(comment.user_id) === String(user.id)
    const isProjectOwner = project && String(project.user_id) === String(user.id)

    if (!isCommentOwner && !isProjectOwner) {
      return NextResponse.json(
        { error: "Unauthorized - You can only delete your own comments or be project owner" },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from("project_comments")
      .delete()
      .eq("id", params.commentId)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete comment" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error("Error deleting comment:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete comment"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

