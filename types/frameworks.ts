export type QuestionType = "text" | "textarea" | "select" | "number"

export interface Question {
  id: string
  label: string
  type: QuestionType
  required: boolean
  placeholder?: string
  options?: string[]
  helpText?: string
  example?: string
  minLength?: number
  maxLength?: number
  validation?: (value: any) => string | null // Returns error message or null if valid
}

export interface CompletenessResult {
  ok: boolean
  missing: string[]
  score?: number
}

export interface Framework {
  key: string
  title: string
  description?: string
  timeEstimate?: string // e.g., "15-20 minutes"
  questions: Question[]
  completeness: (inputs: Record<string, any>) => CompletenessResult
  outputSchema: Record<string, string | string[]>
  prompt: (inputs: Record<string, any>) => string
}

export interface FrameworkOutput {
  [key: string]: string | string[]
}




