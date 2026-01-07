import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = req.headers.get('authorization')
    const supabase = createClient()
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      
      if (user) {
        // Load project with tags and notes
        const project = await db.getProjectById(params.projectId)
        if (!project) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
          )
        }

        // Load tags
        const { data: tags } = await supabase
          .from('project_tags')
          .select('*')
          .eq('project_id', params.projectId)
          .order('created_at', { ascending: true })

        // Load notes
        const { data: notes } = await supabase
          .from('project_notes')
          .select('*')
          .eq('project_id', params.projectId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })

        return NextResponse.json({
          ...project,
          tags: tags || [],
          notes: notes || [],
        })
      }
    }

    // Fallback to basic project fetch
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(project)
  } catch (error: unknown) {
    logger.error("Project GET error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch project"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const project = await db.getProjectById(params.projectId)
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

    // Allow updating status, priority, description, name
    if (body.status !== undefined) updates.status = body.status
    if (body.priority !== undefined) updates.priority = body.priority
    if (body.description !== undefined) updates.description = body.description
    if (body.name !== undefined) updates.name = body.name

    // Handle archive
    if (body.status === 'archived' && !project.archived_at) {
      updates.archived_at = new Date().toISOString()
    } else if (body.status !== 'archived' && project.archived_at) {
      updates.archived_at = null
    }

    const updatedProject = await db.updateProject(params.projectId, updates)
    return NextResponse.json(updatedProject)
  } catch (error: unknown) {
    logger.error("Project PATCH error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update project"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const project = await db.getProjectById(params.projectId)
    if (!project || String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      )
    }

    // Delete the project (cascade will handle related data)
    await db.deleteProject(params.projectId)
    await db.logEvent(user.id, "project_deleted", { projectId: params.projectId })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error("Project DELETE error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete project"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




