-- Tool Outputs and History Tables
-- Run this SQL in your Supabase SQL Editor

-- Tool outputs table - stores generated content from tools
CREATE TABLE IF NOT EXISTS tool_outputs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  output_data JSONB NOT NULL,
  input_data JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tool history table - tracks all tool usage
CREATE TABLE IF NOT EXISTS tool_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'generated', 'viewed', 'exported', 'shared'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tool_outputs_user_id ON tool_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_outputs_tool_id ON tool_outputs(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_outputs_created_at ON tool_outputs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_history_user_id ON tool_history(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_history_tool_id ON tool_history(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_history_created_at ON tool_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tool_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_outputs
CREATE POLICY "Users can view their own tool outputs" ON tool_outputs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool outputs" ON tool_outputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool outputs" ON tool_outputs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tool outputs" ON tool_outputs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tool_history
CREATE POLICY "Users can view their own tool history" ON tool_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool history" ON tool_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

