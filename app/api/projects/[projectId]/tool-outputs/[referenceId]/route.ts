import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * DELETE /api/projects/[projectId]/tool-outputs/[referenceId]
 * Unlink a tool output from a project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; referenceId: string } }
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

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", params.projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Compare user_id (projects uses TEXT, user.id is UUID string)
    if (String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Project does not belong to user" },
        { status: 403 }
      )
    }

    // Delete reference
    const { error } = await supabase
      .from("project_tool_references")
      .delete()
      .eq("id", params.referenceId)
      .eq("project_id", params.projectId)

    if (error) {
      logger.error("Failed to unlink tool output:", error)
      return NextResponse.json(
        { error: `Failed to unlink tool output: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error("Project tool outputs DELETE error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to unlink tool output"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

