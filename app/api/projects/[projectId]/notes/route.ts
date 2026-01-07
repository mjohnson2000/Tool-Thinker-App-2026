import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * GET /api/projects/[projectId]/notes
 * Get all notes for a project
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

    const { searchParams } = new URL(req.url)
    const stepId = searchParams.get('stepId')
    const noteType = searchParams.get('noteType')

    let query = supabase
      .from('project_notes')
      .select('*')
      .eq('project_id', params.projectId)

    if (stepId) {
      query = query.eq('step_id', stepId)
    }

    if (noteType) {
      query = query.eq('note_type', noteType)
    }

    const { data: notes, error } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      logger.error("Failed to fetch notes:", error)
      return NextResponse.json(
        { error: `Failed to fetch notes: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ notes: notes || [] })
  } catch (error: unknown) {
    logger.error("Project notes GET error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch notes"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[projectId]/notes
 * Create a new note
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
    const { note_text, note_type, step_id, is_pinned } = body

    if (!note_text || !note_text.trim()) {
      return NextResponse.json(
        { error: "Note text is required" },
        { status: 400 }
      )
    }

    const id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabase
      .from('project_notes')
      .insert({
        id,
        project_id: params.projectId,
        step_id: step_id || null,
        note_text: note_text.trim(),
        note_type: note_type || 'general',
        is_pinned: is_pinned || false,
      })
      .select()
      .single()

    if (error) {
      logger.error("Failed to create note:", error)
      return NextResponse.json(
        { error: `Failed to create note: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ note: data })
  } catch (error: unknown) {
    logger.error("Project notes POST error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create note"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

