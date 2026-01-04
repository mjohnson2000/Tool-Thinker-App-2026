import type { Framework } from "@/types/frameworks"

export const ValueProp: Framework = {
  key: "value_prop",
  title: "Value Proposition",
  description: "Define what makes your solution uniquely valuable",
  questions: [
    {
      id: "target_customer",
      label: "Who is your target customer?",
      type: "text",
      required: true,
      placeholder: "Be specific about demographics, role, or situation",
    },
    {
      id: "key_benefit",
      label: "What is the key benefit you provide?",
      type: "textarea",
      required: true,
      placeholder: "The primary value or outcome you deliver",
    },
    {
      id: "differentiator",
      label: "What makes you different?",
      type: "textarea",
      required: true,
      placeholder: "How you're uniquely better than alternatives",
    },
    {
      id: "proof_points",
      label: "What proof or evidence supports this?",
      type: "textarea",
      required: false,
      placeholder: "Data, testimonials, case studies, or logical reasoning",
    },
  ],
  completeness: (inputs) => {
    const required = ["target_customer", "key_benefit", "differentiator"]
    const missing = required.filter((key) => !inputs[key] || inputs[key].trim() === "")
    
    return {
      ok: missing.length === 0,
      missing,
      score: (required.length - missing.length) / required.length,
    }
  },
  outputSchema: {
    value_proposition: "string",
    target_customer: "string",
    key_benefits: "string[]",
    differentiators: "string[]",
    proof_points: "string[]",
  },
  prompt: (inputs) => {
    return `You are a startup strategist crafting a value proposition.

Analyze the following inputs:
- Target Customer: ${inputs.target_customer}
- Key Benefit: ${inputs.key_benefit}
- Differentiator: ${inputs.differentiator}
- Proof Points: ${inputs.proof_points || "None provided"}

Return a JSON object with this exact structure:
{
  "value_proposition": "A clear, compelling one-sentence value proposition",
  "target_customer": "Refined description of the target customer",
  "key_benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "differentiators": ["Differentiator 1", "Differentiator 2"],
  "proof_points": ["Proof point 1", "Proof point 2"]
}

Make it specific, credible, and focused on customer outcomes.`
  },
}




