import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/client'
import { FRAMEWORK_ORDER } from '@/lib/frameworks'
import { logger } from '@/lib/logger'

/**
 * POST /api/projects/compare
 * Compare multiple projects side by side
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
    const { projectIds } = body

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length < 2) {
      return NextResponse.json(
        { error: "At least 2 project IDs are required" },
        { status: 400 }
      )
    }

    if (projectIds.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 projects can be compared at once" },
        { status: 400 }
      )
    }

    // Get all projects and verify ownership
    const projects = []
    for (const projectId of projectIds) {
      const project = await db.getProjectById(projectId)
      if (!project) {
        return NextResponse.json(
          { error: `Project ${projectId} not found` },
          { status: 404 }
        )
      }

      if (String(project.user_id) !== String(user.id)) {
        return NextResponse.json(
          { error: "Unauthorized - Project does not belong to user" },
          { status: 403 }
        )
      }

      // Get step data for each project
      const stepData: Record<string, any> = {}
      for (const stepKey of FRAMEWORK_ORDER) {
        const step = await db.getStep(projectId, stepKey)
        if (step) {
          const inputs = await db.getStepInputs(step.id)
          const output = await db.getStepOutput(step.id)
          
          stepData[stepKey] = {
            status: step.status,
            inputs: inputs?.data || {},
            output: output?.user_edited_output || output?.ai_output || {},
          }
        }
      }

      projects.push({
        id: project.id,
        name: project.name,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        steps: stepData,
      })
    }

    // Calculate comparison metrics
    const comparison = {
      projects,
      metrics: {
        completionRates: projects.map(p => {
          const completed = Object.values(p.steps).filter((s: any) => s.status === 'completed').length
          return {
            projectId: p.id,
            projectName: p.name,
            rate: Math.round((completed / FRAMEWORK_ORDER.length) * 100),
          }
        }),
        statusDistribution: projects.reduce((acc: Record<string, number>, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1
          return acc
        }, {}),
      },
    }

    return NextResponse.json(comparison)
  } catch (error: unknown) {
    logger.error("Error comparing projects:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to compare projects"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

