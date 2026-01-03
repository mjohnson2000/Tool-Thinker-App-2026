import { NextRequest, NextResponse } from "next/server"
import { db, getOrCreateStep } from "@/lib/db/client"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const stepKey = searchParams.get("stepKey")

    if (!projectId || !stepKey) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const step = await getOrCreateStep(projectId, stepKey)
    const stepInputs = await db.getStepInputs(step.id)
    const stepOutput = await db.getStepOutput(step.id)

    return NextResponse.json({
      step,
      inputs: stepInputs?.data || {},
      output: stepOutput?.user_edited_output || stepOutput?.ai_output || null,
      outputId: stepOutput?.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch step" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, stepKey, inputs } = body

    if (!projectId || !stepKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const step = await getOrCreateStep(projectId, stepKey)
    
    if (inputs) {
      await db.upsertStepInputs(step.id, inputs)
      await db.updateStepStatus(step.id, "in_progress")
    }

    // Get step inputs and output
    const stepInputs = await db.getStepInputs(step.id)
    const stepOutput = await db.getStepOutput(step.id)

    return NextResponse.json({
      step,
      inputs: stepInputs?.data || {},
      output: stepOutput?.user_edited_output || stepOutput?.ai_output || null,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update step" },
      { status: 500 }
    )
  }
}
