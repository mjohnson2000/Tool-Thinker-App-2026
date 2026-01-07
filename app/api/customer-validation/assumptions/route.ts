import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * GET /api/customer-validation/assumptions
 * Get all validation assumptions for the authenticated user
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
      .from("validation_assumptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data: assumptions, error } = await query

    if (error) {
      logger.error("Failed to fetch assumptions:", error)
      return NextResponse.json(
        { error: `Failed to fetch assumptions: ${error.message}` },
        { status: 500 }
      )
    }

    // Get evidence counts for each assumption
    const assumptionsWithCounts = await Promise.all(
      (assumptions || []).map(async (assumption) => {
        const { count } = await supabase
          .from("assumption_evidence")
          .select("*", { count: "exact", head: true })
          .eq("assumption_id", assumption.id)
        
        return {
          ...assumption,
          evidence_count: count || assumption.evidence_count || 0
        }
      })
    )

    return NextResponse.json({ assumptions: assumptionsWithCounts })
  } catch (error: unknown) {
    logger.error("Customer validation assumptions GET error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch assumptions"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * POST /api/customer-validation/assumptions
 * Create a new validation assumption
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
      assumption_text,
      assumption_category,
      confidence_level,
      project_id,
    } = body

    if (!assumption_text || !assumption_text.trim()) {
      return NextResponse.json(
        { error: "Assumption text is required" },
        { status: 400 }
      )
    }

    // Generate ID
    const id = `assumption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const assumption = {
      id,
      user_id: user.id,
      project_id: project_id || null,
      assumption_text: assumption_text.trim(),
      assumption_category: assumption_category || "other",
      validation_status: "unvalidated",
      confidence_level: confidence_level || null,
      evidence_count: 0,
    }

    const { data, error } = await supabase
      .from("validation_assumptions")
      .insert(assumption)
      .select()
      .single()

    if (error) {
      logger.error("Failed to create assumption:", error)
      return NextResponse.json(
        { error: `Failed to create assumption: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ assumption: data })
  } catch (error: unknown) {
    logger.error("Customer validation assumptions POST error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create assumption"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

