# Discovery → Project Integration Analysis

## Current Flow

### 1. Discovery Tool Collects:
- **Customer**: `title`, `description`, `icon`, `painPoints[]`
- **Job**: `title`, `description`, `problemStatement`
- **Solution**: `title`, `description`, `keyFeatures[]`
- **Business Area**: `title`, `description`, `icon`

### 2. Project Creation API (`/api/projects/from-discovery`)
Maps discovery data to JTBD step inputs:

**Mapping:**
- `who` ← Customer (title + description + pain points)
- `pain` ← Job problem statement
- `situation` ← Job description + business context
- `current_solution` ← Solution description + features

### 3. Step Page Loads
- Calls `/api/steps` (GET or POST)
- Receives `inputs` object
- Passes to `QuestionForm` as `initialValues`
- `QuestionForm` displays pre-filled values

## Issue Identified

**Problem**: User is asked again about customer even though it was identified in discovery.

**Root Cause**: The mapping was too minimal - only putting customer title + description in the `who` field, which might not feel comprehensive enough. Also, the data might not be loading correctly.

## Fix Applied

Enhanced the mapping to include:
1. **WHO field**: Customer title + full description + pain points (comprehensive)
2. **PAIN field**: Problem statement with job context
3. **SITUATION field**: Job description + business area context
4. **CURRENT_SOLUTION field**: Solution with features

This ensures all discovery data is properly transferred and the user sees their discovery work reflected in the project step.

## Verification Steps

1. Complete discovery journey
2. Click "Create Project from This Idea"
3. Navigate to JTBD step
4. Verify all fields are pre-filled with discovery data
5. User should see their customer info in the "who" field

## Next Steps (If Issue Persists)

1. Check if step inputs are being saved correctly (database)
2. Verify step loading API returns correct data
3. Check QuestionForm initialValues prop binding
4. Add debug logging to trace data flow

