import { NextRequest, NextResponse } from "next/server"
import { generateStreaming } from "@/lib/ai/streaming"
import { getFramework } from "@/lib/frameworks"
import { db, getOrCreateStep } from "@/lib/db/client"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, stepKey, inputs } = body

    if (!projectId || !stepKey || !inputs) {
      logger.error("Missing required fields:", { projectId, stepKey, inputs: !!inputs })
      return NextResponse.json(
        { error: "Missing required fields: projectId, stepKey, and inputs are required" },
        { status: 400 }
      )
    }

    // Check OpenAI API key
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === "your_openai_key_here") {
      logger.error("OpenAI API key not configured")
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const framework = getFramework(stepKey)
    if (!framework) {
      logger.error("Framework not found for stepKey:", stepKey)
      return NextResponse.json(
        { error: `Framework not found for step: ${stepKey}` },
        { status: 404 }
      )
    }

    // Get or create step
    let step
    try {
      step = await getOrCreateStep(projectId, stepKey)
    } catch (dbError: unknown) {
      logger.error("Database error creating step:", dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : "Failed to create step"
      return NextResponse.json(
        { error: `Database error: ${errorMessage}` },
        { status: 500 }
      )
    }
    
    // Update step status
    try {
      await db.updateStepStatus(step.id, "in_progress")
    } catch (dbError: unknown) {
      logger.error("Database error updating step:", dbError)
      // Continue anyway - step status update is not critical
    }

    // Generate streaming response
    let stream
    try {
      stream = await generateStreaming(framework, inputs)
    } catch (aiError: unknown) {
      logger.error("OpenAI API error:", aiError)
      
      // Reset step status
      try {
        await db.updateStepStatus(step.id, "not_started")
      } catch (resetError) {
        logger.error("Failed to reset step status:", resetError)
        // Continue - step status reset is not critical
      }
      
      const errorMessage = aiError instanceof Error 
        ? aiError.message 
        : "Failed to generate output. Please check your OpenAI API key and try again."
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

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
            logger.error("Failed to parse AI output:", parseError)
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
  } catch (error: unknown) {
    logger.error("AI generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate output"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}



