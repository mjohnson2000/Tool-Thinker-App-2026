import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * GET /api/projects/folders
 * Get all folders for a user
 */
export async function GET(req: NextRequest) {
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

    // Check if project_folders table exists, if not return empty array
    try {
      const { data: folders, error } = await supabase
        .from('project_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })
      
      if (error) {
        // Table might not exist, return empty array
        return NextResponse.json({ folders: [] })
      }

      return NextResponse.json({ folders: folders || [] })
    } catch (error) {
      // Table doesn't exist, return empty array
      return NextResponse.json({ folders: [] })
    }
  } catch (error: unknown) {
    logger.error("Error fetching folders:", error)
    return NextResponse.json({ folders: [] })
  }
}

/**
 * POST /api/projects/folders
 * Create a new folder
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { name, color } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      )
    }

    const folderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      const { data, error } = await supabase
        .from('project_folders')
        .insert({
          id: folderId,
          user_id: user.id,
          name: name.trim(),
          color: color || '#3B82F6',
        })
        .select()
        .single()

      if (error) {
        // Table might not exist
        return NextResponse.json(
          { error: "Folders feature not available. Please run the database migration." },
          { status: 503 }
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
    logger.error("Error creating folder:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create folder"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

