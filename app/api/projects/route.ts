import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const priority = searchParams.get('priority')

    // Build query - don't join project_tags if table doesn't exist
    let query = supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Tag filter removed - project_tags table may not exist
    // if (tag) {
    //   query = query.contains('project_tags', [{ tag }])
    // }

    const { data: projects, error } = await query
      .order('updated_at', { ascending: false })

    if (error) {
      logger.error("Failed to fetch projects:", error)
      return NextResponse.json([], { status: 200 })
    }

    // Try to fetch tags separately if table exists
    const projectsWithTags = await Promise.all(
      (projects || []).map(async (project: any) => {
        try {
          const { data: tags } = await supabase
            .from('project_tags')
            .select('*')
            .eq('project_id', project.id)
          
          return {
            ...project,
            tags: tags || [],
          }
        } catch (tagError) {
          // If project_tags table doesn't exist, just return project without tags
          return {
            ...project,
            tags: [],
          }
        }
      })
    )

    return NextResponse.json(Array.isArray(projectsWithTags) ? projectsWithTags : [])
  } catch (error: unknown) {
    logger.error("Error fetching projects:", error)
    // Return empty array instead of error object to prevent .map() errors
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, description, status, priority } = body

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      )
    }

    const project = await db.createProject(user.id, name)
    
    // Update with optional fields
    const updates: any = {}
    if (description) updates.description = description
    if (status) updates.status = status
    if (priority) updates.priority = priority
    
    if (Object.keys(updates).length > 0) {
      await db.updateProject(project.id, updates)
      const updatedProject = await db.getProjectById(project.id)
      if (updatedProject) {
        await db.logEvent(user.id, "project_created", { projectId: updatedProject.id }, updatedProject.id)
        return NextResponse.json(updatedProject)
      }
    }
    await db.logEvent(user.id, "project_created", { projectId: project.id }, project.id)
    
    return NextResponse.json(project)
  } catch (error: unknown) {
    logger.error("Error creating project:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create project"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}



