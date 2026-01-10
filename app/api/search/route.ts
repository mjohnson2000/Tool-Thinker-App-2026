import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/client'
import { logger } from '@/lib/logger'

/**
 * GET /api/search?q=query
 * Global search across projects, notes, and tool outputs
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

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') // 'projects', 'notes', 'outputs', or 'all'

    if (!query.trim()) {
      return NextResponse.json({
        projects: [],
        notes: [],
        outputs: [],
      })
    }

    const results: {
      projects: any[]
      notes: any[]
      outputs: any[]
    } = {
      projects: [],
      notes: [],
      outputs: [],
    }

    // Search projects
    if (!type || type === 'all' || type === 'projects') {
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)
      
      results.projects = projects || []
    }

    // Search notes
    if (!type || type === 'all' || type === 'notes') {
      try {
        const { data: notes } = await supabase
          .from('project_notes')
          .select('*, project:projects(id, name)')
          .eq('user_id', user.id)
          .ilike('note_text', `%${query}%`)
          .limit(10)
        
        results.notes = notes || []
      } catch (error) {
        // Notes table might not exist
        logger.debug("Notes table not available:", error)
      }
    }

    // Search tool outputs
    if (!type || type === 'all' || type === 'outputs') {
      try {
        const { data: outputs } = await supabase
          .from('tool_outputs')
          .select('*')
          .eq('user_id', user.id)
          .or(`tool_name.ilike.%${query}%,output_data::text.ilike.%${query}%`)
          .limit(10)
        
        results.outputs = outputs || []
      } catch (error) {
        logger.debug("Tool outputs search error:", error)
      }
    }

    return NextResponse.json(results)
  } catch (error: unknown) {
    logger.error("Error performing search:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to perform search"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

