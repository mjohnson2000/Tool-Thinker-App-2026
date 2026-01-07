# Setup Project Tool Links - Database Schema

## Quick Setup

The `project_tool_references` table needs to be created in your Supabase database.

## Steps

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the SQL Schema**
   - Copy the entire contents of `lib/supabase/schema-project-tool-links.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify Table Created**
   - Go to "Table Editor" in left sidebar
   - You should see `project_tool_references` table

## Alternative: Run via Terminal

If you have Supabase CLI installed:

```bash
supabase db push
```

Or manually run the SQL file:

```bash
psql -h your-db-host -U postgres -d postgres -f lib/supabase/schema-project-tool-links.sql
```

## What This Creates

- `project_tool_references` table
- Indexes for performance
- Row Level Security (RLS) policies
- Foreign key constraints

## After Setup

Once the table is created, the tool linking feature will work immediately. No code changes needed.

