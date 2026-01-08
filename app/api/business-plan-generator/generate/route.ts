import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

interface BusinessPlanResponse {
  executive_summary: {
    business_name: string
    mission_statement: string
    business_overview: string
    key_objectives: string[]
    financial_highlights: string
  }
  company_description: {
    company_name: string
    legal_structure: string
    location: string
    history: string
    products_services: string[]
    competitive_advantages: string[]
  }
  market_analysis: {
    industry_overview: string
    target_market: string
    market_size: string
    market_trends: string[]
    customer_analysis: string
    competitor_analysis: {
      competitors: string[]
      competitive_positioning: string
    }
  }
  organization_management: {
    organizational_structure: string
    management_team: Array<{
      name: string
      role: string
      experience: string
    }>
    advisors: string[]
    hiring_plan: string
  }
  service_product_line: {
    products_services: Array<{
      name: string
      description: string
      pricing: string
      target_market: string
    }>
    research_development: string
    intellectual_property: string
  }
  marketing_sales: {
    marketing_strategy: string
    sales_strategy: string
    pricing_strategy: string
    distribution_channels: string[]
    promotional_activities: string[]
    sales_forecast: string
  }
  financial_projections: {
    startup_costs: Array<{
      item: string
      amount: string
    }>
    revenue_projections: {
      year_1: string
      year_2: string
      year_3: string
      assumptions: string[]
    }
    expense_projections: {
      year_1: string
      year_2: string
      year_3: string
    }
    break_even_analysis: string
    funding_requirements: string
    use_of_funds: Array<{
      category: string
      amount: string
      description: string
    }>
  }
  risk_analysis: {
    risks: Array<{
      risk: string
      impact: string
      mitigation: string
    }>
  }
  implementation_timeline: {
    milestones: Array<{
      phase: string
      timeline: string
      activities: string[]
    }>
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessIdea, industry, targetMarket, fundingNeeded, businessName } = await req.json()

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

    const prompt = `You are an expert business consultant and strategist specializing in creating comprehensive, professional business plans. Based on the following information, create a detailed, high-quality business plan.

Business Information:
- Business Name: ${businessName || "To be determined"}
- Business Idea: ${businessIdea}
${industry ? `- Industry: ${industry}` : ""}
${targetMarket ? `- Target Market: ${targetMarket}` : ""}
${fundingNeeded ? `- Funding Needed: ${fundingNeeded}` : ""}

Create a comprehensive business plan that includes all standard sections:

1. EXECUTIVE SUMMARY
   - Business name and mission statement
   - Business overview (2-3 paragraphs)
   - Key objectives (3-5 bullet points)
   - Financial highlights (summary of key financial metrics)

2. COMPANY DESCRIPTION
   - Company name and legal structure recommendation
   - Location considerations
   - Company history/background
   - Products/services offered
   - Competitive advantages (3-5 key points)

3. MARKET ANALYSIS
   - Industry overview and trends
   - Target market description
   - Market size and opportunity
   - Market trends (3-5 key trends)
   - Customer analysis (demographics, psychographics, needs)
   - Competitor analysis (main competitors and competitive positioning)

4. ORGANIZATION & MANAGEMENT
   - Organizational structure
   - Management team (key roles needed, ideal experience)
   - Advisors/board recommendations
   - Hiring plan

5. SERVICE/PRODUCT LINE
   - Detailed product/service descriptions
   - Pricing strategy for each product/service
   - Target market for each offering
   - Research & development plans
   - Intellectual property considerations

6. MARKETING & SALES STRATEGY
   - Marketing strategy (channels, messaging, positioning)
   - Sales strategy (sales process, sales team structure)
   - Pricing strategy (detailed pricing model)
   - Distribution channels
   - Promotional activities (3-5 key activities)
   - Sales forecast (realistic projections)

7. FINANCIAL PROJECTIONS
   - Startup costs (detailed breakdown)
   - Revenue projections (Year 1, 2, 3 with assumptions)
   - Expense projections (Year 1, 2, 3)
   - Break-even analysis
   - Funding requirements
   - Use of funds (if funding is needed)

8. RISK ANALYSIS
   - Key risks (3-5 major risks)
   - Impact assessment for each risk
   - Mitigation strategies for each risk

9. IMPLEMENTATION TIMELINE
   - Phased approach with milestones
   - Timeline for each phase
   - Key activities for each phase

Return a JSON object with this exact structure. Be realistic, specific, and actionable. Use professional business language. Make all financial figures realistic and justified.

{
  "executive_summary": {
    "business_name": "string",
    "mission_statement": "string",
    "business_overview": "string (2-3 paragraphs)",
    "key_objectives": ["objective 1", "objective 2"],
    "financial_highlights": "string (summary)"
  },
  "company_description": {
    "company_name": "string",
    "legal_structure": "string",
    "location": "string",
    "history": "string",
    "products_services": ["product 1", "product 2"],
    "competitive_advantages": ["advantage 1", "advantage 2"]
  },
  "market_analysis": {
    "industry_overview": "string",
    "target_market": "string",
    "market_size": "string",
    "market_trends": ["trend 1", "trend 2"],
    "customer_analysis": "string",
    "competitor_analysis": {
      "competitors": ["competitor 1", "competitor 2"],
      "competitive_positioning": "string"
    }
  },
  "organization_management": {
    "organizational_structure": "string",
    "management_team": [
      {
        "name": "string or 'To be hired'",
        "role": "string",
        "experience": "string"
      }
    ],
    "advisors": ["advisor type 1", "advisor type 2"],
    "hiring_plan": "string"
  },
  "service_product_line": {
    "products_services": [
      {
        "name": "string",
        "description": "string",
        "pricing": "string",
        "target_market": "string"
      }
    ],
    "research_development": "string",
    "intellectual_property": "string"
  },
  "marketing_sales": {
    "marketing_strategy": "string",
    "sales_strategy": "string",
    "pricing_strategy": "string",
    "distribution_channels": ["channel 1", "channel 2"],
    "promotional_activities": ["activity 1", "activity 2"],
    "sales_forecast": "string"
  },
  "financial_projections": {
    "startup_costs": [
      {
        "item": "string",
        "amount": "string (e.g., '$10,000')"
      }
    ],
    "revenue_projections": {
      "year_1": "string",
      "year_2": "string",
      "year_3": "string",
      "assumptions": ["assumption 1", "assumption 2"]
    },
    "expense_projections": {
      "year_1": "string",
      "year_2": "string",
      "year_3": "string"
    },
    "break_even_analysis": "string",
    "funding_requirements": "string",
    "use_of_funds": [
      {
        "category": "string",
        "amount": "string",
        "description": "string"
      }
    ]
  },
  "risk_analysis": {
    "risks": [
      {
        "risk": "string",
        "impact": "string",
        "mitigation": "string"
      }
    ]
  },
  "implementation_timeline": {
    "milestones": [
      {
        "phase": "string",
        "timeline": "string",
        "activities": ["activity 1", "activity 2"]
      }
    ]
  }
}`

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert business consultant specializing in creating comprehensive business plans. Always return valid JSON matching the requested schema. Do not include markdown code blocks or any text outside the JSON object.",
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
      const businessPlan: BusinessPlanResponse = JSON.parse(content)
      
      // Validate the response structure
      if (!businessPlan.executive_summary || !businessPlan.company_description) {
        return NextResponse.json(
          { error: "Invalid business plan structure" },
          { status: 500 }
        )
      }

      return NextResponse.json(businessPlan)
    } catch (parseError) {
      logger.error("Failed to parse business plan:", parseError)
      logger.error("Raw AI response:", content)
      
      // Try to repair the JSON
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
        const businessPlan: BusinessPlanResponse = JSON.parse(repaired)
        return NextResponse.json(businessPlan)
      } catch (repairError) {
        logger.error("Failed to repair JSON:", repairError)
        return NextResponse.json(
          { error: "Failed to generate business plan. Please try again." },
          { status: 500 }
        )
      }
    }
  } catch (error: unknown) {
    logger.error("Business Plan Generator error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate business plan"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


