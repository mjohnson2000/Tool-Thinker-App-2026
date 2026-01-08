import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { logger } from "@/lib/logger"

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { outputId, userEditedOutput } = body

    if (!outputId || !userEditedOutput) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const updated = await db.updateStepOutput(outputId, userEditedOutput)
    return NextResponse.json(updated)
  } catch (error: unknown) {
    logger.error("Failed to update output:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update output"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




