import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update output" },
      { status: 500 }
    )
  }
}




