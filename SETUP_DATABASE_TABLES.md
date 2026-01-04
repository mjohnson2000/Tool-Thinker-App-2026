# Setup Database Tables in Supabase

## The Error
```
Could not find the table 'public.steps' in the schema cache
```

This means the database tables don't exist yet. You need to create them in Supabase.

## Quick Fix Steps

### Step 1: Go to Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project (should be `dejhoudyhqjxbcnrixdd`)

### Step 2: Open SQL Editor
1. Click on **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Run the Schema
1. Copy the entire contents of `lib/supabase/schema.sql` from your project
2. Paste it into the SQL Editor
3. Click **Run** (or press Cmd/Ctrl + Enter)
4. You should see "Success. No rows returned"

### Step 4: Verify Tables Were Created
1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - `projects`
   - `steps`
   - `step_inputs`
   - `step_outputs`
   - `feedback`
   - `events`

### Step 5: Restart Your App
After creating the tables, restart PM2:
```bash
pm2 restart tool-thinker
```

## Alternative: Quick Copy-Paste

If you have SSH access, you can view the schema file:
```bash
cat ~/tool-thinker/lib/supabase/schema.sql
```

Then copy it to Supabase SQL Editor.

## Troubleshooting

### If you get permission errors:
- The schema includes permissive Row Level Security (RLS) policies for development
- In production, you should restrict access based on `user_id`

### If tables already exist:
- You can drop them first:
```sql
DROP TABLE IF EXISTS events, feedback, step_outputs, step_inputs, steps, projects CASCADE;
```
- Then run the schema again

## After Setup

Once the tables are created:
- Your app will be able to create and save projects
- AI generation will work properly
- All data will persist across server restarts

