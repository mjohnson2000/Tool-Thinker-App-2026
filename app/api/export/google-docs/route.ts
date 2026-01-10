import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, getOrCreateStep } from '@/lib/db/client'
import { FRAMEWORK_ORDER, getFramework } from '@/lib/frameworks'
import { logger } from '@/lib/logger'

/**
 * POST /api/export/google-docs
 * Export project to Google Docs format (HTML that can be imported)
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      )
    }

    // Get project
    const project = await db.getProjectById(projectId)
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

    // Build HTML document
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${project.name}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    h3 { color: #555; margin-top: 20px; }
    p { line-height: 1.6; color: #333; }
    ul { margin: 10px 0; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
  <h1>${project.name}</h1>
  <p><strong>Status:</strong> ${project.status}</p>
  <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
  <hr>
`

    // Add each step
    for (const stepKey of FRAMEWORK_ORDER) {
      const step = await getOrCreateStep(projectId, stepKey)
      const stepOutput = await db.getStepOutput(step.id)
      const framework = getFramework(stepKey)

      if (stepOutput && framework) {
        html += `  <h2>${framework.title}</h2>\n`

        const output = stepOutput.user_edited_output || stepOutput.ai_output
        for (const [key, value] of Object.entries(output)) {
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          
          html += `  <h3>${label}</h3>\n`

          if (Array.isArray(value)) {
            html += `  <ul>\n`
            value.forEach((item) => {
              html += `    <li>${String(item)}</li>\n`
            })
            html += `  </ul>\n`
          } else {
            html += `  <p>${String(value)}</p>\n`
          }
        }
      }
    }

    html += `</body>
</html>`

    // Return HTML
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${project.name}-google-docs.html"`,
      },
    })
  } catch (error: unknown) {
    logger.error("Error exporting to Google Docs:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to export to Google Docs"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

