export type ProjectStatus = "draft" | "active" | "paused" | "review" | "complete" | "archived"
export type ProjectPriority = "low" | "medium" | "high" | "urgent"
export type StepStatus = "not_started" | "in_progress" | "completed"
export type NoteType = "general" | "decision" | "learning" | "todo" | "issue" | "insight"

export interface Project {
  id: string
  user_id: string
  name: string
  status: ProjectStatus
  priority?: ProjectPriority
  description?: string
  created_at: string
  updated_at: string
  archived_at?: string
  tags?: ProjectTag[]
  notes?: ProjectNote[]
  goals?: ProjectGoal[]
}

export interface ProjectTag {
  id: string
  project_id: string
  tag: string
  color?: string
  created_at: string
}

export interface ProjectNote {
  id: string
  project_id: string
  step_id?: string
  note_text: string
  note_type: NoteType
  is_pinned?: boolean
  created_at: string
  updated_at: string
}

export interface ProjectGoal {
  id: string
  project_id: string
  goal_text: string
  target_date?: string
  completed: boolean
  completed_at?: string
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




