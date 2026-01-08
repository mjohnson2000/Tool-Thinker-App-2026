import type { Framework } from "@/types/frameworks"

export const JTBD: Framework = {
  key: "jtbd",
  title: "Problem Clarity (Jobs To Be Done)",
  description: "Understand the job your customer is trying to get done",
  timeEstimate: "15-20 minutes",
  questions: [
    {
      id: "situation",
      label: "When does the problem happen?",
      type: "textarea",
      required: true,
      placeholder: "Describe the situation or context where the problem occurs...",
      helpText: "Think about the specific moment or circumstance when your customer experiences this problem. Consider time, location, triggers, or events that lead to the problem.",
      example: "Example: 'When a small business owner needs to invoice clients at the end of the month, they spend hours manually creating invoices in Word, calculating totals, and tracking payments in spreadsheets.'",
      minLength: 50,
      validation: (value: string) => {
        if (!value || value.trim().length < 50) {
          return "Please provide more detail (at least 50 characters)"
        }
        if (value.trim().split(/\s+/).length < 10) {
          return "Please write a complete sentence or two describing the situation"
        }
        return null
      },
    },
    {
      id: "pain",
      label: "What frustration or pain occurs?",
      type: "textarea",
      required: true,
      placeholder: "What makes this situation difficult or frustrating?",
      helpText: "Be specific about both the emotional and practical pain points. What feelings does this create? What costs (time, money, stress) does it impose?",
      example: "Example: 'They feel overwhelmed by the manual work, worry about making calculation errors, and lose billable hours that could be spent on growing their business. The process takes 3-4 hours monthly.'",
      minLength: 50,
      validation: (value: string) => {
        if (!value || value.trim().length < 50) {
          return "Please describe the pain points in more detail"
        }
        return null
      },
    },
    {
      id: "current_solution",
      label: "How do they solve it today?",
      type: "textarea",
      required: true,
      placeholder: "What workarounds or existing solutions do they use?",
      helpText: "Understanding current solutions reveals opportunities. What tools, processes, or workarounds do they currently use? Why aren't these solutions ideal?",
      example: "Example: 'They use Microsoft Word templates, Excel spreadsheets, and email reminders. Some use free invoicing tools but find them too basic. They often lose track of unpaid invoices and have to manually follow up.'",
    },
    {
      id: "who",
      label: "Who experiences this most?",
      type: "text",
      required: true,
      placeholder: "Describe the person or group...",
      helpText: "Be specific about demographics, role, or situation. The more specific you are, the better you can target your solution.",
      example: "Example: 'Freelance consultants and solo service providers (designers, coaches, consultants) who bill clients monthly and manage 5-20 active clients.'",
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




