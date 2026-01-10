import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * PATCH /api/projects/folders/[folderId]
 * Update a folder (name, color)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { folderId: string } }
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
    
    // Validate token by getting user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Verify folder exists and belongs to user
    const { data: folder, error: folderError } = await supabase
      .from('project_folders')
      .select('*')
      .eq('id', params.folderId)
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

    const body = await req.json()
    const { name, color } = body

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Folder name cannot be empty" },
          { status: 400 }
        )
      }
      updates.name = name.trim()
    }

    if (color !== undefined) {
      updates.color = color
    }

    try {
      const { data, error } = await supabase
        .from('project_folders')
        .update(updates)
        .eq('id', params.folderId)
        .select()
        .single()

      if (error) {
        // Check for unique constraint violation (duplicate name)
        if (error.code === '23505') {
          return NextResponse.json(
            { error: "A folder with this name already exists" },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: error.message || "Failed to update folder" },
          { status: 500 }
        )
      }

      return NextResponse.json({ folder: data })
    } catch (error) {
      return NextResponse.json(
        { error: "Folders feature not available. Please run the database migration." },
        { status: 503 }
      )
    }
  } catch (error: unknown) {
    logger.error("Error updating folder:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update folder"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/folders/[folderId]
 * Delete a folder (projects will be unassigned via ON DELETE SET NULL)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { folderId: string } }
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
    
    // Validate token by getting user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Verify folder exists and belongs to user
    const { data: folder, error: folderError } = await supabase
      .from('project_folders')
      .select('*')
      .eq('id', params.folderId)
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

    try {
      const { error } = await supabase
        .from('project_folders')
        .delete()
        .eq('id', params.folderId)

      if (error) {
        return NextResponse.json(
          { error: error.message || "Failed to delete folder" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json(
        { error: "Folders feature not available. Please run the database migration." },
        { status: 503 }
      )
    }
  } catch (error: unknown) {
    logger.error("Error deleting folder:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete folder"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

