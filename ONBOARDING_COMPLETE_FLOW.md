# Complete Onboarding Flow Analysis

## ✅ What's Working

### 1. Home Page Path Selection
- **Location:** `app/page.tsx`
- **Components:** `PathSelectionCard`, `NewUserHighlight`
- **Flow:**
  - New users see path selection cards on home page
  - `NewUserHighlight` shows subtle notification
  - User clicks a path → `PathSelectionCard` saves selection and navigates
- **Status:** ✅ Complete

### 2. Project Path Onboarding
- **Location:** `app/dashboard/page.tsx`
- **Component:** `ProjectOnboarding`
- **Flow:**
  - User navigates to `/dashboard?onboarding=project`
  - `ProjectOnboarding` shows tooltips for:
    - New project button
    - Projects section
    - Quick actions
- **Status:** ⚠️ Missing completion tracking

### 3. Onboarding State Management
- **Location:** `hooks/useOnboarding.ts`
- **Features:**
  - Tracks completion/skipped state
  - Loads from user preferences
  - Functions to mark complete/skipped
- **Status:** ✅ Complete

## ❌ What's Missing

### 1. Discovery Path Onboarding
- **Expected:** `/tools/idea-discovery?onboarding=true`
- **Missing:** No onboarding component
- **Needed:** Tooltips explaining:
  - What Idea Discovery is
  - How the journey works (9 steps)
  - Progress tracking
  - How to use AI-generated options

### 2. Explore Path Onboarding
- **Expected:** `/tools?onboarding=true`
- **Missing:** No onboarding component
- **Needed:** Tooltips explaining:
  - Tool categories
  - How to use tools
  - Saving outputs
  - Linking to projects

### 3. Onboarding Completion
- **Issue:** Tooltips don't mark onboarding as complete
- **Impact:** Users might see tooltips again
- **Fix:** Call `markOnboardingComplete()` when tooltips finish

### 4. Code Cleanup
- **Issue:** `OnboardingWrapper` has unused code
- **Fix:** Remove unused state and handlers

## Implementation Plan

### Step 1: Create DiscoveryOnboarding Component
- Show tooltips on Idea Discovery page
- Explain the discovery journey
- Mark onboarding complete when finished

### Step 2: Create ToolsOnboarding Component
- Show tooltips on Tools page
- Explain categories and tool usage
- Mark onboarding complete when finished

### Step 3: Update ProjectOnboarding
- Call `markOnboardingComplete()` when finished
- Ensure completion is tracked

### Step 4: Clean Up OnboardingWrapper
- Remove unused code
- Keep only necessary functionality

### Step 5: Integration
- Add DiscoveryOnboarding to Idea Discovery page
- Add ToolsOnboarding to Tools page
- Test complete flow

## User Flow Diagram

```
New User Sign Up
    ↓
Home Page (/)
    ├─ Path Selection Cards
    ├─ NewUserHighlight (subtle notification)
    └─ User clicks a path
        ↓
    Path Selection Saved
        ↓
    Navigate with onboarding param
        ↓
    ┌─────────────────────────────────────┐
    │                                     │
    ├─ Project Path                      │
    │   /dashboard?onboarding=project    │
    │   → ProjectOnboarding ✅            │
    │   → Tooltips shown                 │
    │   → ❌ Not marked complete         │
    │                                     │
    ├─ Discovery Path                    │
    │   /tools/idea-discovery?onboarding=true
    │   → ❌ No onboarding component     │
    │                                     │
    └─ Explore Path                      │
        /tools?onboarding=true           │
        → ❌ No onboarding component     │
```

## Next Steps

1. ✅ Create DiscoveryOnboarding
2. ✅ Create ToolsOnboarding
3. ✅ Update ProjectOnboarding to mark complete
4. ✅ Clean up OnboardingWrapper
5. ✅ Test complete flow

