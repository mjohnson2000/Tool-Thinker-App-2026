import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { stepId, ratingClarity, ratingUsefulness, notes } = body

    if (!stepId || !ratingClarity || !ratingUsefulness) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const feedback = await db.addFeedback(
      stepId,
      ratingClarity,
      ratingUsefulness,
      notes
    )

    return NextResponse.json(feedback)
  } catch (error: unknown) {
    logger.error("Failed to submit feedback:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to submit feedback"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




