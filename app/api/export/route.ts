import { NextRequest, NextResponse } from "next/server"
import { db, getOrCreateStep } from "@/lib/db/client"
import { FRAMEWORK_ORDER, getFramework } from "@/lib/frameworks"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      )
    }

    const project = await db.getProjectById(projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Collect all step outputs
    const sections: string[] = []
    sections.push(`# ${project.name}\n`)
    sections.push(`**Generated:** ${new Date().toLocaleDateString()}\n`)
    sections.push("---\n")

    for (const stepKey of FRAMEWORK_ORDER) {
      const step = await getOrCreateStep(projectId, stepKey)
      const stepOutput = await db.getStepOutput(step.id)
      const framework = getFramework(stepKey)

      if (stepOutput) {
        const output = stepOutput.user_edited_output || stepOutput.ai_output
        sections.push(`## ${framework?.title || stepKey}\n`)

        for (const [key, value] of Object.entries(output)) {
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          sections.push(`### ${label}\n`)

          if (Array.isArray(value)) {
            value.forEach((item) => {
              sections.push(`- ${item}\n`)
            })
          } else {
            sections.push(`${value}\n`)
          }
          sections.push("\n")
        }
        sections.push("---\n")
      }
    }

    const markdown = sections.join("\n")

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${project.name}-startup-brief.md"`,
      },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to export"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




