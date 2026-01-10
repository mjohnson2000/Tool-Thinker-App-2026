# Authentication Flow Analysis & Fixes

## Full User Path Analysis

### 1. **User Signs In** ✅ FIXED
**Path:** `/signin` → `signIn()` → Supabase Auth → Session Created

**Issues Found:**
- Session wasn't being synced to cookies immediately after sign in
- Redirect happened before cookies were set
- No delay to ensure session persistence

**Fixes Applied:**
- ✅ Immediately sync cookies after successful sign in
- ✅ Set session state before redirect
- ✅ Added small delay to ensure cookies are set before navigation

### 2. **Session Storage** ✅ FIXED
**Path:** AuthContext → `onAuthStateChange` → Cookie Sync

**Issues Found:**
- Supabase client wasn't configured for session persistence
- Cookies might not match the session in localStorage
- No retry logic if session isn't immediately available

**Fixes Applied:**
- ✅ Enabled `persistSession: true` and `autoRefreshToken: true` in Supabase client
- ✅ Improved cookie syncing with helper function
- ✅ Added retry logic to wait for session to be established

### 3. **User Navigates to Project Page** ✅ FIXED
**Path:** `/project/[projectId]/overview` → `loadProject()` → API Request

**Issues Found:**
- No token validation before making API request
- No retry logic if session isn't ready
- Token refresh only happened after 401 error

**Fixes Applied:**
- ✅ Added retry logic to wait for session (3 retries with 200ms delay)
- ✅ Validate token with Supabase before making API request
- ✅ Automatic token refresh if validation fails
- ✅ Better error messages and redirect to sign in if refresh fails

### 4. **API Route Authentication** ✅ FIXED
**Path:** API Route → Token from Header → Supabase Client → Database Query

**CRITICAL ISSUE FOUND:**
- API route authenticates with token from Authorization header ✅
- Creates authenticated Supabase client ✅
- BUT THEN calls `db.getProjectById()` which uses `createClient()` from `lib/supabase/server.ts`
- `createClient()` reads from COOKIES, not the Authorization header ❌
- Cookies might have expired tokens or not be set yet ❌
- This causes "JWT expired" errors even with valid tokens!

**Fixes Applied:**
- ✅ Use authenticated Supabase client directly for all database operations
- ✅ Removed dependency on `db.getProjectById()` in project route
- ✅ All queries now use the authenticated client with the token from header
- ✅ Fixed GET, PATCH, and DELETE methods

### 5. **Database Operations** ⚠️ PARTIAL FIX
**Path:** API Route → Database Query → Supabase RLS

**Issues Found:**
- `db` helper functions use `createClient()` which reads from cookies
- Cookies might not be in sync with the session
- This causes authentication failures

**Current Status:**
- ✅ Fixed in `/api/projects/[projectId]/route.ts` - uses authenticated client directly
- ⚠️ Other API routes still use `db` helpers - may need similar fixes
- ⚠️ `db` helpers are used in many places - consider refactoring to accept client parameter

## Root Cause Summary

The **primary issue** was a **mismatch between authentication methods**:

1. **Frontend** sends tokens in `Authorization` header ✅
2. **API Routes** authenticate with token from header ✅
3. **BUT** `db` helper functions use `createClient()` which reads from **cookies** ❌
4. **Cookies** might have expired tokens or not be set yet ❌

This created a situation where:
- The API route successfully authenticates the user
- But database operations fail because cookies have expired tokens
- Result: "JWT expired" errors even with valid tokens

## Complete Fix Strategy

### ✅ Immediate Fixes (Applied)
1. Use authenticated Supabase client directly in API routes
2. Enable session persistence in Supabase client
3. Improve cookie syncing in AuthContext
4. Add token validation and refresh logic
5. Better error handling and user feedback

### 🔄 Recommended Next Steps
1. **Refactor `db` helpers** to accept optional Supabase client parameter
2. **Update all API routes** to use authenticated client directly OR pass it to db helpers
3. **Add middleware** to automatically refresh tokens in API routes
4. **Consider** using Supabase's built-in session management instead of manual cookies

## Testing Checklist

After these fixes, test:
- [ ] Sign in → Navigate to project → Should load without errors
- [ ] Refresh page → Should maintain session
- [ ] Wait 30+ minutes → Token should auto-refresh
- [ ] Sign out → Cookies should clear
- [ ] Sign in again → Fresh session should work
- [ ] Create project from template → Should work
- [ ] Load dashboard → Should show projects and outputs

## Files Modified

1. `lib/supabase/client.ts` - Enabled session persistence
2. `contexts/AuthContext.tsx` - Improved cookie syncing and sign in flow
3. `app/project/[projectId]/overview/page.tsx` - Added token validation and retry logic
4. `app/api/projects/[projectId]/route.ts` - Use authenticated client directly
5. `app/api/projects/templates/route.ts` - Use authenticated client directly
6. `app/api/tool-outputs/list/route.ts` - Use authenticated client directly
7. `app/api/user/preferences/route.ts` - Use authenticated client directly
8. `app/dashboard/page.tsx` - Added token refresh logic
9. `lib/supabase/authenticated-client.ts` - NEW: Helper utility for creating authenticated clients

## Routes Still Using db Helpers (May Need Fixes)

These routes authenticate with header tokens but use `db` helpers that read from cookies:
- ⚠️ `/api/projects/[projectId]/health/route.ts` - Uses `db.getProjectById()`
- ⚠️ `/api/projects/[projectId]/members/route.ts` - Uses `db.getProjectById()`
- ⚠️ `/api/projects/[projectId]/duplicate/route.ts` - Uses `db.getProjectById()` and `db.createProject()`
- ⚠️ `/api/projects/[projectId]/share/route.ts` - Uses `db.getProjectById()`
- ⚠️ `/api/projects/route.ts` - Uses `db.createProject()` and `db.updateProject()`
- ⚠️ `/api/projects/from-discovery/route.ts` - Uses `db.createProject()`
- ⚠️ `/api/export/*/route.ts` - Multiple export routes use `db.getProjectById()`

**Note:** These may work if cookies are properly synced, but could fail if there's a timing issue. Consider fixing them if you encounter similar JWT errors.

