-- Project Tool References Table
-- Links tool outputs to project steps
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS project_tool_references (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id TEXT REFERENCES steps(id) ON DELETE CASCADE,
  tool_output_id TEXT NOT NULL REFERENCES tool_outputs(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  reference_type TEXT NOT NULL DEFAULT 'context', -- 'input', 'context', 'validation'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, step_id, tool_output_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_tool_refs_project_id ON project_tool_references(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tool_refs_step_id ON project_tool_references(step_id);
CREATE INDEX IF NOT EXISTS idx_project_tool_refs_tool_output_id ON project_tool_references(tool_output_id);
CREATE INDEX IF NOT EXISTS idx_project_tool_refs_tool_id ON project_tool_references(tool_id);

-- Enable Row Level Security (RLS)
ALTER TABLE project_tool_references ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_tool_references
-- Note: projects.user_id is TEXT, auth.uid() is UUID, so we cast both to text for comparison
CREATE POLICY "Users can view their own project tool references" ON project_tool_references
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tool_references.project_id 
      AND projects.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their own project tool references" ON project_tool_references
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tool_references.project_id 
      AND projects.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own project tool references" ON project_tool_references
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tool_references.project_id 
      AND projects.user_id = auth.uid()::text
    )
  );

