import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { 
      teamMembers,
      location,
      benefitsPercentage
    } = await req.json()

    if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
      return NextResponse.json(
        { error: "Team members array is required" },
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

    const prompt = `You are a startup HR and finance expert. Calculate comprehensive team cost analysis based on the following information.

Team Members (JSON array):
${JSON.stringify(teamMembers, null, 2)}

Each team member should include:
- Role/Title
- Base Salary (annual)
- Equity percentage (optional)
- Location (optional)

${location ? `Primary Location: ${location}` : ""}
${benefitsPercentage ? `Benefits Percentage: ${benefitsPercentage}%` : ""}

Generate a comprehensive team cost analysis that includes:

1. **Cost Per Employee**:
   - Base salary
   - Benefits cost (health insurance, 401k, etc.)
   - Taxes (employer payroll taxes)
   - Equity cost (if applicable)
   - Total cost per employee

2. **Total Team Costs**:
   - Monthly team cost
   - Annual team cost
   - Cost breakdown by category

3. **Cost by Role**:
   - Cost per role type
   - Average cost by department

4. **Hidden Costs**:
   - Recruiting costs
   - Onboarding costs
   - Equipment/software costs
   - Office space (if applicable)

5. **Equity Impact**:
   - Total equity allocated
   - Equity value at different valuations
   - Dilution impact

6. **Cost Optimization**:
   - Opportunities to reduce costs
   - Remote vs. in-office cost comparison
   - Contractor vs. employee comparison

Return a JSON object with this exact structure:

{
  "cost_per_employee": [
    {
      "name": "string",
      "role": "string",
      "base_salary": "$X,XXX",
      "benefits_cost": "$X,XXX",
      "taxes": "$X,XXX",
      "equity_percentage": "X%",
      "equity_value_at_10m": "$X,XXX",
      "total_annual_cost": "$X,XXX",
      "total_monthly_cost": "$X,XXX"
    }
  ],
  "total_team_costs": {
    "monthly": "$X,XXX",
    "annual": "$X,XXX,XXX",
    "breakdown": {
      "salaries": "$X,XXX,XXX",
      "benefits": "$X,XXX",
      "taxes": "$X,XXX",
      "equity": "X%"
    }
  },
  "cost_by_role": [
    {
      "role": "string",
      "count": X,
      "total_annual_cost": "$X,XXX",
      "average_cost_per_person": "$X,XXX"
    }
  ],
  "hidden_costs": {
    "recruiting": "$X,XXX per hire",
    "onboarding": "$X,XXX per hire",
    "equipment_software": "$X,XXX per employee/year",
    "office_space": "$X,XXX per employee/year (if applicable)",
    "total_hidden_annual": "$X,XXX"
  },
  "equity_impact": {
    "total_equity_allocated": "X%",
    "equity_value_at_10m_valuation": "$X,XXX,XXX",
    "equity_value_at_50m_valuation": "$X,XXX,XXX",
    "equity_value_at_100m_valuation": "$X,XXX,XXX",
    "dilution_impact": "string"
  },
  "cost_optimization": {
    "remote_vs_office": "string",
    "contractor_vs_employee": "string",
    "cost_reduction_opportunities": ["opportunity1", "opportunity2"]
  }
}

Calculate accurate costs based on standard employment costs. Include typical benefits (15-25% of salary), payroll taxes (7.65% FICA + state taxes), and realistic equity allocations.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a startup HR and finance expert. Always return valid JSON that strictly adheres to the team cost schema. Do not include markdown code blocks or any additional text.",
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
      const teamCost = JSON.parse(content)
      return NextResponse.json(teamCost)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Team Cost Calculator error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to calculate team costs" },
      { status: 500 }
    )
  }
}


