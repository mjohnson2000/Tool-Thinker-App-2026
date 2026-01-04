#!/bin/bash
# Fix "Failed to generate output" error on server

cd ~/tool-thinker || exit

echo "🔧 Fixing AI generation error..."

# Step 1: Check OpenAI API key
echo "🔐 Checking OpenAI API key..."
if [ -f .env ]; then
  if grep -q "OPENAI_API_KEY=your_openai" .env || grep -q "OPENAI_API_KEY=$" .env || ! grep -q "OPENAI_API_KEY=" .env; then
    echo "⚠️  OPENAI_API_KEY is missing or has placeholder value!"
    echo ""
    echo "Please update .env with your actual OpenAI API key:"
    echo "  OPENAI_API_KEY=sk-..."
    echo ""
    read -p "Press Enter after updating .env (or Ctrl+C to exit)..."
  else
    echo "✅ OPENAI_API_KEY found in .env"
  fi
else
  echo "⚠️  .env file not found!"
  exit 1
fi

# Step 2: Improve error handling in API route
echo ""
echo "📝 Improving error handling in AI generation API..."

cat > app/api/ai/generate/route.ts << 'APIEOF'
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
          console.error("Stream error:", error)
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
      { error: error.message || "Failed to generate output. Please check the server logs for details." },
      { status: 500 }
    )
  }
}
APIEOF

# Step 3: Improve error handling in streaming.ts
echo ""
echo "📝 Improving error handling in streaming library..."

cat > lib/ai/streaming.ts << 'STREAMEOF'
import { OpenAI } from "openai"
import { buildPrompt, repairJsonPrompt } from "./promptTemplates"
import type { Framework } from "@/types/frameworks"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateStreaming(
  framework: Framework,
  inputs: Record<string, any>
): Promise<ReadableStream<Uint8Array>> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.")
  }

  const prompt = buildPrompt(framework, inputs)

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a startup strategist. Always return valid JSON matching the requested schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
      temperature: 0.7,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Stream processing error:", error)
          controller.error(error)
        }
      },
    })

    return stream
  } catch (error: any) {
    console.error("OpenAI API call failed:", error)
    
    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env")
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.")
    } else if (error.status === 500) {
      throw new Error("OpenAI API server error. Please try again later.")
    } else {
      throw new Error(`OpenAI API error: ${error.message || "Unknown error"}`)
    }
  }
}

export async function generateAndParse(
  framework: Framework,
  inputs: Record<string, any>
): Promise<Record<string, any>> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
    throw new Error("OpenAI API key is not configured")
  }

  const prompt = buildPrompt(framework, inputs)

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a startup strategist. Always return valid JSON matching the requested schema.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  })

  const content = completion.choices[0]?.message?.content || ""
  
  // Try to parse JSON
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content]
    const jsonStr = jsonMatch[1] || content
    return JSON.parse(jsonStr.trim())
  } catch (error) {
    // Try to repair
    const repairCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: repairJsonPrompt(content),
        },
      ],
      temperature: 0.3,
    })
    
    const repaired = repairCompletion.choices[0]?.message?.content || ""
    const repairedJson = repaired.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, repaired]
    return JSON.parse((repairedJson[1] || repaired).trim())
  }
}
STREAMEOF

# Step 4: Rebuild
echo ""
echo "🔨 Rebuilding application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🔄 Restarting PM2..."
    pm2 restart tool-thinker
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ AI Generation Error Handling Improved!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 What was fixed:"
    echo "  ✅ Better error messages for missing API key"
    echo "  ✅ Better error handling for OpenAI API errors"
    echo "  ✅ More detailed logging for debugging"
    echo ""
    echo "⚠️  Make sure OPENAI_API_KEY is set in .env:"
    echo "   OPENAI_API_KEY=sk-your-actual-key-here"
    echo ""
    echo "📊 Check PM2 logs if errors persist:"
    echo "   pm2 logs tool-thinker"
else
    echo "❌ Build failed - check errors above"
    exit 1
fi

