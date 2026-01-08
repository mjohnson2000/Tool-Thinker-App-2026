import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db/client"
import { logger } from "@/lib/logger"

/**
 * GET /api/projects/[projectId]/activity
 * Get project activity feed
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Check access
    const access = await db.checkProjectAccess(params.projectId, user.id)
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Forbidden - No access to this project" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const activity = await db.getProjectActivity(params.projectId, limit)

    return NextResponse.json({ activity })
  } catch (error: unknown) {
    logger.error("Error fetching project activity:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch activity"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

