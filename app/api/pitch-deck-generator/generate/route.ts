import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

interface PitchDeckResponse {
  company_name: string
  tagline: string
  slides: Array<{
    slide_number: number
    slide_title: string
    content: {
      headline?: string
      subheadline?: string
      bullet_points?: string[]
      paragraphs?: string[]
      metrics?: Array<{
        label: string
        value: string
      }>
      visual_description?: string
    }
  }>
  notes: string[]
}

export async function POST(req: NextRequest) {
  try {
    const { businessIdea, companyName, targetMarket, fundingAmount, useOfFunds, traction, team } = await req.json()

    if (!businessIdea || !businessIdea.trim()) {
      return NextResponse.json(
        { error: "Business idea is required" },
        { status: 400 }
      )
    }

    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === "your_openai_key_here") {
      logger.error("OpenAI API key not configured")
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env" },
        { status: 500 }
      )
    }

    const prompt = `You are an expert pitch deck consultant who has helped hundreds of startups raise millions in funding. Create a comprehensive, investor-ready pitch deck based on the following information.

Business Information:
- Company Name: ${companyName || "To be determined"}
- Business Idea: ${businessIdea}
${targetMarket ? `- Target Market: ${targetMarket}` : ""}
${fundingAmount ? `- Funding Amount: ${fundingAmount}` : ""}
${useOfFunds ? `- Use of Funds: ${useOfFunds}` : ""}
${traction ? `- Traction: ${traction}` : ""}
${team ? `- Team: ${team}` : ""}

Create a complete pitch deck with 10-12 slides following the standard investor pitch deck structure:

1. TITLE SLIDE
   - Company name
   - Tagline (one powerful sentence)
   - Optional: Founder name, date

2. PROBLEM SLIDE
   - Clear problem statement
   - Why this problem matters
   - Market pain points
   - Size of the problem

3. SOLUTION SLIDE
   - Your solution in simple terms
   - How it works (high-level)
   - Key features/benefits
   - Why your solution is unique

4. MARKET OPPORTUNITY
   - Total Addressable Market (TAM)
   - Serviceable Addressable Market (SAM)
   - Serviceable Obtainable Market (SOM)
   - Market size and growth
   - Market trends

5. BUSINESS MODEL
   - How you make money
   - Revenue streams
   - Pricing strategy
   - Unit economics (if available)

6. TRACTION
   - Key metrics and milestones
   - Growth trajectory
   - Customer testimonials (if any)
   - Partnerships or pilots
   - Any validation signals

7. COMPETITIVE LANDSCAPE
   - Main competitors
   - Competitive positioning
   - Your competitive advantages
   - Why you'll win

8. GO-TO-MARKET STRATEGY
   - How you'll acquire customers
   - Marketing channels
   - Sales strategy
   - Distribution approach

9. TEAM
   - Key team members
   - Relevant experience
   - Why this team can execute
   - Advisors (if any)

10. FINANCIAL PROJECTIONS
    - Revenue projections (3 years)
    - Key assumptions
    - Path to profitability
    - Key metrics (CAC, LTV, etc.)

11. THE ASK
    - Funding amount needed
    - Use of funds breakdown
    - Milestones this funding will achieve
    - Timeline

12. VISION/CONCLUSION
    - Long-term vision
    - Why now
    - Call to action

Return a JSON object with this exact structure:
{
  "company_name": "string",
  "tagline": "string (powerful one-liner)",
  "slides": [
    {
      "slide_number": 1,
      "slide_title": "Title",
      "content": {
        "headline": "string",
        "subheadline": "string (optional)",
        "bullet_points": ["point 1", "point 2"],
        "paragraphs": ["paragraph 1"],
        "metrics": [
          {"label": "string", "value": "string"}
        ],
        "visual_description": "string (what visual should be on this slide)"
      }
    }
  ],
  "notes": ["note 1", "note 2"] // Presentation tips and best practices
}

Make it compelling, data-driven, and investor-ready. Use specific numbers where possible. Be realistic but optimistic.`

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert pitch deck consultant. Always return valid JSON matching the requested schema. Do not include markdown code blocks or any text outside the JSON object.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content || ""
    
    try {
      const pitchDeck: PitchDeckResponse = JSON.parse(content)
      
      if (!pitchDeck.slides || pitchDeck.slides.length === 0) {
        return NextResponse.json(
          { error: "Invalid pitch deck structure" },
          { status: 500 }
        )
      }

      return NextResponse.json(pitchDeck)
    } catch (parseError) {
      logger.error("Failed to parse pitch deck:", parseError)
      logger.error("Raw AI response:", content)
      
      try {
        const repairCompletion = await openai.chat.completions.create({
          model: env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Fix this JSON and return only valid JSON without markdown:\n\n${content}`,
            },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        })
        const repaired = repairCompletion.choices[0]?.message?.content || ""
        const pitchDeck: PitchDeckResponse = JSON.parse(repaired)
        return NextResponse.json(pitchDeck)
      } catch (repairError) {
        logger.error("Failed to repair JSON:", repairError)
        return NextResponse.json(
          { error: "Failed to generate pitch deck. Please try again." },
          { status: 500 }
        )
      }
    }
  } catch (error: unknown) {
    logger.error("Pitch Deck Generator error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate pitch deck"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


