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
      currentRevenue, 
      revenueGrowthRate, 
      marketSize, 
      stage, 
      comparableCompanies,
      fundingAmount,
      industry
    } = await req.json()

    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === "your_openai_key_here") {
      logger.error("OpenAI API key not configured")
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env" },
        { status: 500 }
      )
    }

    const prompt = `You are a venture capital analyst and startup valuation expert. Calculate a comprehensive startup valuation based on the following information.

Business Information:
${currentRevenue ? `- Current Annual Revenue: $${currentRevenue}` : "- Revenue: Not provided (pre-revenue startup)"}
${revenueGrowthRate ? `- Revenue Growth Rate: ${revenueGrowthRate}%` : ""}
${marketSize ? `- Total Addressable Market (TAM): $${marketSize}` : ""}
${stage ? `- Funding Stage: ${stage}` : ""}
${industry ? `- Industry: ${industry}` : ""}
${fundingAmount ? `- Funding Amount Being Raised: $${fundingAmount}` : ""}
${comparableCompanies ? `- Comparable Companies: ${comparableCompanies}` : ""}

Generate a comprehensive valuation analysis that includes:

1. **Valuation Methodology**: Explain which valuation methods are most appropriate (Revenue Multiple, Comparable Companies, Discounted Cash Flow, etc.)

2. **Pre-Money Valuation Range**: 
   - Conservative estimate
   - Most likely estimate
   - Optimistic estimate
   - Justification for each

3. **Post-Money Valuation** (if funding amount provided):
   - Post-money valuation calculation
   - Investor equity percentage
   - Founder dilution percentage

4. **Valuation Factors**:
   - Revenue multiple (if applicable)
   - Growth rate impact
   - Market size impact
   - Stage considerations
   - Industry benchmarks

5. **Comparable Analysis** (if provided):
   - Similar companies and their valuations
   - How this startup compares

6. **Key Assumptions**: Document all assumptions used in the valuation

7. **Recommendations**: 
   - Suggested valuation range for negotiations
   - Factors that could increase valuation
   - Risks that could decrease valuation

Return a JSON object with this exact structure:

{
  "methodology": {
    "primary_method": "string",
    "methods_used": ["method1", "method2"],
    "explanation": "string"
  },
  "pre_money_valuation": {
    "conservative": {
      "value": "$X,XXX,XXX",
      "justification": "string"
    },
    "most_likely": {
      "value": "$X,XXX,XXX",
      "justification": "string"
    },
    "optimistic": {
      "value": "$X,XXX,XXX",
      "justification": "string"
    }
  },
  "post_money_valuation": {
    "value": "$X,XXX,XXX",
    "investor_equity_percentage": "X%",
    "founder_dilution_percentage": "X%",
    "calculation": "string"
  },
  "valuation_factors": {
    "revenue_multiple": "Xx",
    "growth_impact": "string",
    "market_size_impact": "string",
    "stage_considerations": "string",
    "industry_benchmarks": "string"
  },
  "comparable_analysis": {
    "similar_companies": [
      {
        "name": "string",
        "valuation": "string",
        "revenue": "string",
        "comparison": "string"
      }
    ],
    "how_this_compares": "string"
  },
  "assumptions": ["assumption1", "assumption2"],
  "recommendations": {
    "suggested_range": "$X,XXX,XXX - $X,XXX,XXX",
    "factors_to_increase": ["factor1", "factor2"],
    "risks_to_decrease": ["risk1", "risk2"]
  }
}

Use realistic numbers based on industry standards and the provided inputs. If certain values aren't provided, make reasonable assumptions based on the stage and industry.`

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a venture capital analyst and startup valuation expert. Always return valid JSON that strictly adheres to the valuation schema. Do not include markdown code blocks or any additional text.",
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
      const valuation = JSON.parse(content)
      return NextResponse.json(valuation)
    } catch (parseError) {
      logger.error("Failed to parse AI response:", parseError)
      logger.error("Raw AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    logger.error("Valuation Calculator error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to calculate valuation"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


