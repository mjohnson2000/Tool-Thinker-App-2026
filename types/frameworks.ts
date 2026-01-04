export type QuestionType = "text" | "textarea" | "select" | "number"

export interface Question {
  id: string
  label: string
  type: QuestionType
  required: boolean
  placeholder?: string
  options?: string[]
  helpText?: string
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
  questions: Question[]
  completeness: (inputs: Record<string, any>) => CompletenessResult
  outputSchema: Record<string, string | string[]>
  prompt: (inputs: Record<string, any>) => string
}

export interface FrameworkOutput {
  [key: string]: string | string[]
}




