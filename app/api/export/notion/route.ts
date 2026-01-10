import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, getOrCreateStep } from '@/lib/db/client'
import { FRAMEWORK_ORDER, getFramework } from '@/lib/frameworks'
import { logger } from '@/lib/logger'

/**
 * POST /api/export/notion
 * Export project to Notion format
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

    // Build Notion-compatible markdown
    const blocks: any[] = []

    // Title
    blocks.push({
      object: "block",
      type: "heading_1",
      heading_1: {
        rich_text: [{ type: "text", text: { content: project.name } }],
      },
    })

    // Metadata
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: `Status: ${project.status}` } },
        ],
      },
    })

    // Add each step
    for (const stepKey of FRAMEWORK_ORDER) {
      const step = await getOrCreateStep(projectId, stepKey)
      const stepOutput = await db.getStepOutput(step.id)
      const framework = getFramework(stepKey)

      if (stepOutput && framework) {
        // Step heading
        blocks.push({
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: framework.title } }],
          },
        })

        // Step content
        const output = stepOutput.user_edited_output || stepOutput.ai_output
        for (const [key, value] of Object.entries(output)) {
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          
          blocks.push({
            object: "block",
            type: "heading_3",
            heading_3: {
              rich_text: [{ type: "text", text: { content: label } }],
            },
          })

          if (Array.isArray(value)) {
            value.forEach((item) => {
              blocks.push({
                object: "block",
                type: "bulleted_list_item",
                bulleted_list_item: {
                  rich_text: [{ type: "text", text: { content: String(item) } }],
                },
              })
            })
          } else {
            blocks.push({
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [{ type: "text", text: { content: String(value) } }],
              },
            })
          }
        }
      }
    }

    // Return as JSON for Notion API
    return NextResponse.json({
      blocks,
      project: {
        id: project.id,
        name: project.name,
      },
      format: "notion",
    })
  } catch (error: unknown) {
    logger.error("Error exporting to Notion:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to export to Notion"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

