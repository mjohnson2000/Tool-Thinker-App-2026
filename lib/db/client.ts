// Database client setup
// This is a placeholder - replace with your actual database client
// Options: Supabase, Prisma, or direct Postgres

// For now, we'll use a simple in-memory store for development
// Replace this with actual database calls

interface DbClient {
  // Projects
  createProject: (userId: string, name: string) => Promise<any>
  getProjects: (userId: string) => Promise<any[]>
  getProjectById: (projectId: string) => Promise<any | null>
  updateProject: (projectId: string, updates: Partial<any>) => Promise<any>
  
  // Steps
  getStep: (projectId: string, stepKey: string) => Promise<any | null>
  createStep: (projectId: string, stepKey: string) => Promise<any>
  updateStepStatus: (stepId: string, status: string, completedAt?: string) => Promise<any>
  
  // Step Inputs
  upsertStepInputs: (stepId: string, data: Record<string, any>) => Promise<any>
  getStepInputs: (stepId: string) => Promise<any | null>
  
  // Step Outputs
  createStepOutput: (stepId: string, aiOutput: Record<string, any>, version: number) => Promise<any>
  updateStepOutput: (outputId: string, userEditedOutput: Record<string, any>) => Promise<any>
  getStepOutput: (stepId: string) => Promise<any | null>
  
  // Feedback
  addFeedback: (stepId: string, ratingClarity: number, ratingUsefulness: number, notes?: string) => Promise<any>
  
  // Events
  logEvent: (userId: string, eventType: string, payload: Record<string, any>, projectId?: string) => Promise<any>
}

// In-memory store for development (replace with real DB)
const memoryStore: {
  projects: Map<string, any>
  steps: Map<string, any>
  stepInputs: Map<string, any>
  stepOutputs: Map<string, any>
  feedback: Map<string, any>
  events: any[]
} = {
  projects: new Map(),
  steps: new Map(),
  stepInputs: new Map(),
  stepOutputs: new Map(),
  feedback: new Map(),
  events: [],
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const db: DbClient = {
  createProject: async (userId: string, name: string) => {
    const project = {
      id: generateId(),
      user_id: userId,
      name,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    memoryStore.projects.set(project.id, project)
    return project
  },

  getProjects: async (userId: string) => {
    return Array.from(memoryStore.projects.values()).filter(
      (p) => p.user_id === userId
    )
  },

  getProjectById: async (projectId: string) => {
    return memoryStore.projects.get(projectId) || null
  },

  updateProject: async (projectId: string, updates: Partial<any>) => {
    const project = memoryStore.projects.get(projectId)
    if (!project) throw new Error("Project not found")
    const updated = { ...project, ...updates, updated_at: new Date().toISOString() }
    memoryStore.projects.set(projectId, updated)
    return updated
  },

  getStep: async (projectId: string, stepKey: string) => {
    const stepKey_ = `${projectId}-${stepKey}`
    return memoryStore.steps.get(stepKey_) || null
  },

  createStep: async (projectId: string, stepKey: string) => {
    const stepKey_ = `${projectId}-${stepKey}`
    const step = {
      id: generateId(),
      project_id: projectId,
      step_key: stepKey,
      status: "not_started",
      started_at: null,
      completed_at: null,
    }
    memoryStore.steps.set(stepKey_, step)
    return step
  },

  updateStepStatus: async (stepId: string, status: string, completedAt?: string) => {
    // Find step by id in memory store
    for (const [key, step] of memoryStore.steps.entries()) {
      if (step.id === stepId) {
        const updated = {
          ...step,
          status,
          completed_at: completedAt || step.completed_at,
          started_at: step.started_at || new Date().toISOString(),
        }
        memoryStore.steps.set(key, updated)
        return updated
      }
    }
    throw new Error("Step not found")
  },

  upsertStepInputs: async (stepId: string, data: Record<string, any>) => {
    const existing = memoryStore.stepInputs.get(stepId)
    if (existing) {
      const updated = {
        ...existing,
        data,
        updated_at: new Date().toISOString(),
      }
      memoryStore.stepInputs.set(stepId, updated)
      return updated
    }
    const newInput = {
      id: generateId(),
      step_id: stepId,
      data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    memoryStore.stepInputs.set(stepId, newInput)
    return newInput
  },

  getStepInputs: async (stepId: string) => {
    return memoryStore.stepInputs.get(stepId) || null
  },

  createStepOutput: async (stepId: string, aiOutput: Record<string, any>, version: number) => {
    const output = {
      id: generateId(),
      step_id: stepId,
      ai_output: aiOutput,
      user_edited_output: null,
      version,
      created_at: new Date().toISOString(),
    }
    memoryStore.stepOutputs.set(stepId, output)
    return output
  },

  updateStepOutput: async (outputId: string, userEditedOutput: Record<string, any>) => {
    for (const [key, output] of memoryStore.stepOutputs.entries()) {
      if (output.id === outputId) {
        const updated = {
          ...output,
          user_edited_output: userEditedOutput,
        }
        memoryStore.stepOutputs.set(key, updated)
        return updated
      }
    }
    throw new Error("Output not found")
  },

  getStepOutput: async (stepId: string) => {
    return memoryStore.stepOutputs.get(stepId) || null
  },

  addFeedback: async (stepId: string, ratingClarity: number, ratingUsefulness: number, notes?: string) => {
    const feedback = {
      id: generateId(),
      step_id: stepId,
      rating_clarity: ratingClarity,
      rating_usefulness: ratingUsefulness,
      notes: notes || null,
      outcome_signal: null,
      created_at: new Date().toISOString(),
    }
    memoryStore.feedback.set(stepId, feedback)
    return feedback
  },

  logEvent: async (userId: string, eventType: string, payload: Record<string, any>, projectId?: string) => {
    const event = {
      id: generateId(),
      user_id: userId,
      project_id: projectId || null,
      event_type: eventType,
      payload,
      created_at: new Date().toISOString(),
    }
    memoryStore.events.push(event)
    return event
  },
}

// Export helper to get step by project and step key
export async function getOrCreateStep(projectId: string, stepKey: string) {
  let step = await db.getStep(projectId, stepKey)
  if (!step) {
    step = await db.createStep(projectId, stepKey)
  }
  return step
}



