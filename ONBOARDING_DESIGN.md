# Onboarding Design - Tool Thinker

## Current State

**What exists:**
- Sign up/Sign in page
- Dashboard with empty states
- No onboarding flow
- Users land on home page after signup

**What's missing:**
- Guided first-time experience
- Explanation of key concepts (Projects, Tools, Idea Discovery)
- Path selection (Do you have an idea? vs. Need to discover one?)
- Interactive tutorial or tour

---

## Proposed Onboarding Flow

### Phase 1: Welcome & Path Selection (Step 1)

**Screen:** Welcome screen with path selection

**Content:**
```
Welcome to Tool Thinker! 🎉

We help founders make quick progress with the right tools at the right time.

What would you like to do first?

[Option 1: I have a business idea]
→ "Great! Let's create a project to plan it step-by-step."

[Option 2: I need to discover an idea]
→ "Perfect! Let's use our Idea Discovery tool to find your next opportunity."

[Option 3: I just want to explore tools]
→ "No problem! Browse our 50+ tools to see what's available."
```

**Design:**
- Large, clear buttons
- Icons for each path
- Brief explanation under each option

---

### Phase 2: Context-Specific Onboarding

#### Path A: "I have a business idea" → Project Creation Flow

**Step 1: Create Your First Project**
- Modal or dedicated page
- Input: Project name
- Explanation: "A project is a structured workspace for building your startup plan"
- Example: "e.g., My SaaS Startup, EcoDelivery Service"

**Step 2: Quick Tour of Project Structure**
- Show project overview page
- Highlight: "You'll work through 3 steps:"
  1. Jobs To Be Done (Understand the problem)
  2. Value Proposition (Define your unique value)
  3. Business Model (Design how you'll make money)
- Show progress bar
- "Each step has helper tools to guide you"

**Step 3: Start First Step (JTBD)**
- Auto-navigate to first step
- Show tooltip/overlay explaining:
  - "Answer these questions to understand your customer's problem"
  - "Use helper tools on the right to get data"
  - "Click 'Generate Output' when ready"

**Step 4: Helper Tools Introduction**
- Highlight "Helper Tools" section
- "These tools help you gather data for this step"
- "Try the Customer Interview Generator to validate your problem"

---

#### Path B: "I need to discover an idea" → Idea Discovery Flow

**Step 1: Introduction to Idea Discovery**
- Navigate to Idea Discovery tool
- Show overlay explaining:
  - "This tool guides you through finding your business idea"
  - "We'll ask about your interests, goals, and situation"
  - "AI will generate personalized business opportunities"

**Step 2: Start Discovery Journey**
- Begin with landing step
- Show tooltip: "Choose whether you have a vague idea or need one from scratch"

**Step 3: Progress Through Steps**
- Show progress indicator
- Brief explanations at each step
- "You're doing great! Keep going..."

**Step 4: After Discovery Complete**
- Show summary
- CTA: "Create a Project to Plan This Idea"
- Auto-populate project with discovery data

---

#### Path C: "Just explore tools" → Tool Discovery Flow

**Step 1: Tools Page Tour**
- Navigate to `/tools`
- Show overlay highlighting:
  - Tool categories
  - Popular tools
  - Search functionality

**Step 2: Try a Tool**
- Suggest: "Try the Valuation Calculator"
- Show tooltip: "Tools generate outputs you can save and use in projects"

**Step 3: Save Output**
- After using tool: "Save this output to use later in a project"
- Show save button

---

### Phase 3: Key Concepts Explanation

**Tooltips/Overlays for:**
1. **Projects** - "Structured workspaces for planning your startup"
2. **Tools** - "50+ calculators and generators to get data and insights"
3. **Idea Discovery** - "Find and refine your business idea"
4. **Helper Tools** - "Contextual tools that help with each project step"
5. **Auto-fill** - "Link tool outputs to automatically fill project fields"

---

## Implementation Options

### Option 1: Modal-Based Onboarding
- Multi-step modal that appears after signup
- Can be dismissed
- "Skip tour" option
- Progress dots at bottom

### Option 2: Overlay/Tooltip System
- Interactive tooltips that highlight UI elements
- "Next" button to progress
- Can be skipped
- Saves completion state

### Option 3: Dedicated Onboarding Pages
- Full-page experience
- Step-by-step navigation
- More immersive
- Can't be accidentally skipped

### Option 4: Hybrid Approach (Recommended)
- **Path selection:** Modal or dedicated page
- **Context-specific:** Overlays/tooltips on relevant pages
- **Progressive disclosure:** Show concepts as users encounter them
- **Skip option:** Always available
- **Completion tracking:** Save to user preferences

---

## User Experience Flow

### New User Journey

```
1. Sign Up
   ↓
2. Welcome Screen (Path Selection)
   ↓
3. [Selected Path] → Context-Specific Onboarding
   ↓
4. First Action (Create Project / Use Tool / Discover Idea)
   ↓
5. Tooltips/Overlays as needed
   ↓
6. Dashboard (with helpful hints)
```

### Returning User Journey

```
1. Sign In
   ↓
2. Dashboard (no onboarding)
   ↓
3. Continue where they left off
```

---

## Key Features to Highlight

### 1. Projects
- **What:** Structured planning workspaces
- **Why:** Organize your startup planning
- **How:** Create → Fill steps → Generate plan

### 2. Tools
- **What:** 50+ calculators and generators
- **Why:** Get data and insights quickly
- **How:** Use standalone or link to projects

### 3. Idea Discovery
- **What:** Guided journey to find your idea
- **Why:** Start with a validated concept
- **How:** Answer questions → Get AI suggestions

### 4. Helper Tools
- **What:** Contextual tool recommendations
- **Why:** Know which tools to use when
- **How:** Appear in project steps automatically

### 5. Auto-Fill
- **What:** Link tool outputs to project fields
- **Why:** Save time, avoid manual entry
- **How:** Click "Fill Step" button

---

## Design Considerations

### Visual Design
- **Welcome Screen:** Clean, friendly, not overwhelming
- **Tooltips:** Non-intrusive, dismissible
- **Progress Indicators:** Show where user is in onboarding
- **Icons:** Use consistent iconography

### Content
- **Tone:** Friendly, encouraging, not condescending
- **Length:** Brief, scannable
- **Examples:** Use real examples
- **CTAs:** Clear, action-oriented

### Technical
- **State Management:** Track onboarding completion
- **Persistence:** Save to user preferences
- **Skip Option:** Always available
- **Replay:** Option to replay onboarding

---

## Database Schema Addition

```sql
-- Add to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS onboarding_path TEXT; -- 'project', 'discovery', 'explore'

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';
```

---

## Implementation Priority

### Phase 1: Basic Onboarding (Week 1)
1. ✅ Path selection screen
2. ✅ Context-specific first steps
3. ✅ Basic tooltips for key concepts

### Phase 2: Enhanced Onboarding (Week 2)
1. ✅ Interactive tooltips/overlays
2. ✅ Progress tracking
3. ✅ Skip/replay functionality

### Phase 3: Advanced Features (Week 3)
1. ✅ Personalized recommendations
2. ✅ Contextual help system
3. ✅ Onboarding analytics

---

## Success Metrics

- **Completion Rate:** % of users who complete onboarding
- **Time to First Action:** How quickly users create project/use tool
- **Feature Discovery:** % of users who discover key features
- **Retention:** Do onboarded users return more?

---

## Questions to Answer

1. **Should onboarding be mandatory or optional?**
   - Recommendation: Optional but strongly encouraged

2. **Should we track onboarding progress?**
   - Recommendation: Yes, save to user preferences

3. **Can users replay onboarding?**
   - Recommendation: Yes, add to settings

4. **Should onboarding be different for returning users?**
   - Recommendation: Show "What's New" instead

5. **How do we handle users who skip onboarding?**
   - Recommendation: Show contextual hints as they explore

---

## Next Steps

1. **Design mockups** for onboarding screens
2. **Implement path selection** screen
3. **Create tooltip/overlay system**
4. **Add onboarding state tracking**
5. **Test with real users**

