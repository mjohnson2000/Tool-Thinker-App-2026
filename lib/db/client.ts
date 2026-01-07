// Database client setup using Supabase
import { supabase } from '@/lib/supabase/client'

interface DbClient {
  // Projects
  createProject: (userId: string, name: string) => Promise<any>
  getProjects: (userId: string) => Promise<any[]>
  getProjectById: (projectId: string) => Promise<any | null>
  updateProject: (projectId: string, updates: Partial<any>) => Promise<any>
  deleteProject: (projectId: string) => Promise<void>
  
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
    }
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create project: ${error.message}`)
    return data
  },

  getProjects: async (userId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
    return data || []
  },

  getProjectById: async (projectId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch project: ${error.message}`)
    }
    return data
  },

  updateProject: async (projectId: string, updates: Partial<any>) => {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update project: ${error.message}`)
    if (!data) throw new Error("Project not found")
    return data
  },

  deleteProject: async (projectId: string) => {
    // Delete related data first (cascade should handle this, but being explicit)
    // Note: Supabase RLS and foreign key constraints should handle cascading deletes
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    
    if (error) throw new Error(`Failed to delete project: ${error.message}`)
  },

  getStep: async (projectId: string, stepKey: string) => {
    const { data, error } = await supabase
      .from('steps')
      .select('*')
      .eq('project_id', projectId)
      .eq('step_key', stepKey)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch step: ${error.message}`)
    }
    return data
  },

  createStep: async (projectId: string, stepKey: string) => {
    const step = {
      id: generateId(),
      project_id: projectId,
      step_key: stepKey,
      status: "not_started",
      started_at: null,
      completed_at: null,
    }
    const { data, error } = await supabase
      .from('steps')
      .insert(step)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create step: ${error.message}`)
    return data
  },

  updateStepStatus: async (stepId: string, status: string, completedAt?: string) => {
    // First get the step to check if it exists
    const { data: existingStep } = await supabase
      .from('steps')
      .select('*')
      .eq('id', stepId)
      .single()
    
    if (!existingStep) throw new Error("Step not found")
    
    const updates: any = {
      status,
      started_at: existingStep.started_at || new Date().toISOString(),
    }
    
    if (completedAt) {
      updates.completed_at = completedAt
    }
    
    const { data, error } = await supabase
      .from('steps')
      .update(updates)
      .eq('id', stepId)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update step: ${error.message}`)
    return data
  },

  upsertStepInputs: async (stepId: string, data: Record<string, any>) => {
    // Check if step_inputs exists for this step
    const { data: existing } = await supabase
      .from('step_inputs')
      .select('*')
      .eq('step_id', stepId)
      .single()
    
    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from('step_inputs')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('step_id', stepId)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to update step inputs: ${error.message}`)
      return updated
    } else {
      // Create new
      const newInput = {
        id: generateId(),
        step_id: stepId,
        data,
      }
      const { data: created, error } = await supabase
        .from('step_inputs')
        .insert(newInput)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to create step inputs: ${error.message}`)
      return created
    }
  },

  getStepInputs: async (stepId: string) => {
    const { data, error } = await supabase
      .from('step_inputs')
      .select('*')
      .eq('step_id', stepId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch step inputs: ${error.message}`)
    }
    return data
  },

  createStepOutput: async (stepId: string, aiOutput: Record<string, any>, version: number) => {
    const output = {
      id: generateId(),
      step_id: stepId,
      ai_output: aiOutput,
      user_edited_output: null,
      version,
    }
    const { data, error } = await supabase
      .from('step_outputs')
      .insert(output)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create step output: ${error.message}`)
    return data
  },

  updateStepOutput: async (outputId: string, userEditedOutput: Record<string, any>) => {
    const { data, error } = await supabase
      .from('step_outputs')
      .update({ 
        user_edited_output: userEditedOutput,
        updated_at: new Date().toISOString()
      })
      .eq('id', outputId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') throw new Error("Output not found")
      throw new Error(`Failed to update step output: ${error.message}`)
    }
    return data
  },

  getStepOutput: async (stepId: string) => {
    const { data, error } = await supabase
      .from('step_outputs')
      .select('*')
      .eq('step_id', stepId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch step output: ${error.message}`)
    }
    return data
  },

  addFeedback: async (stepId: string, ratingClarity: number, ratingUsefulness: number, notes?: string) => {
    const feedback = {
      id: generateId(),
      step_id: stepId,
      rating_clarity: ratingClarity,
      rating_usefulness: ratingUsefulness,
      notes: notes || null,
      outcome_signal: null,
    }
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to add feedback: ${error.message}`)
    return data
  },

  logEvent: async (userId: string, eventType: string, payload: Record<string, any>, projectId?: string) => {
    const event = {
      id: generateId(),
      user_id: userId,
      project_id: projectId || null,
      event_type: eventType,
      payload,
    }
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to log event: ${error.message}`)
    return data
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



