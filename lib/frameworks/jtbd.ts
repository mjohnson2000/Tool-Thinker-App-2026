import type { Framework } from "@/types/frameworks"

export const JTBD: Framework = {
  key: "jtbd",
  title: "Problem Clarity (Jobs To Be Done)",
  description: "Understand the job your customer is trying to get done",
  questions: [
    {
      id: "situation",
      label: "When does the problem happen?",
      type: "textarea",
      required: true,
      placeholder: "Describe the situation or context where the problem occurs...",
      helpText: "Think about the specific moment or circumstance",
    },
    {
      id: "pain",
      label: "What frustration or pain occurs?",
      type: "textarea",
      required: true,
      placeholder: "What makes this situation difficult or frustrating?",
      helpText: "Be specific about the emotional and practical pain points",
    },
    {
      id: "current_solution",
      label: "How do they solve it today?",
      type: "textarea",
      required: true,
      placeholder: "What workarounds or existing solutions do they use?",
      helpText: "Understanding current solutions reveals opportunities",
    },
    {
      id: "who",
      label: "Who experiences this most?",
      type: "text",
      required: true,
      placeholder: "Describe the person or group...",
      helpText: "Be specific about demographics, role, or situation",
    },
  ],
  completeness: (inputs) => {
    const required = ["situation", "pain", "current_solution", "who"]
    const missing = required.filter((key) => !inputs[key] || inputs[key].trim() === "")
    
    return {
      ok: missing.length === 0,
      missing,
      score: (required.length - missing.length) / required.length,
    }
  },
  outputSchema: {
    job_statement: "string",
    struggling_moment: "string",
    desired_outcome: "string",
    opportunities: "string[]",
    risks: "string[]",
  },
  prompt: (inputs) => {
    return `You are a startup strategist using Jobs To Be Done thinking.

Analyze the following inputs:
- Situation: ${inputs.situation}
- Pain: ${inputs.pain}
- Current Solution: ${inputs.current_solution}
- Who: ${inputs.who}

Return a JSON object with this exact structure:
{
  "job_statement": "A clear statement of the job to be done (e.g., 'When [situation], I want to [desired outcome] so I can [benefit]')",
  "struggling_moment": "A specific description of the struggling moment",
  "desired_outcome": "What the customer wants to achieve",
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "risks": ["Risk 1", "Risk 2"]
}

Be concise, specific, and actionable. Focus on clarity over cleverness.`
  },
}



