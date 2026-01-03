export type ProjectStatus = "draft" | "active" | "archived"
export type StepStatus = "not_started" | "in_progress" | "completed"

export interface Project {
  id: string
  user_id: string
  name: string
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface Step {
  id: string
  project_id: string
  step_key: string
  status: StepStatus
  started_at?: string
  completed_at?: string
}

export interface StepInput {
  id: string
  step_id: string
  data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface StepOutput {
  id: string
  step_id: string
  ai_output: Record<string, any>
  user_edited_output?: Record<string, any>
  version: number
  created_at: string
}

export interface Feedback {
  id: string
  step_id: string
  rating_clarity: number
  rating_usefulness: number
  notes?: string
  outcome_signal?: Record<string, any>
  created_at: string
}

export interface Event {
  id: string
  user_id: string
  project_id?: string
  event_type: string
  payload: Record<string, any>
  created_at: string
}



