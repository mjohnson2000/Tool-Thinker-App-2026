import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(project)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch project" },
      { status: 500 }
    )
  }
}




