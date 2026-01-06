import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

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
    const { toolId, toolName, outputData, inputData, metadata } = body

    if (!toolId || !toolName || !outputData) {
      return NextResponse.json(
        { error: "Missing required fields: toolId, toolName, and outputData are required" },
        { status: 400 }
      )
    }

    // Generate ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabase
      .from("tool_outputs")
      .insert({
        id,
        user_id: user.id,
        tool_id: toolId,
        tool_name: toolName,
        output_data: outputData,
        input_data: inputData || null,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      logger.error("Failed to save tool output:", error)
      return NextResponse.json(
        { error: `Failed to save output: ${error.message}` },
        { status: 500 }
      )
    }

    // Log history
    await supabase.from("tool_history").insert({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      tool_id: toolId,
      tool_name: toolName,
      action: "generated",
      metadata: metadata || {},
    })

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    logger.error("Tool output save error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to save tool output"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

