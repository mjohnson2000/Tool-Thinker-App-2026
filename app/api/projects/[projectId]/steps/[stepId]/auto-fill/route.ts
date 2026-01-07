import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { getAutoFillSuggestions, extractDataForMapping, getMappingsForToolAndStep } from "@/lib/tool-guidance/auto-fill-mapping"

/**
 * POST /api/projects/[projectId]/steps/[stepId]/auto-fill
 * Auto-fill step inputs from a linked tool output
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string; stepId: string } }
) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { toolOutputId, fieldMappings } = await req.json()

    if (!toolOutputId) {
      return NextResponse.json(
        { error: "toolOutputId is required" },
        { status: 400 }
      )
    }

    // Get the tool output
    const { data: toolOutput, error: outputError } = await supabase
      .from("tool_outputs")
      .select("*")
      .eq("id", toolOutputId)
      .eq("user_id", user.id)
      .single()

    if (outputError || !toolOutput) {
      logger.error("Failed to fetch tool output:", outputError)
      return NextResponse.json(
        { error: "Tool output not found" },
        { status: 404 }
      )
    }

    // Get the step to find stepKey
    const { data: step, error: stepError } = await supabase
      .from("steps")
      .select("*")
      .eq("id", params.stepId)
      .eq("project_id", params.projectId)
      .single()

    if (stepError || !step) {
      logger.error("Failed to fetch step:", stepError)
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get mappings for this tool and step
    const mappings = getMappingsForToolAndStep(
      toolOutput.tool_id,
      step.step_key
    )

    if (mappings.length === 0) {
      return NextResponse.json(
        { error: "No auto-fill mappings available for this tool and step" },
        { status: 400 }
      )
    }

    // Extract data based on mappings
    const autoFillData: Record<string, string> = {}

    // If specific field mappings provided, use those
    if (fieldMappings && Array.isArray(fieldMappings)) {
      for (const mapping of fieldMappings) {
        const mappingDef = mappings.find((m) => m.stepField === mapping.field)
        if (mappingDef) {
          const value = extractDataForMapping(
            toolOutput.output_data,
            mappingDef
          )
          if (value) {
            autoFillData[mapping.field] = value
          }
        }
      }
    } else {
      // Auto-fill all available mappings
      for (const mapping of mappings) {
        const value = extractDataForMapping(toolOutput.output_data, mapping)
        if (value) {
          // If field already has a value, append instead of replace
          const existingValue = step.inputs?.[mapping.stepField]
          if (existingValue && existingValue.trim()) {
            autoFillData[mapping.stepField] = `${existingValue}\n\n[From ${toolOutput.tool_name}]: ${value}`
          } else {
            autoFillData[mapping.stepField] = value
          }
        }
      }
    }

    if (Object.keys(autoFillData).length === 0) {
      return NextResponse.json(
        { error: "No data could be extracted from tool output" },
        { status: 400 }
      )
    }

    // Update step inputs
    const updatedInputs = {
      ...(step.inputs || {}),
      ...autoFillData,
    }

    const { error: updateError } = await supabase
      .from("steps")
      .update({ inputs: updatedInputs })
      .eq("id", params.stepId)

    if (updateError) {
      logger.error("Failed to update step inputs:", updateError)
      return NextResponse.json(
        { error: "Failed to update step inputs" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      filledFields: Object.keys(autoFillData),
      data: autoFillData,
    })
  } catch (error: unknown) {
    logger.error("Auto-fill error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to auto-fill step"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * GET /api/projects/[projectId]/steps/[stepId]/auto-fill
 * Get auto-fill suggestions for a tool output
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string; stepId: string } }
) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const toolOutputId = searchParams.get("toolOutputId")

    if (!toolOutputId) {
      return NextResponse.json(
        { error: "toolOutputId query parameter is required" },
        { status: 400 }
      )
    }

    // Get the tool output
    const { data: toolOutput, error: outputError } = await supabase
      .from("tool_outputs")
      .select("*")
      .eq("id", toolOutputId)
      .eq("user_id", user.id)
      .single()

    if (outputError || !toolOutput) {
      return NextResponse.json(
        { error: "Tool output not found" },
        { status: 404 }
      )
    }

    // Get the step
    const { data: step, error: stepError } = await supabase
      .from("steps")
      .select("*")
      .eq("id", params.stepId)
      .eq("project_id", params.projectId)
      .single()

    if (stepError || !step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }

    // Get suggestions
    const suggestions = getAutoFillSuggestions(
      toolOutput.tool_id,
      step.step_key,
      toolOutput.output_data
    )

    return NextResponse.json({ suggestions })
  } catch (error: unknown) {
    logger.error("Get auto-fill suggestions error:", error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to get auto-fill suggestions"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

