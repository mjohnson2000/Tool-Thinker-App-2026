import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface FinancialModel {
  business_model: {
    revenue_model: string
    pricing_strategy: string
    customer_segments: string[]
  }
  unit_economics: {
    customer_acquisition_cost: {
      value: string
      calculation: string
      assumptions: string[]
    }
    lifetime_value: {
      value: string
      calculation: string
      assumptions: string[]
    }
    payback_period: {
      value: string
      calculation: string
    }
    ltv_cac_ratio: {
      value: string
      interpretation: string
    }
    gross_margin: {
      value: string
      calculation: string
    }
  }
  revenue_projections: {
    monthly: Array<{
      month: string
      new_customers: number
      total_customers: number
      revenue: number
      assumptions: string
    }>
    yearly: Array<{
      year: number
      revenue: number
      customers: number
      assumptions: string[]
    }>
  }
  expense_projections: {
    categories: Array<{
      category: string
      monthly_amount: number
      yearly_amount: number
      notes: string
    }>
    total_monthly: number
    total_yearly: number
  }
  cash_flow: {
    monthly: Array<{
      month: string
      revenue: number
      expenses: number
      net_cash_flow: number
      cumulative: number
    }>
    break_even_month: string
    runway_months: number
  }
  key_metrics: {
    burn_rate: string
    growth_rate: string
    churn_rate: string
    arpu: string
  }
  financial_health: {
    assessment: string
    risks: string[]
    recommendations: string[]
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessModel, pricing, monthlyCustomers, customerLifetime, cac, monthlyExpenses, startingCapital } = await req.json()

    if (!businessModel || !businessModel.trim()) {
      return NextResponse.json(
        { error: "Business model description is required" },
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

    const prompt = `You are a financial analyst and startup advisor. Create a comprehensive financial model based on the following business information.

Business Information:
- Business Model: ${businessModel}
${pricing ? `- Pricing: ${pricing}` : ""}
${monthlyCustomers ? `- Expected Monthly New Customers: ${monthlyCustomers}` : ""}
${customerLifetime ? `- Customer Lifetime (months): ${customerLifetime}` : ""}
${cac ? `- Customer Acquisition Cost (CAC): $${cac}` : ""}
${monthlyExpenses ? `- Monthly Operating Expenses: $${monthlyExpenses}` : ""}
${startingCapital ? `- Starting Capital: $${startingCapital}` : ""}

Create a comprehensive financial model that includes:

1. BUSINESS MODEL ANALYSIS
   - Revenue model description
   - Pricing strategy
   - Customer segments

2. UNIT ECONOMICS
   - Customer Acquisition Cost (CAC) - calculate if not provided
   - Lifetime Value (LTV) - calculate based on pricing and customer lifetime
   - Payback Period (CAC / Monthly Revenue per Customer)
   - LTV:CAC Ratio (should be 3:1 or higher)
   - Gross Margin (if applicable)

3. REVENUE PROJECTIONS (12 months + 3 years)
   - Monthly projections with customer growth
   - Yearly summaries
   - Realistic growth assumptions

4. EXPENSE PROJECTIONS
   - Categorized expenses (Personnel, Marketing, Operations, etc.)
   - Monthly and yearly totals
   - Notes on each category

5. CASH FLOW ANALYSIS
   - Monthly cash flow (Revenue - Expenses)
   - Cumulative cash flow
   - Break-even month
   - Runway (how many months until out of cash)

6. KEY METRICS
   - Monthly Burn Rate
   - Growth Rate (MoM)
   - Churn Rate (if applicable)
   - ARPU (Average Revenue Per User)

7. FINANCIAL HEALTH ASSESSMENT
   - Overall assessment
   - Key risks
   - Recommendations for improvement

Return a JSON object with this exact structure. Use realistic numbers based on the inputs provided. If certain values aren't provided, make reasonable assumptions and document them.

{
  "business_model": {
    "revenue_model": "string",
    "pricing_strategy": "string",
    "customer_segments": ["segment 1"]
  },
  "unit_economics": {
    "customer_acquisition_cost": {
      "value": "$XXX",
      "calculation": "string",
      "assumptions": ["assumption 1"]
    },
    "lifetime_value": {
      "value": "$XXX",
      "calculation": "string",
      "assumptions": ["assumption 1"]
    },
    "payback_period": {
      "value": "X months",
      "calculation": "string"
    },
    "ltv_cac_ratio": {
      "value": "X:1",
      "interpretation": "string"
    },
    "gross_margin": {
      "value": "XX%",
      "calculation": "string"
    }
  },
  "revenue_projections": {
    "monthly": [
      {
        "month": "Month 1",
        "new_customers": 10,
        "total_customers": 10,
        "revenue": 1000,
        "assumptions": "string"
      }
    ],
    "yearly": [
      {
        "year": 1,
        "revenue": 12000,
        "customers": 120,
        "assumptions": ["assumption 1"]
      }
    ]
  },
  "expense_projections": {
    "categories": [
      {
        "category": "Personnel",
        "monthly_amount": 5000,
        "yearly_amount": 60000,
        "notes": "string"
      }
    ],
    "total_monthly": 10000,
    "total_yearly": 120000
  },
  "cash_flow": {
    "monthly": [
      {
        "month": "Month 1",
        "revenue": 1000,
        "expenses": 10000,
        "net_cash_flow": -9000,
        "cumulative": -9000
      }
    ],
    "break_even_month": "Month X",
    "runway_months": 12
  },
  "key_metrics": {
    "burn_rate": "$X,XXX/month",
    "growth_rate": "XX% MoM",
    "churn_rate": "X%",
    "arpu": "$XX"
  },
  "financial_health": {
    "assessment": "string",
    "risks": ["risk 1"],
    "recommendations": ["recommendation 1"]
  }
}`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst and startup advisor. Always return valid JSON matching the requested schema. Do not include markdown code blocks.",
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
      const model: FinancialModel = JSON.parse(content)
      
      if (!model.unit_economics || !model.revenue_projections) {
        return NextResponse.json(
          { error: "Invalid financial model structure" },
          { status: 500 }
        )
      }

      return NextResponse.json(model)
    } catch (parseError) {
      console.error("Failed to parse financial model:", parseError)
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
        const model: FinancialModel = JSON.parse(repaired)
        return NextResponse.json(model)
      } catch (repairError) {
        console.error("Failed to repair JSON:", repairError)
        return NextResponse.json(
          { error: "Failed to generate financial model. Please try again." },
          { status: 500 }
        )
      }
    }
  } catch (error: any) {
    console.error("Financial Model Calculator error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate financial model" },
      { status: 500 }
    )
  }
}

