-- Project System Enhancements
-- Run this SQL in your Supabase SQL Editor to add new features

-- 1. Update projects table with enhanced status workflow
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'review', 'complete', 'archived')),
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- 2. Project Tags table
CREATE TABLE IF NOT EXISTS project_tags (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6', -- Default blue
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, tag)
);

-- 3. Project Notes table
CREATE TABLE IF NOT EXISTS project_notes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id TEXT REFERENCES steps(id) ON DELETE SET NULL,
  note_text TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'decision', 'learning', 'todo', 'issue', 'insight')),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Project Goals/Milestones table
CREATE TABLE IF NOT EXISTS project_goals (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  target_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_step_id ON project_notes(step_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_note_type ON project_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_project_goals_project_id ON project_goals(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);

-- Enable Row Level Security (RLS)
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_tags
CREATE POLICY "Users can view their own project tags" ON project_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can insert their own project tags" ON project_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can update their own project tags" ON project_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can delete their own project tags" ON project_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

-- RLS Policies for project_notes
CREATE POLICY "Users can view their own project notes" ON project_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_notes.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can insert their own project notes" ON project_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_notes.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can update their own project notes" ON project_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_notes.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can delete their own project notes" ON project_notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_notes.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

-- RLS Policies for project_goals
CREATE POLICY "Users can view their own project goals" ON project_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_goals.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can insert their own project goals" ON project_goals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_goals.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can update their own project goals" ON project_goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_goals.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can delete their own project goals" ON project_goals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_goals.project_id 
      AND projects.user_id = auth.uid()::TEXT
    )
  );

