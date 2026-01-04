-- Supabase Database Schema for Tool Thinker
-- Run this SQL in your Supabase SQL Editor to create the tables

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Steps table
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, step_key)
);

-- Step inputs table
CREATE TABLE IF NOT EXISTS step_inputs (
  id TEXT PRIMARY KEY,
  step_id TEXT NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_id)
);

-- Step outputs table
CREATE TABLE IF NOT EXISTS step_outputs (
  id TEXT PRIMARY KEY,
  step_id TEXT NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  ai_output JSONB,
  user_edited_output JSONB,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  step_id TEXT NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  rating_clarity INTEGER NOT NULL,
  rating_usefulness INTEGER NOT NULL,
  notes TEXT,
  outcome_signal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_steps_project_id ON steps(project_id);
CREATE INDEX IF NOT EXISTS idx_step_inputs_step_id ON step_inputs(step_id);
CREATE INDEX IF NOT EXISTS idx_step_outputs_step_id ON step_outputs(step_id);
CREATE INDEX IF NOT EXISTS idx_feedback_step_id ON feedback(step_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all - you can restrict later based on user_id)
-- In production, you should restrict access based on authenticated users
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on steps" ON steps
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on step_inputs" ON step_inputs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on step_outputs" ON step_outputs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on feedback" ON feedback
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on events" ON events
  FOR ALL USING (true) WITH CHECK (true);


