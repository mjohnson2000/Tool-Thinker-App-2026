import type { Framework } from "@/types/frameworks"

export function buildPrompt(framework: Framework, inputs: Record<string, any>): string {
  return framework.prompt(inputs)
}

export function repairJsonPrompt(invalidJson: string): string {
  return `The following JSON is invalid. Repair it to be valid JSON. Return ONLY the repaired JSON, no explanation:

${invalidJson}`
}



