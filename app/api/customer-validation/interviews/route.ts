import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * GET /api/customer-validation/interviews
 * Get all customer interviews for the authenticated user
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
    const projectId = searchParams.get("projectId")

    let query = supabase
      .from("customer_interviews")
      .select("*")
      .eq("user_id", user.id)
      .order("interview_date", { ascending: false })

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data: interviews, error } = await query

    if (error) {
      logger.error("Failed to fetch interviews:", error)
      return NextResponse.json(
        { error: `Failed to fetch interviews: ${error.message}` },
        { status: 500 }
      )
    }

    // Get answer counts for each interview
    const interviewsWithCounts = await Promise.all(
      (interviews || []).map(async (interview) => {
        const { count } = await supabase
          .from("interview_answers")
          .select("*", { count: "exact", head: true })
          .eq("interview_id", interview.id)
        
        return {
          ...interview,
          answer_count: count || 0
        }
      })
    )

    return NextResponse.json({ interviews: interviewsWithCounts })
  } catch (error: unknown) {
    logger.error("Customer validation interviews GET error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch interviews"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * POST /api/customer-validation/interviews
 * Create a new customer interview
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
    const {
      interviewee_name,
      interviewee_email,
      interviewee_role,
      interviewee_company,
      interview_date,
      interview_duration_minutes,
      interview_type,
      notes,
      project_id,
    } = body

    if (!interviewee_name || !interviewee_name.trim()) {
      return NextResponse.json(
        { error: "Interviewee name is required" },
        { status: 400 }
      )
    }

    // Generate ID
    const id = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const interview = {
      id,
      user_id: user.id,
      project_id: project_id || null,
      interviewee_name: interviewee_name.trim(),
      interviewee_email: interviewee_email?.trim() || null,
      interviewee_role: interviewee_role?.trim() || null,
      interviewee_company: interviewee_company?.trim() || null,
      interview_date: interview_date || new Date().toISOString(),
      interview_duration_minutes: interview_duration_minutes || null,
      interview_type: interview_type || "customer_interview",
      status: "scheduled",
      notes: notes?.trim() || null,
    }

    const { data, error } = await supabase
      .from("customer_interviews")
      .insert(interview)
      .select()
      .single()

    if (error) {
      logger.error("Failed to create interview:", error)
      return NextResponse.json(
        { error: `Failed to create interview: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ interview: data })
  } catch (error: unknown) {
    logger.error("Customer validation interviews POST error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create interview"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

