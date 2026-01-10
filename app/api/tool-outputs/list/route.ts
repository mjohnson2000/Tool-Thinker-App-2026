import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
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
    
    // Create an authenticated Supabase client with the user's token
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const { env } = await import('@/lib/env')
    
    const supabase = createSupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )
    
    // Validate token by getting user - pass token directly
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const toolId = searchParams.get("toolId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("tool_outputs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (toolId) {
      query = query.eq("tool_id", toolId)
    }

    const { data, error } = await query

    if (error) {
      logger.error("Failed to fetch tool outputs:", error)
      return NextResponse.json(
        { error: `Failed to fetch outputs: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ outputs: data || [] })
  } catch (error: unknown) {
    logger.error("Tool outputs list error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch tool outputs"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

