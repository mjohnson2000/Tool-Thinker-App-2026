import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/client'
import { FRAMEWORK_ORDER } from '@/lib/frameworks'
import { logger } from '@/lib/logger'

/**
 * GET /api/projects/[projectId]/health
 * Calculate project health score and get next step suggestions
 */
export async function GET(
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

    // Get project
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Verify project belongs to user
    if (String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Project does not belong to user" },
        { status: 403 }
      )
    }

    // Get all steps
    const stepStatuses = []
    let completedSteps = 0
    let startedSteps = 0
    let nextIncompleteStep: string | null = null

    for (const stepKey of FRAMEWORK_ORDER) {
      const step = await db.getStep(params.projectId, stepKey)
      const status = step?.status || 'not_started'
      
      stepStatuses.push({
        stepKey,
        status,
        title: stepKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      })

      if (status === 'completed') {
        completedSteps++
      } else if (status === 'in_progress' || status === 'started') {
        startedSteps++
        if (!nextIncompleteStep) {
          nextIncompleteStep = stepKey
        }
      } else if (!nextIncompleteStep) {
        nextIncompleteStep = stepKey
      }
    }

    // Calculate completion percentage
    const totalSteps = FRAMEWORK_ORDER.length
    const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    // Get additional data for health score
    const { data: tags } = await supabase
      .from('project_tags')
      .select('*')
      .eq('project_id', params.projectId)
      .catch(() => ({ data: [] }))

    const { data: notes } = await supabase
      .from('project_notes')
      .select('*')
      .eq('project_id', params.projectId)
      .catch(() => ({ data: [] }))

    // Calculate health score (simplified version)
    let healthScore = completionPercentage * 0.6 // 60% weight on completion
    if (tags && tags.length > 0) healthScore += 10 // 10% for tags
    if (notes && notes.length > 0) healthScore += 10 // 10% for notes
    if (project.description) healthScore += 10 // 10% for description
    if (project.updated_at) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceUpdate <= 7) healthScore += 10 // 10% for recent activity
    }

    healthScore = Math.min(100, Math.round(healthScore))

    // Determine health status
    let healthStatus: 'excellent' | 'good' | 'needs_attention' = 'needs_attention'
    if (healthScore >= 80) healthStatus = 'excellent'
    else if (healthScore >= 50) healthStatus = 'good'

    // Get next step suggestion
    let nextStepSuggestion: string | null = null
    if (nextIncompleteStep) {
      const frameworkTitles: Record<string, string> = {
        jtbd: 'Jobs-to-be-Done',
        value_prop: 'Value Proposition',
        business_model: 'Business Model',
      }
      nextStepSuggestion = frameworkTitles[nextIncompleteStep] || nextIncompleteStep
    }

    return NextResponse.json({
      healthScore,
      healthStatus,
      completionPercentage,
      completedSteps,
      totalSteps,
      nextStep: nextIncompleteStep,
      nextStepSuggestion,
      stepStatuses,
    })
  } catch (error: unknown) {
    logger.error("Error calculating project health:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to calculate project health"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

