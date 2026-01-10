import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, getOrCreateStep } from '@/lib/db/client'
import { FRAMEWORK_ORDER } from '@/lib/frameworks'
import { logger } from '@/lib/logger'

/**
 * POST /api/projects/[projectId]/duplicate
 * Duplicate a project with all its steps, inputs, and outputs
 */
export async function POST(
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

    // Get original project
    const originalProject = await db.getProjectById(params.projectId)
    if (!originalProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Verify project belongs to user
    if (String(originalProject.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Project does not belong to user" },
        { status: 403 }
      )
    }

    // Get request body for optional new name
    const body = await req.json().catch(() => ({}))
    const newName = body.name || `${originalProject.name} (Copy)`

    // Create new project
    const newProject = await db.createProject(String(user.id), newName)

    // Copy all steps, inputs, and outputs
    for (const stepKey of FRAMEWORK_ORDER) {
      const originalStep = await db.getStep(params.projectId, stepKey)
      if (!originalStep) continue

      // Create new step
      const newStep = await getOrCreateStep(newProject.id, stepKey)
      
      // Copy step status
      if (originalStep.status) {
        await db.updateStep(newStep.id, {
          status: originalStep.status,
          started_at: originalStep.started_at,
          completed_at: originalStep.completed_at,
        })
      }

      // Copy step inputs
      const originalInputs = await db.getStepInputs(originalStep.id)
      if (originalInputs && originalInputs.data) {
        await db.saveStepInputs(newStep.id, originalInputs.data)
      }

      // Copy step outputs
      const originalOutput = await db.getStepOutput(originalStep.id)
      if (originalOutput) {
        await db.saveStepOutput(newStep.id, {
          ai_output: originalOutput.ai_output,
          user_edited_output: originalOutput.user_edited_output || originalOutput.ai_output,
          version: 1,
        })
      }
    }

    // Copy project tags if they exist
    try {
      const { data: tags } = await supabase
        .from('project_tags')
        .select('*')
        .eq('project_id', params.projectId)
      
      if (tags && tags.length > 0) {
        const newTags = tags.map(tag => ({
          id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          project_id: newProject.id,
          tag: tag.tag,
          color: tag.color,
        }))
        
        await supabase
          .from('project_tags')
          .insert(newTags)
      }
    } catch (error) {
      // Tags table might not exist, continue without error
      logger.debug("Could not copy tags:", error)
    }

    // Log activity
    try {
      await db.logProjectActivity(
        newProject.id,
        String(user.id),
        'project_created',
        `Project duplicated from "${originalProject.name}"`,
        { duplicated_from: params.projectId }
      )
    } catch (error) {
      // Activity logging is optional
      logger.debug("Could not log activity:", error)
    }

    return NextResponse.json({
      project: newProject,
      message: "Project duplicated successfully"
    })
  } catch (error: unknown) {
    logger.error("Error duplicating project:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to duplicate project"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

