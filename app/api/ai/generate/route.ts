import { NextRequest, NextResponse } from "next/server"
import { generateStreaming } from "@/lib/ai/streaming"
import { getFramework } from "@/lib/frameworks"
import { db, getOrCreateStep } from "@/lib/db/client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, stepKey, inputs } = body

    if (!projectId || !stepKey || !inputs) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const framework = getFramework(stepKey)
    if (!framework) {
      return NextResponse.json(
        { error: "Framework not found" },
        { status: 404 }
      )
    }

    // Get or create step
    const step = await getOrCreateStep(projectId, stepKey)
    
    // Update step status
    await db.updateStepStatus(step.id, "in_progress")

    // Generate streaming response
    const stream = await generateStreaming(framework, inputs)

    // Create a new readable stream that also saves the output
    let fullContent = ""
    const reader = stream.getReader()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            fullContent += chunk
            controller.enqueue(value)
          }

          // Try to parse and save the output
          try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, fullContent]
            const jsonStr = jsonMatch[1] || fullContent
            const parsed = JSON.parse(jsonStr.trim())

            // Get existing output to determine version
            const existingOutput = await db.getStepOutput(step.id)
            const version = existingOutput ? existingOutput.version + 1 : 1

            // Save output
            await db.createStepOutput(step.id, parsed, version)
            
            // Mark step as completed
            await db.updateStepStatus(step.id, "completed", new Date().toISOString())
          } catch (parseError) {
            console.error("Failed to parse AI output:", parseError)
            // Continue anyway - user can edit manually
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate output" },
      { status: 500 }
    )
  }
}



