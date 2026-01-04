import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"

// For now, using a mock user ID - replace with actual auth
const MOCK_USER_ID = "user-1"

export async function GET(req: NextRequest) {
  try {
    const projects = await db.getProjects(MOCK_USER_ID)
    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(projects) ? projects : [])
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    // Return empty array instead of error object to prevent .map() errors
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      )
    }

    const project = await db.createProject(MOCK_USER_ID, name)
    await db.logEvent(MOCK_USER_ID, "project_created", { projectId: project.id }, project.id)
    
    return NextResponse.json(project)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    )
  }
}



