-- Project Folders Schema
-- Run this SQL in your Supabase SQL Editor to enable project organization

-- Project folders table
CREATE TABLE IF NOT EXISTS project_folders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Add folder_id column to projects table
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS folder_id TEXT REFERENCES project_folders(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_folders_user_id ON project_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_folder_id ON projects(folder_id);

-- Enable Row Level Security
ALTER TABLE project_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own folders"
  ON project_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON project_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON project_folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON project_folders FOR DELETE
  USING (auth.uid() = user_id);

