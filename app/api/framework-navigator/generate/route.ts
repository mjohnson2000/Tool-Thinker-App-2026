import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RoadmapStep {
  step: number
  framework: string
  description: string
  why: string
  outcome: string
}

interface RoadmapResponse {
  goal: string
  summary: string
  steps: RoadmapStep[]
  estimatedTime: string
  keyFrameworks: string[]
}

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json()

    if (!goal || !goal.trim()) {
      return NextResponse.json(
        { error: "Business goal is required" },
        { status: 400 }
      )
    }

    const prompt = `You are a startup strategist and framework expert. Based on the following business goal, create a step-by-step framework roadmap.

Business Goal: ${goal}

Create a comprehensive roadmap that:
1. Identifies the most relevant business frameworks for this goal
2. Orders them in a logical sequence
3. Explains why each framework is needed at that stage
4. Describes the expected outcome after completing each framework

Available frameworks include (but not limited to):
- Jobs-to-be-Done (JTBD)
- Value Proposition Canvas
- Business Model Canvas
- Lean Canvas
- SWOT Analysis
- Design Thinking
- Customer Journey Mapping
- Empathy Map
- Kano Model
- Minimum Viable Product (MVP)
- Product Market Fit
- Growth Hacking
- OKRs (Objectives and Key Results)
- Marketing Funnel
- Risk Matrix

Return a JSON object with this structure:
{
  "goal": "${goal}",
  "summary": "A 2-3 sentence summary of the recommended approach",
  "estimatedTime": "e.g., '2-3 months' or '6-8 weeks'",
  "keyFrameworks": ["Framework 1", "Framework 2", "Framework 3"],
  "steps": [
    {
      "step": 1,
      "framework": "Framework Name",
      "description": "What this framework involves and how to use it",
      "why": "Why this framework is needed at this stage",
      "outcome": "What you'll have after completing this step"
    }
  ]
}

Return ONLY valid JSON, no markdown formatting or code blocks.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a startup strategist and framework expert. Always return valid JSON matching the requested schema. Do not include markdown code blocks.",
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
    let roadmap: RoadmapResponse
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content]
      const jsonStr = jsonMatch[1] || content
      roadmap = JSON.parse(jsonStr.trim())
    } catch (error) {
      // Try to repair the JSON
      try {
        const repairCompletion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Fix this JSON and return only valid JSON:\n\n${content}`,
            },
          ],
          temperature: 0.3,
        })
        const repaired = repairCompletion.choices[0]?.message?.content || ""
        const repairedJson = repaired.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, repaired]
        roadmap = JSON.parse((repairedJson[1] || repaired).trim())
      } catch (repairError) {
        console.error("Failed to parse roadmap:", error, repairError)
        return NextResponse.json(
          { error: "Failed to generate roadmap. Please try again." },
          { status: 500 }
        )
      }
    }

    // Validate the response structure
    if (!roadmap.goal || !roadmap.steps || !Array.isArray(roadmap.steps)) {
      return NextResponse.json(
        { error: "Invalid roadmap structure" },
        { status: 500 }
      )
    }

    return NextResponse.json(roadmap)
  } catch (error: any) {
    console.error("Framework Navigator error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate roadmap" },
      { status: 500 }
    )
  }
}

