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
      productDescription,
      costStructure,
      targetMargin,
      competitorPricing,
      customerWillingnessToPay,
      pricingModel
    } = await req.json()

    if (!productDescription || !productDescription.trim()) {
      return NextResponse.json(
        { error: "Product description is required" },
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

    const prompt = `You are a pricing strategy expert and startup advisor. Calculate comprehensive pricing strategy recommendations based on the following information.

Product/Service Description: ${productDescription}
${costStructure ? `Cost Structure: ${costStructure}` : ""}
${targetMargin ? `Target Margin: ${targetMargin}%` : ""}
${competitorPricing ? `Competitor Pricing: ${competitorPricing}` : ""}
${customerWillingnessToPay ? `Customer Willingness to Pay: ${customerWillingnessToPay}` : ""}
${pricingModel ? `Preferred Pricing Model: ${pricingModel}` : ""}

Generate a comprehensive pricing strategy that includes:

1. **Recommended Pricing Tiers**:
   - Entry/Basic tier (price, features, target customer)
   - Standard/Pro tier (price, features, target customer)
   - Premium/Enterprise tier (price, features, target customer)
   - Justification for each tier

2. **Pricing Analysis**:
   - Cost-plus pricing calculation
   - Value-based pricing analysis
   - Competitive pricing analysis
   - Recommended approach

3. **Margin Analysis**:
   - Gross margin per tier
   - Contribution margin
   - Break-even analysis
   - Profitability by tier

4. **Price Sensitivity Analysis**:
   - Price elasticity considerations
   - Optimal price points
   - Price floor and ceiling
   - Impact of price changes on demand

5. **Pricing Strategy Recommendations**:
   - Initial pricing strategy
   - Pricing optimization opportunities
   - Discount strategies
   - Upsell/cross-sell opportunities

6. **Implementation Plan**:
   - How to test pricing
   - A/B testing recommendations
   - Pricing adjustment strategy

Return a JSON object with this exact structure:

{
  "pricing_tiers": [
    {
      "tier_name": "Basic",
      "price": "$XX/month or $XXX one-time",
      "features": ["feature1", "feature2"],
      "target_customer": "string",
      "justification": "string"
    },
    {
      "tier_name": "Pro",
      "price": "$XX/month or $XXX one-time",
      "features": ["feature1", "feature2"],
      "target_customer": "string",
      "justification": "string"
    },
    {
      "tier_name": "Enterprise",
      "price": "$XX/month or $XXX one-time",
      "features": ["feature1", "feature2"],
      "target_customer": "string",
      "justification": "string"
    }
  ],
  "pricing_analysis": {
    "cost_plus": {
      "calculation": "string",
      "recommended_price": "$XX"
    },
    "value_based": {
      "analysis": "string",
      "recommended_price": "$XX"
    },
    "competitive": {
      "analysis": "string",
      "recommended_price": "$XX"
    },
    "recommended_approach": "string"
  },
  "margin_analysis": {
    "gross_margin_by_tier": [
      {
        "tier": "Basic",
        "gross_margin": "XX%",
        "contribution_margin": "XX%"
      }
    ],
    "break_even_analysis": "string",
    "profitability_insights": "string"
  },
  "price_sensitivity": {
    "price_elasticity": "string",
    "optimal_price_points": ["$XX", "$XX"],
    "price_floor": "$XX",
    "price_ceiling": "$XX",
    "demand_impact": "string"
  },
  "recommendations": {
    "initial_strategy": "string",
    "optimization_opportunities": ["opportunity1", "opportunity2"],
    "discount_strategies": ["strategy1", "strategy2"],
    "upsell_opportunities": ["opportunity1"]
  },
  "implementation": {
    "testing_approach": "string",
    "ab_testing_recommendations": ["test1", "test2"],
    "adjustment_strategy": "string"
  }
}

Use realistic pricing based on industry standards, cost structures, and market positioning. Consider both subscription and one-time pricing models.`

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a pricing strategy expert. Always return valid JSON that strictly adheres to the pricing strategy schema. Do not include markdown code blocks or any additional text.",
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
      const pricing = JSON.parse(content)
      return NextResponse.json(pricing)
    } catch (parseError) {
      logger.error("Failed to parse AI response:", parseError)
      logger.error("Raw AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    logger.error("Pricing Strategy Calculator error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to calculate pricing strategy"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


