import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db/client"
import { FRAMEWORK_ORDER } from "@/lib/frameworks"
import { generateRecommendations, detectRisks, type ProjectAnalysis } from "@/lib/project-recommendations"

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    // Create an authenticated Supabase client
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
    const { env } = await import("@/lib/env")

    const supabase = createSupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    // Validate token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Get project
    const project = await db.getProjectById(params.projectId)

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Project does not belong to you" },
        { status: 403 }
      )
    }

    // Get step data
    let completedSteps = 0
    let nextIncompleteStep: string | null = null
    const completedStepKeys: string[] = []

    for (const stepKey of FRAMEWORK_ORDER) {
      const step = await db.getStep(params.projectId, stepKey)
      const status = step?.status || "not_started"

      if (status === "completed") {
        completedSteps++
        completedStepKeys.push(stepKey)
      } else if (!nextIncompleteStep) {
        nextIncompleteStep = stepKey
      }
    }

    const totalSteps = FRAMEWORK_ORDER.length
    const completionPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    // Get additional data
    const { data: tags } = await supabase
      .from("project_tags")
      .select("*")
      .eq("project_id", params.projectId)
      .catch(() => ({ data: [] }))

    const { data: notes } = await supabase
      .from("project_notes")
      .select("*")
      .eq("project_id", params.projectId)
      .catch(() => ({ data: [] }))

    // Calculate health score
    let healthScore = completionPercentage * 0.6
    if (tags && tags.length > 0) healthScore += 10
    if (notes && notes.length > 0) healthScore += 10
    if (project.description) healthScore += 10
    if (project.updated_at) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceUpdate <= 7) healthScore += 10
    }

    healthScore = Math.min(100, Math.round(healthScore))

    // Calculate days since update
    const daysSinceUpdate = project.updated_at
      ? Math.floor(
          (Date.now() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      : undefined

    // Build analysis
    const analysis: ProjectAnalysis = {
      projectId: params.projectId,
      projectName: project.name,
      status: project.status || "draft",
      healthScore,
      completionPercentage,
      lastActivity: project.updated_at,
      completedSteps,
      totalSteps,
      nextIncompleteStep,
      daysSinceUpdate,
      hasDescription: !!project.description,
      hasTags: (tags?.length || 0) > 0,
      hasNotes: (notes?.length || 0) > 0,
    }

    // Generate recommendations
    const recommendations = generateRecommendations(analysis)
    const risks = detectRisks(analysis)

    return NextResponse.json({
      recommendations,
      risks,
      analysis: {
        healthScore,
        completionPercentage,
        completedSteps,
        totalSteps,
        nextIncompleteStep,
        daysSinceUpdate,
      },
    })
  } catch (error: unknown) {
    logger.error("Error fetching recommendations:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch recommendations"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

