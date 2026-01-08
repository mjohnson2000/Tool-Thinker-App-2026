import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

interface BusinessModelResponse {
  business_idea: string
  business_model_summary: string
  value_proposition: string
  target_customers: string[]
  revenue_streams: string[]
  pricing_strategy: string
  cost_structure: string[]
  key_resources: string[]
  key_activities: string[]
  key_partners: string[]
  channels: string[]
  customer_relationships: string
  unit_economics: string
  scalability: string
  competitive_advantage: string
}

export async function POST(req: NextRequest) {
  try {
    const { businessIdea, industry } = await req.json()

    if (!businessIdea || !businessIdea.trim()) {
      return NextResponse.json(
        { error: "Business idea is required" },
        { status: 400 }
      )
    }

    const industryContext = industry ? `Industry: ${industry}\n\n` : ""

    const prompt = `You are a business strategist and expert in business model design. Based on the following business idea, create a comprehensive business model using the Business Model Canvas framework.

${industryContext}Business Idea: ${businessIdea}

Create a detailed business model that includes all nine building blocks of the Business Model Canvas:

1. Value Proposition - What unique value does this business provide?
2. Customer Segments - Who are the target customers?
3. Revenue Streams - How will the business make money?
4. Cost Structure - What are the main costs?
5. Key Resources - What resources are needed (people, technology, capital, etc.)?
6. Key Activities - What activities create value?
7. Key Partners - Who are important partners and suppliers?
8. Channels - How will you reach and deliver value to customers?
9. Customer Relationships - What type of relationship will you establish with customers?

Additionally, provide:
- Unit Economics analysis (revenue per customer vs cost per customer)
- Scalability assessment
- Competitive Advantage analysis

Return a JSON object with this exact structure:
{
  "business_idea": "${businessIdea}",
  "business_model_summary": "A 2-3 sentence overview of the business model",
  "value_proposition": "Clear description of the unique value provided",
  "target_customers": ["Customer segment 1", "Customer segment 2"],
  "revenue_streams": ["Revenue stream 1", "Revenue stream 2"],
  "pricing_strategy": "Detailed pricing approach and rationale",
  "cost_structure": ["Cost 1", "Cost 2", "Cost 3"],
  "key_resources": ["Resource 1", "Resource 2"],
  "key_activities": ["Activity 1", "Activity 2"],
  "key_partners": ["Partner 1", "Partner 2"],
  "channels": ["Channel 1", "Channel 2"],
  "customer_relationships": "Description of customer relationship strategy",
  "unit_economics": "Analysis of unit economics (CAC, LTV, margins)",
  "scalability": "Assessment of how well this model can scale",
  "competitive_advantage": "What makes this business model defensible and unique"
}

Be realistic, specific, and actionable. Focus on creating a sustainable and scalable business model.`

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a business strategist and expert in business model design. Always return valid JSON matching the requested schema. Do not include markdown code blocks.",
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
    let businessModel: BusinessModelResponse
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content]
      const jsonStr = jsonMatch[1] || content
      businessModel = JSON.parse(jsonStr.trim())
    } catch (error) {
      // Try to repair the JSON
      try {
        const repairCompletion = await openai.chat.completions.create({
          model: env.OPENAI_MODEL || "gpt-4o-mini",
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
        businessModel = JSON.parse((repairedJson[1] || repaired).trim())
      } catch (repairError) {
        logger.error("Failed to parse business model:", error, repairError)
        return NextResponse.json(
          { error: "Failed to generate business model. Please try again." },
          { status: 500 }
        )
      }
    }

    // Validate the response structure
    if (!businessModel.business_idea || !businessModel.value_proposition) {
      return NextResponse.json(
        { error: "Invalid business model structure" },
        { status: 500 }
      )
    }

    return NextResponse.json(businessModel)
  } catch (error: unknown) {
    logger.error("Business Model Generator error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate business model"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


