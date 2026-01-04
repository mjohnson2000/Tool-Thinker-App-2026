import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import type { AppliedSystemResult, BusinessContext } from "@/types/marketing"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { context } = body as { context: BusinessContext }

    if (!context.brand_name || !context.offer_summary || !context.target_customer) {
      return NextResponse.json(
        { error: "Missing required fields: brand_name, offer_summary, and target_customer are required" },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    const prompt = buildMarketingSystemPrompt(context)

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a marketing strategist specializing in attention-based content systems. 
          You create comprehensive, actionable marketing blueprints based on the "Attention-to-Scale" framework.
          Always return valid JSON matching the requested schema. Return ONLY valid JSON, no markdown code blocks or explanations.`,
        },
        {
          role: "user",
          content: prompt + "\n\nReturn your response as a valid JSON object only, no markdown formatting.",
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content || ""
    
    let result: AppliedSystemResult
    try {
      result = JSON.parse(content)
    } catch (error) {
      // Try to extract JSON from markdown if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content]
      result = JSON.parse(jsonMatch[1] || content)
    }

    // Validate structure
    if (!result.system || !result.prioritized_next_actions) {
      return NextResponse.json(
        { error: "Invalid response structure from AI" },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Marketing blueprint generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate marketing blueprint" },
      { status: 500 }
    )
  }
}

function buildMarketingSystemPrompt(context: BusinessContext): string {
  return `Create a complete "Attention-to-Scale" marketing system for this business:

Business Context:
- Brand Name: ${context.brand_name}
- Offer: ${context.offer_summary}
- Target Customer: ${context.target_customer}
${context.category ? `- Category: ${context.category}` : ""}
- Primary Platforms: ${context.primary_platforms.join(", ")}
${context.proof_assets.length > 0 ? `- Proof Assets: ${context.proof_assets.join(", ")}` : ""}
${Object.keys(context.constraints).length > 0 ? `- Constraints: ${JSON.stringify(context.constraints)}` : ""}
${Object.keys(context.current_channels).length > 0 ? `- Current Channels: ${JSON.stringify(context.current_channels)}` : ""}

Generate a complete marketing system that includes:

1. Messaging Strategy:
   - Core message that can scale
   - Differentiation
   - Audience desire image (tangible outcome they want)
   - Multiple attention hook angles

2. Attention Hooks (3-5 different hooks):
   Each hook should have:
   - hook_promise: What they get if they keep watching
   - hook_mechanic: The mechanism (question, visual, tension, contrast, claim, demo)
   - opening_structure: Beat-by-beat for first 3-5 seconds
   - cognitive_load_rule: "low" (keep it simple and linear)

3. Format Library (4-6 reusable formats):
   Based on the blueprint formats:
   - Problem → Framework → Micro Win
   - 60-Second Screen-Recorded Build
   - Before/After: Messy Idea → One-Page Plan
   - Myth → Truth → Tool
   Each format should have:
   - format_name
   - why_it_works
   - required_beats
   - variable_slots
   - platform_fit

4. Performance Drivers (5-7 drivers):
   Examples: tension escalation, visual rhythm, clear captions, pattern interrupt
   Each should have:
   - driver_name
   - observed_effect: "up", "down", or "mixed"
   - diagnostic_questions
   - how_to_improve

5. Experimentation (4-6 experiments):
   Based on the weekly testing loop:
   - Opening Hook tests (Output-first vs Problem-first)
   - Ad Format tests (Screen-record vs Talking head)
   - Campaign Objective tests (Video Views vs Conversions)
   - CTA Destination tests (Tools vs Consultation vs Book)
   Each should have:
   - hypothesis
   - test_variant_notes
   - success_metrics
   - pivot_rules

6. Qualitative Review Template:
   - retention_notes: Where attention drops
   - engagement_notes: Comments, saves, shares signals
   - hook_notes: Did opening earn the next 10-60 seconds?
   - story_notes: Clarity, pacing, tension, payoff
   - actionable_edits_next_version: Concrete edits

7. Distribution and Targeting:
   - audience_hypotheses: Who will respond and why
   - targeting_inputs: Demographics, interests, behaviors
   - objective_priority: Hierarchy based on content strength
   - retargeting_plan: How to retarget engagers and create lookalikes

8. Operating Cadence:
   - Posting rhythm
   - Review rhythm
   - Iteration rhythm

9. Output Artifacts:
   - Hook scripts
   - Storyboards
   - Shot lists
   - Caption templates
   - Test matrix
   - Weekly content plan

Return a JSON object with this structure:
{
  "system": {
    "context": ${JSON.stringify(context)},
    "messaging": {...},
    "attention_hooks": [...],
    "format_library": [...],
    "performance_drivers": [...],
    "experimentation": [...],
    "qualitative_review": {...},
    "distribution_and_targeting": {...},
    "operating_cadence": {...},
    "output_artifacts": {...}
  },
  "prioritized_next_actions": ["action 1", "action 2", ...],
  "test_matrix": [{"variant": "A", "change": "...", "metric": "..."}, ...],
  "content_backlog": [{"title": "...", "hook": "...", "format": "...", "cta": "...", "platform": "..."}, ...]
}

Make it specific, actionable, and tailored to ${context.brand_name}.`
}

