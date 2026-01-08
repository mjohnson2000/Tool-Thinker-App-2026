import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db/client"
import { logger } from "@/lib/logger"
import crypto from "crypto"

/**
 * POST /api/projects/[projectId]/share
 * Generate a shareable link for the project (read-only)
 */
export async function POST(
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

    // Get project
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Verify project belongs to user
    if (String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Project does not belong to user" },
        { status: 403 }
      )
    }

    // Generate a unique share token
    const shareToken = crypto.randomBytes(32).toString('hex')
    
    // Store share token in project metadata or a separate shares table
    // For now, we'll return the token and the frontend can construct the URL
    // In production, you'd want to store this in a database table
    
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/project/${params.projectId}?token=${shareToken}`

    return NextResponse.json({
      shareUrl,
      shareToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })
  } catch (error: unknown) {
    logger.error("Error generating share link:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate share link"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/projects/[projectId]/share?token=xxx
 * Verify and get project data for share link
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Missing share token" },
        { status: 400 }
      )
    }

    // In production, verify token from database
    // For now, we'll allow access (you should implement proper token verification)
    
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Return project data (read-only view)
    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        created_at: project.created_at,
      },
      // Add step data here if needed for read-only view
    })
  } catch (error: unknown) {
    logger.error("Error accessing shared project:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to access shared project"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

