# Supabase Setup Guide

## Step 1: Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `dejhoudyhqjxbcnrixdd`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `lib/supabase/schema.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

## Step 2: Verify Tables Were Created

1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - `projects`
   - `steps`
   - `step_inputs`
   - `step_outputs`
   - `feedback`
   - `events`

## Step 3: Test the Connection

Your app should now be able to:
- Create and save projects
- Store step data
- Persist all user data across server restarts

## Troubleshooting

### If you get permission errors:
- Check that Row Level Security (RLS) policies are created
- The schema includes permissive policies for development
- In production, you should restrict access based on `user_id`

### If tables already exist:
- You can drop them first: `DROP TABLE IF EXISTS events, feedback, step_outputs, step_inputs, steps, projects CASCADE;`
- Then run the schema again

## Next Steps

Once the database is set up:
1. Your app will automatically use Supabase instead of in-memory storage
2. All data will persist across server restarts
3. Data will be available when you deploy to Hostinger

## Environment Variables

Make sure your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=https://dejhoudyhqjxbcnrixdd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_agg_FhijhDhOMGwGP_w-6A_Vty1Qaq-
```

