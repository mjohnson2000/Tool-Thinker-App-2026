import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
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
    const supabase = createClient()
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Get user preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No preferences found, return defaults
        return NextResponse.json({
          preferences: {
            emailNotifications: true,
            autoSave: true,
          },
        })
      }
      logger.error("Failed to fetch user preferences:", error)
      return NextResponse.json(
        { error: `Failed to fetch preferences: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ preferences: data.preferences || {} })
  } catch (error: unknown) {
    logger.error("User preferences GET error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch user preferences"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

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
    const { preferences } = body

    if (!preferences) {
      return NextResponse.json(
        { error: "Preferences object is required" },
        { status: 400 }
      )
    }

    // Generate ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Upsert preferences (insert or update)
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert({
        id,
        user_id: user.id,
        preferences,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      })
      .select()
      .single()

    if (error) {
      logger.error("Failed to save user preferences:", error)
      return NextResponse.json(
        { error: `Failed to save preferences: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, preferences: data.preferences })
  } catch (error: unknown) {
    logger.error("User preferences POST error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to save user preferences"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

