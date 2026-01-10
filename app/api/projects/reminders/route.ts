import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * GET /api/projects/reminders
 * Get all reminders for a user
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

    try {
      const { data: reminders, error } = await supabase
        .from('project_reminders')
        .select('*, project:projects(id, name)')
        .eq('user_id', user.id)
        .order('reminder_date', { ascending: true })
      
      if (error) {
        return NextResponse.json({ reminders: [] })
      }

      return NextResponse.json({ reminders: reminders || [] })
    } catch (error) {
      return NextResponse.json({ reminders: [] })
    }
  } catch (error: unknown) {
    logger.error("Error fetching reminders:", error)
    return NextResponse.json({ reminders: [] })
  }
}

/**
 * POST /api/projects/reminders
 * Create a new reminder
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
    const { project_id, reminder_date, reminder_text, reminder_type } = body

    if (!project_id || !reminder_date) {
      return NextResponse.json(
        { error: "Project ID and reminder date are required" },
        { status: 400 }
      )
    }

    const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      const { data, error } = await supabase
        .from('project_reminders')
        .insert({
          id: reminderId,
          user_id: user.id,
          project_id,
          reminder_date: new Date(reminder_date).toISOString(),
          reminder_text: reminder_text || '',
          reminder_type: reminder_type || 'deadline',
          completed: false,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: "Reminders feature not available. Please run the database migration." },
          { status: 503 }
        )
      }

      return NextResponse.json({ reminder: data })
    } catch (error) {
      return NextResponse.json(
        { error: "Reminders feature not available. Please run the database migration." },
        { status: 503 }
      )
    }
  } catch (error: unknown) {
    logger.error("Error creating reminder:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create reminder"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

