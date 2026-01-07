# Quick Setup: Project Tool Links Table

## Error You're Seeing
```
Failed to fetch references: Could not find the table 'public.project_tool_references' in the schema cache
```

## Solution: Create the Table

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button

### Step 3: Copy and Run This SQL

Copy the **entire contents** of this file:
- `lib/supabase/schema-project-tool-links.sql`

Or copy this SQL directly:

```sql
-- Project Tool References Table
-- Links tool outputs to project steps

CREATE TABLE IF NOT EXISTS project_tool_references (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id TEXT REFERENCES steps(id) ON DELETE CASCADE,
  tool_output_id TEXT NOT NULL REFERENCES tool_outputs(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  reference_type TEXT NOT NULL DEFAULT 'context',
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

-- RLS Policies
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
```

### Step 4: Run the Query
1. Paste the SQL into the editor
2. Click **"Run"** button (or press Cmd/Ctrl + Enter)
3. You should see "Success. No rows returned"

### Step 5: Verify
1. Go to **"Table Editor"** in left sidebar
2. You should see `project_tool_references` in the list
3. The table should have these columns:
   - id
   - project_id
   - step_id
   - tool_output_id
   - tool_id
   - tool_name
   - reference_type
   - created_at

## After Setup

Once the table is created, refresh your app and the tool linking feature will work!

The error will be gone and you'll be able to:
- Link tool outputs to projects
- View linked outputs in project steps
- Remove linked outputs

## Troubleshooting

If you get an error about foreign key constraints:
- Make sure `projects` table exists
- Make sure `steps` table exists  
- Make sure `tool_outputs` table exists

If you get an error about RLS policies:
- The policies should be created automatically
- If not, you can run them separately

