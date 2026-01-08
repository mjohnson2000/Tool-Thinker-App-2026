import { NextRequest, NextResponse } from "next/server"
import { db, getOrCreateStep } from "@/lib/db/client"
import { FRAMEWORK_ORDER, getFramework } from "@/lib/frameworks"

/**
 * GET /api/export/word?projectId=xxx
 * Export project as Word document (.docx format as HTML that Word can open)
 */
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
    
    // HTML header for Word compatibility
    sections.push(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${project.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    h3 { color: #3b82f6; margin-top: 20px; }
    ul { margin-left: 20px; }
    .section { margin-bottom: 30px; }
    .meta { color: #6b7280; font-size: 0.9em; }
  </style>
</head>
<body>`)
    
    sections.push(`<h1>${project.name}</h1>`)
    sections.push(`<p class="meta"><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>`)
    sections.push(`<hr>`)

    for (const stepKey of FRAMEWORK_ORDER) {
      const step = await getOrCreateStep(projectId, stepKey)
      const stepOutput = await db.getStepOutput(step.id)
      const framework = getFramework(stepKey)

      if (stepOutput) {
        const output = stepOutput.user_edited_output || stepOutput.ai_output
        sections.push(`<div class="section">`)
        sections.push(`<h2>${framework?.title || stepKey}</h2>`)

        for (const [key, value] of Object.entries(output)) {
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          sections.push(`<h3>${label}</h3>`)

          if (Array.isArray(value)) {
            sections.push(`<ul>`)
            value.forEach((item) => {
              sections.push(`<li>${escapeHtml(String(item))}</li>`)
            })
            sections.push(`</ul>`)
          } else {
            sections.push(`<p>${escapeHtml(String(value)).replace(/\n/g, '<br>')}</p>`)
          }
        }
        sections.push(`</div>`)
        sections.push(`<hr>`)
      }
    }

    sections.push(`</body></html>`)

    const html = sections.join("\n")

    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${project.name}-startup-plan.doc"`,
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

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

