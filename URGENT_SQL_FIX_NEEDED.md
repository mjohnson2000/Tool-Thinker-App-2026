# ⚠️ URGENT: SQL Fix Required

## Issue
You're seeing this error in the terminal:
```
[ERROR] Error fetching project members: Error: Failed to fetch project members: infinite recursion detected in policy for relation "project_members"
```

## Cause
The RLS (Row Level Security) policy for `project_members` is causing infinite recursion because it queries itself.

## Solution
**You MUST run this SQL script in your Supabase SQL Editor:**

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of: `lib/supabase/schema-collaboration-fix-rls.sql`
4. Click "Run"

## What the Fix Does
The fix script:
- Drops the problematic recursive policies
- Recreates them without recursion
- Allows project owners to view all members
- Allows users to view their own membership record

## After Running the Fix
1. Refresh your application
2. The "Team Members" section should load without errors
3. You'll be able to invite team members successfully

## File Location
The fix script is at: `lib/supabase/schema-collaboration-fix-rls.sql`

---

**This is blocking the collaboration features from working. Please run the SQL fix ASAP.**

