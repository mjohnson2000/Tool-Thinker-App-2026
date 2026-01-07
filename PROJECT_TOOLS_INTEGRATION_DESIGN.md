# Projects & Tools Integration Design

## Executive Summary

This document outlines how to integrate Tool Thinker's **Projects** (comprehensive planning system) with **Tools** (individual calculators/generators) to create a unified, cohesive user experience.

## Current State Problems

1. **Disconnected Systems**: Projects and tools operate independently
2. **User Confusion**: Users don't know when to use projects vs. tools
3. **Duplicate Work**: Same data entered multiple times
4. **No Context Sharing**: Tool outputs can't inform project steps
5. **Fragmented Experience**: Two separate workflows

## Vision: Unified Planning Workspace

**Projects become the central workspace** where users build their complete startup plan, with **tools serving as supporting utilities** that feed data and insights into the project.

---

## Integration Architecture

### 1. Data Model Integration

#### Unified Project Structure
```
Project
├── Basic Info (name, status, created_at)
├── Steps (JTBD, Value Prop, Business Model, etc.)
│   ├── Inputs (user answers)
│   ├── Outputs (AI-generated)
│   └── Tool References (links to tool outputs)
└── Tool Outputs (embedded or referenced)
    ├── Valuation Calculator → Used in Business Model step
    ├── Market Size Calculator → Used in Value Prop step
    ├── Financial Model → Used in Business Model step
    └── Business Plan Generator → Final export
```

#### New Database Schema Additions

```sql
-- Link tool outputs to project steps
CREATE TABLE project_tool_references (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id TEXT REFERENCES steps(id) ON DELETE CASCADE,
  tool_output_id TEXT NOT NULL REFERENCES tool_outputs(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  reference_type TEXT NOT NULL, -- 'input', 'context', 'validation'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, step_id, tool_output_id)
);

-- Store tool outputs directly in projects (optional embedded data)
CREATE TABLE project_tool_data (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## User Flow Integration

### Flow 1: Starting with a Tool, Then Creating a Project

```
1. User uses "Valuation Calculator" tool
   → Gets valuation result: $2.5M
   
2. Tool output page shows: "Save to Project" button
   → If no project exists: "Create New Project"
   → If projects exist: "Add to Existing Project"
   
3. User creates/selects project
   → Tool output automatically linked to project
   → Project's Business Model step shows: "Valuation: $2.5M (from Valuation Calculator)"
```

### Flow 2: Starting with a Project, Using Tools as Needed

```
1. User creates project: "My SaaS Startup"
   
2. In Business Model step, user sees:
   - Framework questions (revenue streams, pricing, etc.)
   - Helper section: "Need help? Use these tools:"
     • Valuation Calculator → Calculate startup valuation
     • Market Size Calculator → Calculate TAM/SAM/SOM
     • Financial Model Calculator → Project revenue/expenses
   
3. User clicks "Use Valuation Calculator"
   → Opens tool in modal or new tab
   → User fills calculator
   → Result shows: "Add to Project: My SaaS Startup"
   → Data auto-fills relevant project step fields
```

### Flow 3: Unified Dashboard View

```
Dashboard shows:
├── Projects
│   └── "My SaaS Startup"
│       ├── Progress: 2/3 steps complete
│       ├── Related Tool Outputs:
│       │   ├── Valuation: $2.5M (from Valuation Calculator)
│       │   ├── Market Size: $50M TAM (from Market Size Calculator)
│       │   └── Financial Model (from Financial Model Calculator)
│       └── Quick Actions:
│           ├── Continue Project
│           ├── Use Related Tools
│           └── Export Complete Plan
└── Recent Tool Outputs
    └── All outputs, with "Add to Project" option
```

---

## UI/UX Integration Points

### 1. Tool Output Pages

**Add "Project Integration" Section:**

```tsx
// After tool generates output, show:
<div className="project-integration-section">
  <h3>Save to Project</h3>
  <p>Add this output to your startup planning project</p>
  
  {userProjects.length > 0 ? (
    <select>
      <option>Select project...</option>
      {userProjects.map(project => (
        <option value={project.id}>{project.name}</option>
      ))}
    </select>
  ) : (
    <Button onClick={createNewProject}>
      Create New Project
    </Button>
  )}
  
  <Button>Add to Project</Button>
</div>
```

### 2. Project Step Pages

**Add "Helper Tools" Section:**

```tsx
// In project step page, show helper tools
<div className="helper-tools-section">
  <h3>Helper Tools</h3>
  <p>Use these tools to get data for this step:</p>
  
  <div className="tool-cards">
    {relevantTools.map(tool => (
      <ToolCard
        tool={tool}
        onUse={() => openToolInModal(tool)}
        showAddToProject={true}
      />
    ))}
  </div>
  
  {/* Show linked tool outputs */}
  {linkedToolOutputs.length > 0 && (
    <div className="linked-outputs">
      <h4>Data from Tools:</h4>
      {linkedToolOutputs.map(output => (
        <ToolOutputCard output={output} />
      ))}
    </div>
  )}
</div>
```

### 3. Project Overview Page

**Add "Tool Outputs" Section:**

```tsx
// Show all tool outputs related to this project
<div className="project-tool-outputs">
  <h2>Tool Outputs</h2>
  <p>Data and insights from tools used for this project</p>
  
  <div className="tool-outputs-grid">
    {projectToolOutputs.map(output => (
      <ToolOutputCard
        output={output}
        linkedStep={output.step_id}
        onView={() => viewToolOutput(output)}
        onRemove={() => removeFromProject(output)}
      />
    ))}
  </div>
  
  <Button onClick={openToolSelector}>
    + Add Tool Output
  </Button>
</div>
```

---

## Technical Implementation

### 1. API Endpoints

```typescript
// Link tool output to project
POST /api/projects/[projectId]/tool-outputs
{
  tool_output_id: string,
  step_id?: string, // optional - link to specific step
  reference_type: 'input' | 'context' | 'validation'
}

// Get all tool outputs for a project
GET /api/projects/[projectId]/tool-outputs

// Get relevant tools for a project step
GET /api/projects/[projectId]/steps/[stepId]/relevant-tools

// Auto-fill project step from tool output
POST /api/projects/[projectId]/steps/[stepId]/fill-from-tool
{
  tool_output_id: string,
  mapping: { tool_field: 'step_field' }
}
```

### 2. Tool-to-Step Mapping

Create a mapping system that knows which tools are relevant to which project steps:

```typescript
const TOOL_STEP_MAPPING = {
  'business_model': [
    'valuation-calculator',
    'financial-model-calculator',
    'pricing-strategy-calculator',
    'market-size-calculator'
  ],
  'value_prop': [
    'market-size-calculator',
    'competitor-analysis',
    'customer-interview-generator'
  ],
  'jtbd': [
    'customer-interview-generator',
    'idea-discovery'
  ]
}
```

### 3. Data Auto-Fill Logic

When a tool output is linked to a project step, intelligently map tool data to step fields:

```typescript
function mapToolOutputToStep(toolOutput: any, stepKey: string) {
  const mapping = TOOL_STEP_MAPPINGS[stepKey]?.[toolOutput.tool_id]
  
  if (mapping) {
    return {
      // Map tool output fields to step input fields
      [mapping.step_field]: toolOutput.data[mapping.tool_field]
    }
  }
  
  return {}
}
```

---

## User Experience Improvements

### 1. Smart Recommendations

**In Project Steps:**
- "Based on your Business Model inputs, we recommend using the Valuation Calculator"
- "You've completed JTBD. Next, use Market Size Calculator to validate your market"

**In Tool Outputs:**
- "This valuation would fit well in your 'My SaaS Startup' project"
- "Similar projects used this data in their Business Model step"

### 2. Contextual Help

**In Project Steps:**
- Show tool outputs that relate to current step
- "You calculated a $2.5M valuation. Use this in your revenue streams section?"

**In Tools:**
- Show which projects could use this output
- "This market size data would help with your Value Prop step"

### 3. Unified Export

**Project Export Includes:**
- All step outputs (JTBD, Value Prop, Business Model)
- All linked tool outputs (Valuation, Market Size, Financial Model)
- Cross-references between steps and tools
- Complete startup brief with all data integrated

---

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
1. Add `project_tool_references` table
2. Create API endpoints for linking
3. Add "Add to Project" button to tool output pages
4. Basic UI for viewing linked outputs in projects

### Phase 2: Integration (Week 3-4)
1. Add "Helper Tools" section to project steps
2. Implement tool-to-step mapping
3. Auto-fill logic for common mappings
4. Update project overview to show tool outputs

### Phase 3: Enhancement (Week 5-6)
1. Smart recommendations
2. Contextual help and suggestions
3. Unified export with tool data
4. Analytics and usage tracking

### Phase 4: Polish (Week 7-8)
1. User testing and feedback
2. UI/UX refinements
3. Performance optimization
4. Documentation and onboarding

---

## Success Metrics

1. **Adoption**: % of tool outputs linked to projects
2. **Engagement**: Average tools used per project
3. **Completion**: % of projects that use tools vs. don't
4. **Time Saved**: Reduction in duplicate data entry
5. **User Satisfaction**: Feedback on integration usefulness

---

## Example User Journey

### Sarah's Journey: Building "EcoDelivery" Project

1. **Day 1**: Creates project "EcoDelivery"
2. **Day 1**: Completes JTBD step (problem clarity)
3. **Day 2**: Uses Market Size Calculator → Links to project → Auto-fills Value Prop step
4. **Day 3**: Uses Valuation Calculator → Links to project → Uses in Business Model step
5. **Day 4**: Uses Financial Model Calculator → Links to project → Validates Business Model
6. **Day 5**: Completes all steps → Exports complete plan with all tool data integrated

**Result**: Sarah has a complete, data-backed startup plan in one unified workspace.

---

## Next Steps

1. Review and approve this design
2. Create detailed technical specifications
3. Design UI mockups for integration points
4. Begin Phase 1 implementation
5. User testing and iteration

---

## Questions to Consider

1. Should tool outputs be embedded in projects or just referenced?
2. Can one tool output be used in multiple projects?
3. What happens when a tool output is updated after being linked?
4. Should there be a "Project Mode" for tools (different UI when used from project)?
5. How do we handle tool outputs that don't fit any project step?

---

This integration will transform Tool Thinker from a collection of tools into a **unified planning platform** where everything connects and works together.

