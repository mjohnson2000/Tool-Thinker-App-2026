import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, type } = body

    if (!prompt || !type) {
      logger.error("Missing required fields:", { prompt: !!prompt, type })
      return NextResponse.json(
        { error: "Missing required fields: prompt and type are required" },
        { status: 400 }
      )
    }

    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === "your_openai_key_here") {
      logger.error("OpenAI API key not configured")
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Format the prompt with specific instructions based on type
    let systemPrompt = ""
    let responseFormat = ""

    switch (type) {
      case "business-areas":
        systemPrompt = `You are a business idea generator. Generate exactly 6 business areas based on user interests.
Return ONLY a valid JSON object with an "options" key containing an array of exactly 6 objects. Each object must have:
- id: string (lowercase, no spaces, e.g., "education-tech")
- title: string (short, clear name)
- description: string (2-3 sentences explaining the business area)
- icon: string (single relevant emoji)

Example format:
{"options": [{"id": "education-tech", "title": "Education Technology", "description": "Creating digital learning tools and platforms...", "icon": "📚"}]}`
        responseFormat = "json_object"
        break

      case "customers":
        systemPrompt = `You are a customer persona generator. Generate exactly 6 customer personas for a business area.
Return ONLY a valid JSON object with an "options" key containing an array of exactly 6 objects. Each object must have:
- id: string (lowercase, no spaces)
- title: string (customer persona name)
- description: string (2-3 sentences about this customer)
- icon: string (single relevant emoji)
- painPoints: array of exactly 3 strings (key pain points this customer faces)

Example format:
{"options": [{"id": "busy-professional", "title": "Busy Professional", "description": "Working professional with limited time...", "icon": "💼", "painPoints": ["Lack of time", "Need for efficiency", "Work-life balance"]}]}`
        responseFormat = "json_object"
        break

      case "jobs":
        systemPrompt = `You are a jobs-to-be-done analyst. Generate exactly 6 jobs that customers are trying to accomplish.
Return ONLY a valid JSON object with an "options" key containing an array of exactly 6 objects. Each object must have:
- id: string (lowercase, no spaces)
- title: string (job title)
- description: string (2-3 sentences about the job)
- icon: string (single relevant emoji)
- problemStatement: string (clear problem customers face when trying to accomplish this job)

Example format:
{"options": [{"id": "learn-new-skill", "title": "Learn a New Skill Quickly", "description": "Customers want to acquire new skills efficiently...", "icon": "🎓", "problemStatement": "Traditional learning methods are too slow and don't fit busy schedules"}]}`
        responseFormat = "json_object"
        break

      case "solutions":
        systemPrompt = `You are a solution architect. Generate exactly 6 solution approaches for a job-to-be-done.
Return ONLY a valid JSON object with an "options" key containing an array of exactly 6 objects. Each object must have:
- id: string (lowercase, no spaces)
- title: string (solution name)
- description: string (2-3 sentences about the solution)
- icon: string (single relevant emoji)
- keyFeatures: array of exactly 4 strings (key features of this solution)

Example format:
{"options": [{"id": "micro-learning-platform", "title": "Micro-Learning Platform", "description": "Bite-sized lessons delivered daily...", "icon": "📱", "keyFeatures": ["5-minute daily lessons", "Mobile-first design", "Gamification", "Progress tracking"]}]}`
        responseFormat = "json_object"
        break

      default:
        return NextResponse.json(
          { error: "Invalid type. Must be: business-areas, customers, jobs, or solutions" },
          { status: 400 }
        )
    }

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt + "\n\nReturn ONLY valid JSON. No markdown, no explanations, just the JSON array.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: responseFormat as "json_object" },
    })

    const content = completion.choices[0]?.message?.content || ""
    
    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch (parseError: unknown) {
      logger.warn("Failed to parse AI response directly, attempting markdown extraction:", parseError)
      // Try to extract JSON from markdown if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content]
      try {
        parsed = JSON.parse(jsonMatch[1] || content)
      } catch (extractError: unknown) {
        logger.error("Failed to extract and parse JSON from AI response:", extractError)
        logger.error("Raw AI response:", content)
        return NextResponse.json(
          { error: "Failed to parse AI response. Please try again." },
          { status: 500 }
        )
      }
    }

    // Extract the array from the response
    let options: any[] = []
    if (parsed.options && Array.isArray(parsed.options)) {
      options = parsed.options
    } else if (Array.isArray(parsed)) {
      options = parsed
    } else if (parsed.data && Array.isArray(parsed.data)) {
      options = parsed.data
    } else {
      // Try to find any array in the object
      const arrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]))
      if (arrayKey) {
        options = parsed[arrayKey]
      } else {
        logger.error("Could not find array in parsed response:", parsed)
        return NextResponse.json(
          { error: "Invalid response format from AI" },
          { status: 500 }
        )
      }
    }

    // Ensure we have exactly 6 items (or at least some items)
    if (options.length === 0) {
      logger.error("No options generated from AI response")
      return NextResponse.json(
        { error: "No options generated. Please try again." },
        { status: 500 }
      )
    }

    // Limit to 6 items if more were generated
    if (options.length > 6) {
      options = options.slice(0, 6)
    }

    return NextResponse.json({ options })
  } catch (error: unknown) {
    logger.error("Idea discovery generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate options"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

