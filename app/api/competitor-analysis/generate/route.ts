import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CompetitorAnalysis {
  business_context: {
    business_idea: string
    target_market: string
    value_proposition: string
  }
  competitor_identification: {
    direct_competitors: Array<{
      name: string
      description: string
      strengths: string[]
      weaknesses: string[]
      market_position: string
    }>
    indirect_competitors: Array<{
      name: string
      description: string
      why_competitor: string
    }>
    alternative_solutions: string[]
  }
  competitive_landscape: {
    market_overview: string
    market_share_analysis: string
    competitive_intensity: string
    barriers_to_entry: string
  }
  competitive_positioning: {
    positioning_statement: string
    differentiation_factors: Array<{
      factor: string
      description: string
      competitive_advantage: string
    }>
    unique_value_proposition: string
  }
  competitive_matrix: {
    comparison_factors: string[]
    competitors: Array<{
      name: string
      scores: Array<{
        factor: string
        score: number
        notes: string
      }>
      overall_score: number
    }>
  }
  swot_analysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  strategic_recommendations: {
    positioning_strategy: string
    competitive_advantages_to_leverage: string[]
    weaknesses_to_address: string[]
    market_opportunities: string[]
    defensive_strategies: string[]
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessIdea, targetMarket, valueProposition, knownCompetitors } = await req.json()

    if (!businessIdea || !businessIdea.trim()) {
      return NextResponse.json(
        { error: "Business idea is required" },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
      console.error("OpenAI API key not configured")
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env" },
        { status: 500 }
      )
    }

    const prompt = `You are a competitive intelligence expert and strategic analyst. Create a comprehensive competitor analysis based on the following business information.

Business Information:
- Business Idea: ${businessIdea}
${targetMarket ? `- Target Market: ${targetMarket}` : ""}
${valueProposition ? `- Value Proposition: ${valueProposition}` : ""}
${knownCompetitors ? `- Known Competitors: ${knownCompetitors}` : ""}

Create a comprehensive competitor analysis that includes:

1. COMPETITOR IDENTIFICATION
   - Direct competitors (3-5 companies solving the same problem in a similar way)
     For each: name, description, strengths, weaknesses, market position
   - Indirect competitors (companies solving the same problem differently)
     For each: name, description, why they're a competitor
   - Alternative solutions (how customers solve this problem without buying anything)

2. COMPETITIVE LANDSCAPE
   - Market overview
   - Market share analysis
   - Competitive intensity assessment
   - Barriers to entry

3. COMPETITIVE POSITIONING
   - Positioning statement (how you're different)
   - Differentiation factors (3-5 key factors that make you unique)
     For each: factor, description, competitive advantage
   - Unique value proposition

4. COMPETITIVE MATRIX
   - Comparison factors (5-7 key factors like price, features, quality, etc.)
   - Score each competitor (1-10) on each factor
   - Overall score for each competitor
   - Notes on scoring

5. SWOT ANALYSIS
   - Strengths (relative to competitors)
   - Weaknesses (relative to competitors)
   - Opportunities (in the competitive landscape)
   - Threats (from competitors)

6. STRATEGIC RECOMMENDATIONS
   - Positioning strategy
   - Competitive advantages to leverage
   - Weaknesses to address
   - Market opportunities
   - Defensive strategies

Return a JSON object with this exact structure:
{
  "business_context": {
    "business_idea": "string",
    "target_market": "string",
    "value_proposition": "string"
  },
  "competitor_identification": {
    "direct_competitors": [
      {
        "name": "string",
        "description": "string",
        "strengths": ["strength 1"],
        "weaknesses": ["weakness 1"],
        "market_position": "string"
      }
    ],
    "indirect_competitors": [
      {
        "name": "string",
        "description": "string",
        "why_competitor": "string"
      }
    ],
    "alternative_solutions": ["solution 1"]
  },
  "competitive_landscape": {
    "market_overview": "string",
    "market_share_analysis": "string",
    "competitive_intensity": "string",
    "barriers_to_entry": "string"
  },
  "competitive_positioning": {
    "positioning_statement": "string",
    "differentiation_factors": [
      {
        "factor": "string",
        "description": "string",
        "competitive_advantage": "string"
      }
    ],
    "unique_value_proposition": "string"
  },
  "competitive_matrix": {
    "comparison_factors": ["factor 1"],
    "competitors": [
      {
        "name": "string",
        "scores": [
          {
            "factor": "string",
            "score": 8,
            "notes": "string"
          }
        ],
        "overall_score": 7.5
      }
    ]
  },
  "swot_analysis": {
    "strengths": ["strength 1"],
    "weaknesses": ["weakness 1"],
    "opportunities": ["opportunity 1"],
    "threats": ["threat 1"]
  },
  "strategic_recommendations": {
    "positioning_strategy": "string",
    "competitive_advantages_to_leverage": ["advantage 1"],
    "weaknesses_to_address": ["weakness 1"],
    "market_opportunities": ["opportunity 1"],
    "defensive_strategies": ["strategy 1"]
  }
}

Be thorough, realistic, and actionable. Use specific competitor names when possible.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a competitive intelligence expert and strategic analyst. Always return valid JSON matching the requested schema. Do not include markdown code blocks.",
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
      const analysis: CompetitorAnalysis = JSON.parse(content)
      
      if (!analysis.competitor_identification || !analysis.competitive_positioning) {
        return NextResponse.json(
          { error: "Invalid competitor analysis structure" },
          { status: 500 }
        )
      }

      return NextResponse.json(analysis)
    } catch (parseError) {
      console.error("Failed to parse competitor analysis:", parseError)
      console.error("Raw AI response:", content)
      
      try {
        const repairCompletion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
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
        const analysis: CompetitorAnalysis = JSON.parse(repaired)
        return NextResponse.json(analysis)
      } catch (repairError) {
        console.error("Failed to repair JSON:", repairError)
        return NextResponse.json(
          { error: "Failed to generate competitor analysis. Please try again." },
          { status: 500 }
        )
      }
    }
  } catch (error: any) {
    console.error("Competitor Analysis error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate competitor analysis" },
      { status: 500 }
    )
  }
}


