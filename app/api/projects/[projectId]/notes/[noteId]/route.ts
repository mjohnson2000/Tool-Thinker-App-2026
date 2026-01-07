import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * PATCH /api/projects/[projectId]/notes/[noteId]
 * Update a note
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; noteId: string } }
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
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', params.projectId)
      .single()

    if (!project || String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.note_text !== undefined) updates.note_text = body.note_text.trim()
    if (body.note_type !== undefined) updates.note_type = body.note_type
    if (body.is_pinned !== undefined) updates.is_pinned = body.is_pinned
    if (body.step_id !== undefined) updates.step_id = body.step_id || null

    const { data, error } = await supabase
      .from('project_notes')
      .update(updates)
      .eq('id', params.noteId)
      .eq('project_id', params.projectId)
      .select()
      .single()

    if (error) {
      logger.error("Failed to update note:", error)
      return NextResponse.json(
        { error: `Failed to update note: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ note: data })
  } catch (error: unknown) {
    logger.error("Project notes PATCH error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update note"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[projectId]/notes/[noteId]
 * Delete a note
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; noteId: string } }
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
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', params.projectId)
      .single()

    if (!project || String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('project_notes')
      .delete()
      .eq('id', params.noteId)
      .eq('project_id', params.projectId)

    if (error) {
      logger.error("Failed to delete note:", error)
      return NextResponse.json(
        { error: `Failed to delete note: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error("Project notes DELETE error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete note"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

