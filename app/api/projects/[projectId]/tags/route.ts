import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * GET /api/projects/[projectId]/tags
 * Get all tags for a project
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

    const { data: tags, error } = await supabase
      .from('project_tags')
      .select('*')
      .eq('project_id', params.projectId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error("Failed to fetch tags:", error)
      return NextResponse.json(
        { error: `Failed to fetch tags: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ tags: tags || [] })
  } catch (error: unknown) {
    logger.error("Project tags GET error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch tags"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[projectId]/tags
 * Add a tag to a project
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
    const { tag, color } = body

    if (!tag || !tag.trim()) {
      return NextResponse.json(
        { error: "Tag is required" },
        { status: 400 }
      )
    }

    const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabase
      .from('project_tags')
      .insert({
        id,
        project_id: params.projectId,
        tag: tag.trim(),
        color: color || '#3B82F6',
      })
      .select()
      .single()

    if (error) {
      logger.error("Failed to create tag:", error)
      return NextResponse.json(
        { error: `Failed to create tag: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ tag: data })
  } catch (error: unknown) {
    logger.error("Project tags POST error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create tag"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[projectId]/tags/[tagId]
 * Remove a tag from a project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; tagId: string } }
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
      .from('project_tags')
      .delete()
      .eq('id', params.tagId)
      .eq('project_id', params.projectId)

    if (error) {
      logger.error("Failed to delete tag:", error)
      return NextResponse.json(
        { error: `Failed to delete tag: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error("Project tags DELETE error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete tag"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

