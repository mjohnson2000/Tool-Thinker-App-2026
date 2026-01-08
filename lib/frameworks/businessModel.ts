import type { Framework } from "@/types/frameworks"

export const BusinessModel: Framework = {
  key: "business_model",
  title: "Business Model",
  description: "Define how your business creates, delivers, and captures value",
  timeEstimate: "15-20 minutes",
  questions: [
    {
      id: "revenue_streams",
      label: "How will you make money?",
      type: "textarea",
      required: true,
      placeholder: "Describe your primary revenue streams (e.g., subscriptions, transactions, ads)",
    },
    {
      id: "pricing_model",
      label: "What is your pricing model?",
      type: "text",
      required: true,
      placeholder: "e.g., $9/month, $50 one-time, freemium",
    },
    {
      id: "cost_structure",
      label: "What are your main costs?",
      type: "textarea",
      required: true,
      placeholder: "Key expenses (development, marketing, operations, etc.)",
    },
    {
      id: "key_resources",
      label: "What resources do you need?",
      type: "textarea",
      required: false,
      placeholder: "People, technology, partnerships, capital",
    },
    {
      id: "key_activities",
      label: "What activities create value?",
      type: "textarea",
      required: false,
      placeholder: "Core activities that drive your business",
    },
  ],
  completeness: (inputs) => {
    const required = ["revenue_streams", "pricing_model", "cost_structure"]
    const missing = required.filter((key) => !inputs[key] || inputs[key].trim() === "")
    
    return {
      ok: missing.length === 0,
      missing,
      score: (required.length - missing.length) / required.length,
    }
  },
  outputSchema: {
    business_model_summary: "string",
    revenue_streams: "string[]",
    pricing_strategy: "string",
    cost_structure: "string[]",
    unit_economics: "string",
    scalability: "string",
  },
  prompt: (inputs) => {
    return `You are a startup strategist designing a business model.

Analyze the following inputs:
- Revenue Streams: ${inputs.revenue_streams}
- Pricing Model: ${inputs.pricing_model}
- Cost Structure: ${inputs.cost_structure}
- Key Resources: ${inputs.key_resources || "Not specified"}
- Key Activities: ${inputs.key_activities || "Not specified"}

Return a JSON object with this exact structure:
{
  "business_model_summary": "A clear summary of how the business creates and captures value",
  "revenue_streams": ["Stream 1", "Stream 2"],
  "pricing_strategy": "Analysis of the pricing approach and rationale",
  "cost_structure": ["Cost 1", "Cost 2", "Cost 3"],
  "unit_economics": "Brief analysis of unit economics (revenue per customer vs cost per customer)",
  "scalability": "Assessment of how well this model scales"
}

Be realistic and specific. Focus on sustainability and growth potential.`
  },
}




