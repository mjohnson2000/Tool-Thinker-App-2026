import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * GET /api/projects/[projectId]/tool-outputs
 * Get all tool outputs linked to a project
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

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", params.projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Compare user_id (projects uses TEXT, user.id is UUID string)
    if (String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Project does not belong to user" },
        { status: 403 }
      )
    }

    // Get all tool references for this project
    const { data: references, error: refError } = await supabase
      .from("project_tool_references")
      .select("*")
      .eq("project_id", params.projectId)

    if (refError) {
      logger.error("Failed to fetch project tool references:", refError)
      return NextResponse.json(
        { error: `Failed to fetch references: ${refError.message}` },
        { status: 500 }
      )
    }

    // Fetch tool output data for each reference
    const referencesWithOutputs = await Promise.all(
      (references || []).map(async (ref) => {
        const { data: toolOutput } = await supabase
          .from("tool_outputs")
          .select("*")
          .eq("id", ref.tool_output_id)
          .single()
        
        return {
          ...ref,
          tool_outputs: toolOutput,
        }
      })
    )

    return NextResponse.json({ references: referencesWithOutputs || [] })
  } catch (error: unknown) {
    logger.error("Project tool outputs GET error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch tool outputs"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[projectId]/tool-outputs
 * Link a tool output to a project (and optionally a step)
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

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", params.projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Compare user_id (projects uses TEXT, user.id is UUID string)
    if (String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Project does not belong to user" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { tool_output_id, step_id, reference_type = 'context' } = body

    if (!tool_output_id) {
      return NextResponse.json(
        { error: "tool_output_id is required" },
        { status: 400 }
      )
    }

    // Verify tool output belongs to user
    const { data: toolOutput, error: toolError } = await supabase
      .from("tool_outputs")
      .select("id, user_id, tool_id, tool_name")
      .eq("id", tool_output_id)
      .single()

    if (toolError || !toolOutput) {
      return NextResponse.json(
        { error: "Tool output not found" },
        { status: 404 }
      )
    }

    if (toolOutput.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - Tool output does not belong to user" },
        { status: 403 }
      )
    }

    // If step_id is provided, verify it belongs to the project
    if (step_id) {
      const { data: step, error: stepError } = await supabase
        .from("steps")
        .select("id, project_id")
        .eq("id", step_id)
        .single()

      if (stepError || !step) {
        return NextResponse.json(
          { error: "Step not found" },
          { status: 404 }
        )
      }

      if (step.project_id !== params.projectId) {
        return NextResponse.json(
          { error: "Step does not belong to this project" },
          { status: 400 }
        )
      }
    }

    // Generate ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Insert reference
    const { data, error } = await supabase
      .from("project_tool_references")
      .insert({
        id,
        project_id: params.projectId,
        step_id: step_id || null,
        tool_output_id,
        tool_id: toolOutput.tool_id,
        tool_name: toolOutput.tool_name,
        reference_type,
      })
      .select()
      .single()

    if (error) {
      // If duplicate, return existing reference
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from("project_tool_references")
          .select("*")
          .eq("project_id", params.projectId)
          .eq("step_id", step_id || null)
          .eq("tool_output_id", tool_output_id)
          .single()
        
        return NextResponse.json({ success: true, data: existing, already_linked: true })
      }
      
      logger.error("Failed to link tool output to project:", error)
      return NextResponse.json(
        { error: `Failed to link tool output: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    logger.error("Project tool outputs POST error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to link tool output"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

