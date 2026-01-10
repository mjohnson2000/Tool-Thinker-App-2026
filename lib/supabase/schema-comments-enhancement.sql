-- Comments Enhancement Schema
-- Run this SQL to add mentions and edit tracking to comments

-- Add mentions column to project_comments
ALTER TABLE project_comments 
  ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';

-- Add is_edited flag
ALTER TABLE project_comments 
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Create index for mentions (for searching)
CREATE INDEX IF NOT EXISTS idx_project_comments_mentions ON project_comments USING GIN(mentions);

