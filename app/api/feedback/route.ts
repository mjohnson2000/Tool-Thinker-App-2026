import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit feedback" },
      { status: 500 }
    )
  }
}



