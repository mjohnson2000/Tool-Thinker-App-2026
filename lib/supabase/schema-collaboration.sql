-- Project Collaboration Schema
-- Run this SQL in your Supabase SQL Editor to enable collaboration features

-- 1. Project Members table - tracks who has access to projects
CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 2. Project Invitations table - tracks pending invitations
CREATE TABLE IF NOT EXISTS project_invitations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, email)
);

-- 3. Project Activity table - tracks all project changes
CREATE TABLE IF NOT EXISTS project_activity (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'project_created',
    'project_updated',
    'step_started',
    'step_completed',
    'step_updated',
    'member_invited',
    'member_joined',
    'member_left',
    'permission_changed',
    'comment_added',
    'tool_linked'
  )),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Project Comments table - comments on steps or project
CREATE TABLE IF NOT EXISTS project_comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id TEXT REFERENCES steps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  parent_comment_id TEXT REFERENCES project_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_status ON project_members(status);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(email);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_user_id ON project_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON project_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_step_id ON project_comments(step_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_members
-- Users can view members of projects they own OR their own membership record
-- This avoids recursion by not querying project_members within the policy
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    -- Project owner can view all members (check projects table, no recursion)
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Users can see their own membership record (direct check, no recursion)
    project_members.user_id = auth.uid()
  );

-- Project owners can insert members
CREATE POLICY "Project owners can add members" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.user_id = auth.uid()::text
    )
  );

-- Project owners can update member roles
CREATE POLICY "Project owners can update members" ON project_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.user_id = auth.uid()::text
    )
  );

-- Project owners can delete members
CREATE POLICY "Project owners can remove members" ON project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.user_id = auth.uid()::text
    )
  );

-- RLS Policies for project_invitations
-- Users can view invitations for projects they own
CREATE POLICY "Project owners can view invitations" ON project_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_invitations.project_id
      AND p.user_id = auth.uid()::text
    )
  );

-- Project owners can create invitations
CREATE POLICY "Project owners can create invitations" ON project_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_invitations.project_id
      AND p.user_id = auth.uid()::text
    )
  );

-- RLS Policies for project_activity
-- Users can view activity for projects they're members of
CREATE POLICY "Members can view project activity" ON project_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_activity.project_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_activity.project_id
      AND p.user_id = auth.uid()::text
    )
  );

-- Members can create activity
CREATE POLICY "Members can create activity" ON project_activity
  FOR INSERT WITH CHECK (
    -- Project owner can always create
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_activity.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Active members can create
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_activity.project_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
    )
  );

-- RLS Policies for project_comments
-- Members can view comments
CREATE POLICY "Members can view comments" ON project_comments
  FOR SELECT USING (
    -- Project owner can always view
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_comments.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Active members can view
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_comments.project_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
    )
  );

-- Members can create comments
CREATE POLICY "Members can create comments" ON project_comments
  FOR INSERT WITH CHECK (
    -- Project owner can always create
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_comments.project_id
      AND p.user_id = auth.uid()::text
    )
    OR
    -- Active members can create
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_comments.project_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
    )
  );

-- Members can update their own comments
CREATE POLICY "Members can update own comments" ON project_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Members can delete their own comments
CREATE POLICY "Members can delete own comments" ON project_comments
  FOR DELETE USING (user_id = auth.uid());

