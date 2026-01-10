// Database client setup using Supabase
import { createClient } from '@/lib/supabase/server'

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
  
  // Collaboration
  getProjectMembers: (projectId: string) => Promise<any[]>
  addProjectMember: (projectId: string, userId: string, role: 'owner' | 'editor' | 'viewer', invitedBy: string) => Promise<any>
  updateMemberRole: (memberId: string, role: 'owner' | 'editor' | 'viewer') => Promise<any>
  removeProjectMember: (memberId: string) => Promise<void>
  getProjectInvitations: (projectId: string) => Promise<any[]>
  createInvitation: (projectId: string, email: string, role: 'editor' | 'viewer', invitedBy: string, token: string, expiresAt: string) => Promise<any>
  acceptInvitation: (token: string, userId: string) => Promise<any>
  getProjectActivity: (projectId: string, limit?: number) => Promise<any[]>
  logProjectActivity: (projectId: string, userId: string, activityType: string, description: string, metadata?: Record<string, any>) => Promise<any>
  getProjectComments: (projectId: string, stepId?: string) => Promise<any[]>
  addComment: (projectId: string, userId: string, commentText: string, stepId?: string, parentCommentId?: string) => Promise<any>
  updateComment: (commentId: string, commentText: string) => Promise<any>
  deleteComment: (commentId: string) => Promise<void>
  checkProjectAccess: (projectId: string, userId: string) => Promise<{ hasAccess: boolean; role?: string }>
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const db: DbClient = {
  createProject: async (userId: string, name: string) => {
    const supabase = createClient()
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
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
    return data || []
  },

  getProjectById: async (projectId: string) => {
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
    // Delete related data first (cascade should handle this, but being explicit)
    // Note: Supabase RLS and foreign key constraints should handle cascading deletes
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    
    if (error) throw new Error(`Failed to delete project: ${error.message}`)
  },

  getStep: async (projectId: string, stepKey: string) => {
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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

  // Collaboration functions
  getProjectMembers: async (projectId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
    
    if (error) throw new Error(`Failed to fetch project members: ${error.message}`)
    
    // Fetch user emails for each member
    const membersWithUsers = await Promise.all(
      (data || []).map(async (member: any) => {
        try {
          // Note: In production, you'd want to store user emails in a user_profiles table
          // For now, we'll return the user_id and let the frontend handle display
          return {
            ...member,
            user_email: null, // Will be populated by frontend if needed
          }
        } catch {
          return member
        }
      })
    )
    
    return membersWithUsers
  },

  addProjectMember: async (projectId: string, userId: string, role: 'owner' | 'editor' | 'viewer', invitedBy: string) => {
    const supabase = createClient()
    const member = {
      id: generateId(),
      project_id: projectId,
      user_id: userId,
      role,
      invited_by: invitedBy,
      status: 'active',
      joined_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('project_members')
      .insert(member)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to add project member: ${error.message}`)
    return data
  },

  updateMemberRole: async (memberId: string, role: 'owner' | 'editor' | 'viewer') => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('project_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update member role: ${error.message}`)
    return data
  },

  removeProjectMember: async (memberId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId)
    
    if (error) throw new Error(`Failed to remove project member: ${error.message}`)
  },

  getProjectInvitations: async (projectId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('project_id', projectId)
      .is('accepted_at', null)
      .is('declined_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch invitations: ${error.message}`)
    return data || []
  },

  createInvitation: async (projectId: string, email: string, role: 'editor' | 'viewer', invitedBy: string, token: string, expiresAt: string) => {
    const supabase = createClient()
    const invitation = {
      id: generateId(),
      project_id: projectId,
      email,
      role,
      token,
      invited_by: invitedBy,
      expires_at: expiresAt,
    }
    const { data, error } = await supabase
      .from('project_invitations')
      .insert(invitation)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create invitation: ${error.message}`)
    return data
  },

  acceptInvitation: async (token: string, userId: string) => {
    const supabase = createClient()
    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .is('declined_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (inviteError || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    // Add member
    const member = await db.addProjectMember(
      invitation.project_id,
      userId,
      invitation.role,
      invitation.invited_by
    )

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('project_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)
    
    if (updateError) throw new Error(`Failed to accept invitation: ${updateError.message}`)
    
    return member
  },

  getProjectActivity: async (projectId: string, limit: number = 50) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('project_activity')
      .select('*, user:auth.users(id, email)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw new Error(`Failed to fetch project activity: ${error.message}`)
    return data || []
  },

  logProjectActivity: async (projectId: string, userId: string, activityType: string, description: string, metadata: Record<string, any> = {}) => {
    const supabase = createClient()
    const activity = {
      id: generateId(),
      project_id: projectId,
      user_id: userId,
      activity_type: activityType,
      description,
      metadata,
    }
    const { data, error } = await supabase
      .from('project_activity')
      .insert(activity)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to log activity: ${error.message}`)
    return data
  },

  getProjectComments: async (projectId: string, stepId?: string) => {
    const supabase = createClient()
    let query = supabase
      .from('project_comments')
      .select('*, user:auth.users(id, email)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    
    if (stepId) {
      query = query.eq('step_id', stepId)
    } else {
      query = query.is('step_id', null)
    }
    
    const { data, error } = await query
    
    if (error) throw new Error(`Failed to fetch comments: ${error.message}`)
    return data || []
  },

  addComment: async (projectId: string, userId: string, commentText: string, stepId?: string, parentCommentId?: string) => {
    const supabase = createClient()
    const comment = {
      id: generateId(),
      project_id: projectId,
      step_id: stepId || null,
      user_id: userId,
      comment_text: commentText,
      parent_comment_id: parentCommentId || null,
    }
    const { data, error } = await supabase
      .from('project_comments')
      .insert(comment)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to add comment: ${error.message}`)
    return data
  },

  updateComment: async (commentId: string, commentText: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('project_comments')
      .update({ 
        comment_text: commentText,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update comment: ${error.message}`)
    return data
  },

  deleteComment: async (commentId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('project_comments')
      .delete()
      .eq('id', commentId)
    
    if (error) throw new Error(`Failed to delete comment: ${error.message}`)
  },

  checkProjectAccess: async (projectId: string, userId: string) => {
    const supabase = createClient()
    // Check if user is project owner
    const project = await db.getProjectById(projectId)
    if (project && String(project.user_id) === String(userId)) {
      return { hasAccess: true, role: 'owner' }
    }

    // Check if user is a member
    const { data: member } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (member) {
      return { hasAccess: true, role: member.role }
    }

    return { hasAccess: false }
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



