import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db, getOrCreateStep } from "@/lib/db/client"
import { logger } from "@/lib/logger"

/**
 * POST /api/projects/from-discovery
 * Create a project from Idea Discovery data and pre-fill the first step (JTBD)
 */
export async function POST(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { 
      projectName,
      discoveryData 
    } = body

    if (!projectName) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      )
    }

    if (!discoveryData) {
      return NextResponse.json(
        { error: "Discovery data is required" },
        { status: 400 }
      )
    }

    // Create the project
    const project = await db.createProject(user.id, projectName)
    await db.logEvent(user.id, "project_created", { 
      projectId: project.id,
      source: "idea_discovery"
    }, project.id)

    // Pre-fill the first step (JTBD) with discovery data
    const step = await getOrCreateStep(project.id, "jtbd")
    
    // Map discovery data to JTBD inputs (matching the framework's question IDs)
    const jtbdInputs: Record<string, any> = {}
    
    // Map to JTBD framework fields:
    // - "who" -> customer (comprehensive description with pain points)
    // - "pain" -> problem statement + pain points
    // - "situation" -> job context (when/where the problem happens)
    // - "current_solution" -> existing solutions or workarounds
    
    // WHO: Build comprehensive customer description
    if (discoveryData.selectedCustomer) {
      let whoText = discoveryData.selectedCustomer.title
      
      if (discoveryData.selectedCustomer.description) {
        whoText += `\n\n${discoveryData.selectedCustomer.description}`
      }
      
      // Include pain points in the "who" field to give full context
      if (discoveryData.selectedCustomer.painPoints && discoveryData.selectedCustomer.painPoints.length > 0) {
        whoText += `\n\nKey Pain Points:\n${discoveryData.selectedCustomer.painPoints.map(p => `• ${p}`).join('\n')}`
      }
      
      jtbdInputs.who = whoText
    }
    
    // PAIN: Problem statement with context
    if (discoveryData.selectedJob) {
      let painText = ""
      
      if (discoveryData.selectedJob.problemStatement) {
        painText = discoveryData.selectedJob.problemStatement
      } else if (discoveryData.selectedJob.description) {
        painText = discoveryData.selectedJob.description
      }
      
      // Add job title for context
      if (discoveryData.selectedJob.title) {
        painText = `Job: ${discoveryData.selectedJob.title}\n\n${painText}`
      }
      
      jtbdInputs.pain = painText
    }
    
    // SITUATION: When/where the problem occurs (use job description as context)
    if (discoveryData.selectedJob) {
      let situationText = ""
      
      if (discoveryData.selectedJob.description) {
        situationText = discoveryData.selectedJob.description
      } else if (discoveryData.selectedJob.title) {
        situationText = `When trying to: ${discoveryData.selectedJob.title}`
      }
      
      // Add business context if available
      if (discoveryData.selectedBusinessArea) {
        situationText += `\n\nBusiness Context: ${discoveryData.selectedBusinessArea.title} - ${discoveryData.selectedBusinessArea.description}`
      }
      
      jtbdInputs.situation = situationText
    }
    
    // CURRENT_SOLUTION: Existing solutions or workarounds
    if (discoveryData.selectedSolution) {
      let solutionText = `Potential Solution Approach: ${discoveryData.selectedSolution.title}`
      
      if (discoveryData.selectedSolution.description) {
        solutionText += `\n\n${discoveryData.selectedSolution.description}`
      }
      
      if (discoveryData.selectedSolution.keyFeatures && discoveryData.selectedSolution.keyFeatures.length > 0) {
        solutionText += `\n\nKey Features:\n${discoveryData.selectedSolution.keyFeatures.map(f => `• ${f}`).join('\n')}`
      }
      
      jtbdInputs.current_solution = solutionText
    } else {
      // If no solution selected, provide a placeholder
      jtbdInputs.current_solution = "No specific solution identified yet. This will be developed through the planning process."
    }

    // Save the pre-filled inputs
    if (Object.keys(jtbdInputs).length > 0) {
      await db.upsertStepInputs(step.id, jtbdInputs)
      await db.updateStepStatus(step.id, "in_progress")
    }
    
    return NextResponse.json({ 
      success: true, 
      project,
      message: "Project created with discovery data pre-filled"
    })
  } catch (error: unknown) {
    logger.error("Error creating project from discovery:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create project from discovery"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

