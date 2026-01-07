# Onboarding Flow - Complete Analysis

## Current Implementation Status

### ✅ What Works

1. **Home Page Path Selection**
   - Path selection cards displayed on home page
   - NewUserHighlight shows subtle notification for new users
   - PathSelectionCard tracks selection and navigates with onboarding params
   - Saves path selection to user preferences

2. **Project Path Onboarding**
   - `/dashboard?onboarding=project` triggers ProjectOnboarding
   - Shows tooltips for:
     - New project button
     - Projects section
     - Quick actions
   - Uses OnboardingTooltip component

3. **Onboarding State Management**
   - `useOnboarding` hook tracks completion/skipped state
   - Loads from user preferences
   - Functions to mark complete/skipped

### ❌ What's Missing

1. **Discovery Path Onboarding**
   - `/tools/idea-discovery?onboarding=true` has no onboarding component
   - No tooltips or guidance for new users
   - Should explain the discovery journey

2. **Explore Path Onboarding**
   - `/tools?onboarding=true` has no onboarding component
   - No tooltips or guidance for new users
   - Should explain tool categories and how to use tools

3. **Onboarding Completion**
   - ProjectOnboarding doesn't mark onboarding as complete
   - No way to mark complete after tooltips finish
   - Users might see tooltips again if they revisit

4. **Code Cleanup**
   - OnboardingWrapper has unused code (showModal, handleComplete, handleSkip)
   - OnboardingModal is imported but not used
   - Dead code should be removed

## Complete User Flow

### New User Journey

```
1. Sign Up
   ↓
2. Redirected to Home Page (/)
   ↓
3. See Path Selection Cards
   - NewUserHighlight shows subtle notification
   - Three options: Project, Discovery, Explore
   ↓
4. User Clicks a Path
   - PathSelectionCard saves selection
   - Navigates with onboarding param
   ↓
5. Path-Specific Onboarding
   
   A. Project Path → /dashboard?onboarding=project
      ✅ ProjectOnboarding shows tooltips
      ❌ Doesn't mark onboarding complete
   
   B. Discovery Path → /tools/idea-discovery?onboarding=true
      ❌ No onboarding component
      ❌ No guidance shown
   
   C. Explore Path → /tools?onboarding=true
      ❌ No onboarding component
      ❌ No guidance shown
```

## Required Fixes

### 1. Discovery Path Onboarding
- Create `DiscoveryOnboarding` component
- Show tooltips explaining:
  - What Idea Discovery is
  - How the journey works
  - Progress tracking
- Mark onboarding complete when finished

### 2. Explore Path Onboarding
- Create `ToolsOnboarding` component
- Show tooltips explaining:
  - Tool categories
  - How to use tools
  - Saving outputs
- Mark onboarding complete when finished

### 3. Mark Onboarding Complete
- Update ProjectOnboarding to call `markOnboardingComplete()`
- Update DiscoveryOnboarding to call `markOnboardingComplete()`
- Update ToolsOnboarding to call `markOnboardingComplete()`

### 4. Code Cleanup
- Remove unused code from OnboardingWrapper
- Remove unused OnboardingModal import (or keep for future use)
- Clean up unused state variables

## Implementation Plan

1. ✅ Create DiscoveryOnboarding component
2. ✅ Create ToolsOnboarding component
3. ✅ Update ProjectOnboarding to mark complete
4. ✅ Clean up OnboardingWrapper
5. ✅ Test complete flow

