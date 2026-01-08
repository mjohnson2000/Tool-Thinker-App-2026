import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { 
      currentOwnership,
      fundingRounds,
      optionPoolPercentage
    } = await req.json()

    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === "your_openai_key_here") {
      logger.error("OpenAI API key not configured")
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env" },
        { status: 500 }
      )
    }

    const prompt = `You are a startup equity and dilution expert. Calculate comprehensive equity dilution across funding rounds based on the following information.

Current Ownership: ${currentOwnership || "100%"} (founder's current ownership before any rounds)
${optionPoolPercentage ? `Option Pool: ${optionPoolPercentage}%` : ""}

Funding Rounds (JSON array):
${fundingRounds ? JSON.stringify(fundingRounds, null, 2) : "No rounds provided"}

Each funding round should include:
- Round name (e.g., "Seed", "Series A")
- Funding amount
- Pre-money valuation
- Option pool percentage (if applicable)

Generate a comprehensive dilution analysis that includes:

1. **Ownership After Each Round**: 
   - Founder's ownership percentage after each round
   - Dilution percentage per round
   - Cumulative dilution

2. **Round-by-Round Breakdown**:
   - Pre-money valuation
   - Post-money valuation
   - Investor equity percentage
   - Option pool impact
   - Founder dilution

3. **Final Ownership**: 
   - Final founder ownership after all rounds
   - Total dilution percentage
   - Remaining equity value

4. **Dilution Visualization**: 
   - Ownership breakdown by stakeholder type
   - Equity distribution

5. **Key Insights**:
   - Which rounds cause most dilution
   - Impact of option pools
   - Recommendations to minimize dilution

Return a JSON object with this exact structure:

{
  "initial_ownership": {
    "founder_percentage": "100%",
    "total_shares": "X,XXX,XXX"
  },
  "rounds": [
    {
      "round_name": "Seed",
      "pre_money_valuation": "$X,XXX,XXX",
      "funding_amount": "$X,XXX,XXX",
      "post_money_valuation": "$X,XXX,XXX",
      "investor_equity_percentage": "X%",
      "option_pool_percentage": "X%",
      "founder_ownership_before": "X%",
      "founder_ownership_after": "X%",
      "dilution_this_round": "X%",
      "cumulative_dilution": "X%"
    }
  ],
  "final_ownership": {
    "founder_percentage": "X%",
    "total_dilution": "X%",
    "remaining_equity_value": "$X,XXX,XXX (at final valuation)"
  },
  "ownership_breakdown": {
    "founders": "X%",
    "investors": "X%",
    "option_pool": "X%",
    "others": "X%"
  },
  "insights": {
    "most_dilutive_round": "string",
    "option_pool_impact": "string",
    "recommendations": ["recommendation1", "recommendation2"]
  }
}

Calculate accurate dilution percentages based on standard startup financing formulas. If funding rounds aren't provided, create a sample scenario with common rounds (Seed, Series A, Series B).`

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a startup equity and dilution expert. Always return valid JSON that strictly adheres to the dilution schema. Do not include markdown code blocks or any additional text.",
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
      const dilution = JSON.parse(content)
      return NextResponse.json(dilution)
    } catch (parseError) {
      logger.error("Failed to parse AI response:", parseError)
      logger.error("Raw AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    logger.error("Equity Dilution Calculator error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to calculate equity dilution"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


