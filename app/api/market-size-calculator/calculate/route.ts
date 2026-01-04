import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { 
      productDescription,
      targetCustomer,
      geographicScope,
      marketData,
      pricingAssumptions
    } = await req.json()

    if (!productDescription || !productDescription.trim()) {
      return NextResponse.json(
        { error: "Product description is required" },
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

    const prompt = `You are a market research analyst and TAM/SAM/SOM expert. Calculate comprehensive market size analysis (TAM, SAM, SOM) based on the following information.

Product/Service Description: ${productDescription}
${targetCustomer ? `Target Customer: ${targetCustomer}` : ""}
${geographicScope ? `Geographic Scope: ${geographicScope}` : ""}
${marketData ? `Market Data Provided: ${marketData}` : ""}
${pricingAssumptions ? `Pricing Assumptions: ${pricingAssumptions}` : ""}

Generate a comprehensive market size analysis that includes:

1. **TAM (Total Addressable Market)**:
   - Total market value
   - Calculation methodology
   - Data sources and assumptions
   - Market definition

2. **SAM (Serviceable Addressable Market)**:
   - Serviceable market value
   - How it's derived from TAM
   - Geographic and product constraints
   - Calculation breakdown

3. **SOM (Serviceable Obtainable Market)**:
   - Realistic market share achievable
   - Market penetration assumptions
   - Timeframe (1 year, 3 years, 5 years)
   - Competitive landscape considerations

4. **Market Segmentation**:
   - Key market segments
   - Size of each segment
   - Growth rates by segment

5. **Market Growth**:
   - Historical growth rates
   - Projected growth rates
   - Growth drivers

6. **Key Assumptions**: Document all assumptions used

7. **Validation**: 
   - How to validate these numbers
   - Data sources to verify
   - Industry benchmarks

Return a JSON object with this exact structure:

{
  "tam": {
    "value": "$X,XXX,XXX,XXX",
    "calculation": "string",
    "methodology": "string",
    "assumptions": ["assumption1", "assumption2"],
    "data_sources": ["source1", "source2"]
  },
  "sam": {
    "value": "$X,XXX,XXX,XXX",
    "calculation": "string",
    "how_derived_from_tam": "string",
    "constraints": ["constraint1", "constraint2"],
    "assumptions": ["assumption1"]
  },
  "som": {
    "year_1": {
      "value": "$X,XXX,XXX",
      "market_share": "X%",
      "assumptions": ["assumption1"]
    },
    "year_3": {
      "value": "$X,XXX,XXX",
      "market_share": "X%",
      "assumptions": ["assumption1"]
    },
    "year_5": {
      "value": "$X,XXX,XXX",
      "market_share": "X%",
      "assumptions": ["assumption1"]
    },
    "penetration_strategy": "string"
  },
  "market_segmentation": [
    {
      "segment_name": "string",
      "size": "$X,XXX,XXX",
      "growth_rate": "X%",
      "description": "string"
    }
  ],
  "market_growth": {
    "historical_cagr": "X%",
    "projected_cagr": "X%",
    "growth_drivers": ["driver1", "driver2"]
  },
  "assumptions": ["assumption1", "assumption2"],
  "validation": {
    "how_to_validate": ["method1", "method2"],
    "data_sources": ["source1", "source2"],
    "industry_benchmarks": "string"
  }
}

Use realistic market data and industry standards. If specific market data isn't provided, make reasonable estimates based on the product description and industry.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a market research analyst and TAM/SAM/SOM expert. Always return valid JSON that strictly adheres to the market size schema. Do not include markdown code blocks or any additional text.",
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
      const marketSize = JSON.parse(content)
      return NextResponse.json(marketSize)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Market Size Calculator error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to calculate market size" },
      { status: 500 }
    )
  }
}

