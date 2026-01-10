-- Project Reminders Schema
-- Run this SQL in your Supabase SQL Editor to enable reminders and deadlines

-- Project reminders table
CREATE TABLE IF NOT EXISTS project_reminders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reminder_date TIMESTAMPTZ NOT NULL,
  reminder_text TEXT,
  reminder_type TEXT DEFAULT 'deadline' CHECK (reminder_type IN ('deadline', 'milestone', 'review', 'custom')),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_reminders_user_id ON project_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_project_reminders_project_id ON project_reminders(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reminders_reminder_date ON project_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_project_reminders_completed ON project_reminders(completed);

-- Enable Row Level Security
ALTER TABLE project_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reminders"
  ON project_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
  ON project_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON project_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON project_reminders FOR DELETE
  USING (auth.uid() = user_id);

