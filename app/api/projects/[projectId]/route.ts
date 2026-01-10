import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
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
        // Check if it's a JWT expired error
        const errorMessage = authError?.message || "Invalid token"
        if (errorMessage.includes("JWT") || errorMessage.includes("expired") || errorMessage.includes("token")) {
          return NextResponse.json(
            { error: "JWT expired" },
            { status: 401 }
          )
        }
        return NextResponse.json(
          { error: `Unauthorized - ${errorMessage}` },
          { status: 401 }
        )
      }
      
      if (user) {
        // Load project with tags and notes using authenticated client
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.projectId)
          .single()
        
        if (projectError) {
          if (projectError.code === 'PGRST116') {
            return NextResponse.json(
              { error: "Project not found" },
              { status: 404 }
            )
          }
          throw new Error(`Failed to fetch project: ${projectError.message}`)
        }

        if (!project) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
          )
        }

        // Load tags using authenticated client
        const { data: tags } = await supabase
          .from('project_tags')
          .select('*')
          .eq('project_id', params.projectId)
          .order('created_at', { ascending: true })

        // Load notes using authenticated client
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

    // Fallback: return unauthorized if no token provided
    return NextResponse.json(
      { error: "Unauthorized - No token provided" },
      { status: 401 }
    )
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

    // Verify project ownership using authenticated client
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.projectId)
      .single()
    
    if (projectError || !project || String(project.user_id) !== String(user.id)) {
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

    // Handle folder_id update with validation
    if (body.folder_id !== undefined) {
      if (body.folder_id === null || body.folder_id === '') {
        // Allow removing folder assignment
        updates.folder_id = null
      } else {
        // Validate folder exists and belongs to user
        const { data: folder, error: folderError } = await supabase
          .from('project_folders')
          .select('id, user_id')
          .eq('id', body.folder_id)
          .single()
        
        if (folderError || !folder) {
          return NextResponse.json(
            { error: "Folder not found" },
            { status: 404 }
          )
        }
        
        if (String(folder.user_id) !== String(user.id)) {
          return NextResponse.json(
            { error: "Unauthorized - Folder does not belong to you" },
            { status: 403 }
          )
        }
        
        updates.folder_id = body.folder_id
      }
    }

    // Handle archive
    if (body.status === 'archived' && !project.archived_at) {
      updates.archived_at = new Date().toISOString()
    } else if (body.status !== 'archived' && project.archived_at) {
      updates.archived_at = null
    }

    // Update project using authenticated client
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', params.projectId)
      .select()
      .single()
    
    if (updateError || !updatedProject) {
      throw new Error(`Failed to update project: ${updateError?.message || 'Unknown error'}`)
    }
    
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

    // Verify project ownership using authenticated client
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.projectId)
      .single()
    
    if (projectError || !project || String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      )
    }

    // Delete the project using authenticated client (cascade will handle related data)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.projectId)
    
    if (deleteError) {
      throw new Error(`Failed to delete project: ${deleteError.message}`)
    }

    // Log event using authenticated client
    try {
      await supabase
        .from('events')
        .insert({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: user.id,
          project_id: params.projectId,
          event_type: "project_deleted",
          payload: { projectId: params.projectId },
        })
    } catch (logError) {
      // Log error but don't fail the delete
      logger.error("Failed to log project deletion event:", logError)
    }

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




