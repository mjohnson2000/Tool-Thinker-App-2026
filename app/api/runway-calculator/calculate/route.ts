import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { 
      currentCash,
      monthlyBurnRate,
      monthlyRevenue,
      revenueGrowthRate,
      expectedFunding
    } = await req.json()

    if (!currentCash || !monthlyBurnRate) {
      return NextResponse.json(
        { error: "Current cash and monthly burn rate are required" },
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

    const prompt = `You are a startup financial advisor. Calculate comprehensive runway analysis based on the following information.

Current Cash: $${currentCash}
Monthly Burn Rate: $${monthlyBurnRate}
${monthlyRevenue ? `Monthly Revenue: $${monthlyRevenue}` : "Monthly Revenue: $0 (pre-revenue)"}
${revenueGrowthRate ? `Revenue Growth Rate: ${revenueGrowthRate}% per month` : ""}
${expectedFunding ? `Expected Funding: $${expectedFunding}` : ""}

Generate a comprehensive runway analysis that includes:

1. **Current Runway**:
   - Months until cash runs out (at current burn rate)
   - Break-even date (if revenue exists)
   - Net burn rate (burn rate - revenue)

2. **Projected Runway** (if revenue growth provided):
   - Month-by-month cash projection
   - When break-even occurs
   - Cash runway with revenue growth

3. **Funding Impact** (if expected funding provided):
   - New runway after funding
   - Extended break-even timeline
   - Recommended funding amount

4. **Runway Scenarios**:
   - Best case scenario
   - Most likely scenario
   - Worst case scenario

5. **Recommendations**:
   - Actions to extend runway
   - Cost reduction opportunities
   - Revenue acceleration strategies
   - Funding timeline recommendations

Return a JSON object with this exact structure:

{
  "current_runway": {
    "months_remaining": X,
    "break_even_date": "Month X or 'Not achievable'",
    "net_burn_rate": "$X,XXX/month",
    "calculation": "string"
  },
  "projected_runway": {
    "monthly_projection": [
      {
        "month": "Month 1",
        "starting_cash": "$X,XXX",
        "revenue": "$X,XXX",
        "expenses": "$X,XXX",
        "ending_cash": "$X,XXX"
      }
    ],
    "break_even_month": "Month X",
    "runway_with_growth": "X months"
  },
  "funding_impact": {
    "new_runway_months": X,
    "extended_break_even": "Month X",
    "recommended_funding": "$X,XXX,XXX",
    "calculation": "string"
  },
  "scenarios": {
    "best_case": {
      "runway_months": X,
      "assumptions": ["assumption1"]
    },
    "most_likely": {
      "runway_months": X,
      "assumptions": ["assumption1"]
    },
    "worst_case": {
      "runway_months": X,
      "assumptions": ["assumption1"]
    }
  },
  "recommendations": {
    "extend_runway": ["action1", "action2"],
    "cost_reduction": ["opportunity1", "opportunity2"],
    "revenue_acceleration": ["strategy1", "strategy2"],
    "funding_timeline": "string"
  }
}

Calculate accurate runway based on standard financial formulas. Consider revenue growth impact if provided.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a startup financial advisor. Always return valid JSON that strictly adheres to the runway schema. Do not include markdown code blocks or any additional text.",
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
      const runway = JSON.parse(content)
      return NextResponse.json(runway)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Runway Calculator error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to calculate runway" },
      { status: 500 }
    )
  }
}


