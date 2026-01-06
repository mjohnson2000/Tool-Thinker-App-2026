import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data, error } = await supabase
      .from("tool_outputs")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Output not found" },
          { status: 404 }
        )
      }
      logger.error("Failed to fetch tool output:", error)
      return NextResponse.json(
        { error: `Failed to fetch output: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ output: data })
  } catch (error: unknown) {
    logger.error("Tool output fetch error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch tool output"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from("tool_outputs")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      logger.error("Failed to delete tool output:", error)
      return NextResponse.json(
        { error: `Failed to delete output: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error("Tool output delete error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete tool output"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

