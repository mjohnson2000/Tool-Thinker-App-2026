import { NextRequest, NextResponse } from "next/server"
import { generateStreaming } from "@/lib/ai/streaming"
import { getFramework } from "@/lib/frameworks"
import { db, getOrCreateStep } from "@/lib/db/client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, stepKey, inputs } = body

    if (!projectId || !stepKey || !inputs) {
      console.error("Missing required fields:", { projectId, stepKey, inputs: !!inputs })
      return NextResponse.json(
        { error: "Missing required fields: projectId, stepKey, and inputs are required" },
        { status: 400 }
      )
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
      console.error("OpenAI API key not configured")
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env" },
        { status: 500 }
      )
    }

    const framework = getFramework(stepKey)
    if (!framework) {
      console.error("Framework not found for stepKey:", stepKey)
      return NextResponse.json(
        { error: `Framework not found for step: ${stepKey}` },
        { status: 404 }
      )
    }

    // Get or create step
    let step
    try {
      step = await getOrCreateStep(projectId, stepKey)
    } catch (dbError: any) {
      console.error("Database error creating step:", dbError)
      return NextResponse.json(
        { error: `Database error: ${dbError.message || "Failed to create step"}` },
        { status: 500 }
      )
    }
    
    // Update step status
    try {
      await db.updateStepStatus(step.id, "in_progress")
    } catch (dbError: any) {
      console.error("Database error updating step:", dbError)
      // Continue anyway
    }

    // Generate streaming response
    let stream
    try {
      stream = await generateStreaming(framework, inputs)
    } catch (aiError: any) {
      console.error("OpenAI API error:", aiError)
      
      // Reset step status
      try {
        await db.updateStepStatus(step.id, "not_started")
      } catch (e) {
        // Ignore
      }
      
      return NextResponse.json(
        { 
          error: aiError.message || "Failed to generate output. Please check your OpenAI API key and try again." 
        },
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



