# Tool Guidance & Idea Discovery Clarification

## Critical Questions Answered

### 1. How Does the User Know Which Tool to Use Where?

**Current Problem:** Users have no guidance on which tools are relevant to which project steps. This is a major UX gap.

**Solution:** Implement a **Contextual Tool Guidance System** that shows users exactly which tools to use and when.

---

## The Distinction: Idea Discovery vs. Projects

### Idea Discovery Tool
**Purpose:** FIND and REFINE a business idea  
**When to Use:** "I don't know what business to start" or "I have a vague idea"

**Flow:**
1. Landing → Choose: "I need an idea" or "I have an idea"
2. Idea Type → Side Hustle, Startup, Small Business, Freelance
3. Location → Where will you operate?
4. Schedule & Goals → Hours/week, income target
5. Interests → What are you passionate about?
6. Business Area → AI generates 6 business areas based on interests
7. Customer → AI generates customer personas
8. Job-to-be-Done → AI generates problems customers face
9. Solution → AI generates solution approaches
10. Summary → Refined business idea with customer, problem, solution

**Output:** A complete business idea with:
- Target customer
- Problem statement
- Solution approach
- Business area

**Next Step After Idea Discovery:** Create a Project to plan the discovered idea

---

### Projects (Start Smart OS)
**Purpose:** PLAN and BUILD a business (after you have an idea)  
**When to Use:** "I have an idea, now I need to plan it"

**Flow:**
1. Create Project → Name your startup idea
2. Step 1: Jobs To Be Done (JTBD) → Understand the problem deeply
3. Step 2: Value Proposition → Define your unique value
4. Step 3: Business Model → Design how you'll make money
5. Export → Complete startup plan

**Output:** A structured startup plan with:
- Problem clarity (JTBD)
- Value proposition
- Business model
- All data integrated

**Prerequisite:** You should have a business idea (from Idea Discovery or elsewhere)

---

## The Relationship

```
Idea Discovery Tool
    ↓
[User discovers: "EcoDelivery - sustainable package delivery"]
    ↓
Create Project: "EcoDelivery"
    ↓
Use Projects to plan the discovered idea
    ↓
Use Tools to get data for project steps
```

**Idea Discovery → Projects → Tools**

---

## Tool Guidance System Design

### Problem: Users Don't Know Which Tools to Use

**Current State:**
- User is in Business Model step
- Sees questions about revenue streams, pricing, costs
- Has no idea which tools can help
- Must guess or browse all 50+ tools

**Solution: Contextual Tool Recommendations**

---

### 1. In-Context Tool Suggestions

**In Each Project Step, Show:**

```tsx
// In Business Model step page
<div className="helper-tools-section">
  <h3>💡 Need Help? Use These Tools</h3>
  
  <div className="tool-suggestions">
    {/* Contextual explanation */}
    <p className="context">
      You're defining your business model. These tools can help you get the data you need:
    </p>
    
    {/* Recommended tools with explanations */}
    <ToolCard
      tool="Valuation Calculator"
      reason="Calculate your startup valuation to understand your business worth"
      whenToUse="Use this to get a valuation estimate for your revenue streams section"
      icon="💎"
    />
    
    <ToolCard
      tool="Financial Model Calculator"
      reason="Project your revenue and expenses to validate your business model"
      whenToUse="Use this to calculate unit economics and validate your pricing model"
      icon="💰"
    />
    
    <ToolCard
      tool="Pricing Strategy Calculator"
      reason="Determine optimal pricing based on costs and market positioning"
      whenToUse="Use this to validate your pricing model and understand margins"
      icon="📊"
    />
    
    <ToolCard
      tool="Market Size Calculator"
      reason="Calculate TAM, SAM, SOM to understand your market opportunity"
      whenToUse="Use this to validate the market size for your revenue projections"
      icon="📈"
    />
  </div>
</div>
```

---

### 2. Smart Tool Mapping

**Create a mapping system that knows which tools help with which steps:**

```typescript
const STEP_TOOL_MAPPING = {
  'jtbd': {
    recommended: [
      {
        toolId: 'customer-interview-generator',
        reason: 'Generate interview questions to validate the problem',
        priority: 'high',
        explanation: 'Use this to create questions that help you understand the job-to-be-done better'
      },
      {
        toolId: 'idea-discovery',
        reason: 'If you haven\'t discovered your idea yet, start here',
        priority: 'medium',
        explanation: 'This tool helps you discover and refine your business idea before planning'
      }
    ],
    optional: ['competitor-analysis']
  },
  
  'value_prop': {
    recommended: [
      {
        toolId: 'market-size-calculator',
        reason: 'Calculate market size to validate your value proposition',
        priority: 'high',
        explanation: 'Understanding market size helps you validate if your value prop addresses a real market'
      },
      {
        toolId: 'competitor-analysis',
        reason: 'Analyze competitors to differentiate your value prop',
        priority: 'high',
        explanation: 'See how competitors position themselves to make your value prop unique'
      },
      {
        toolId: 'customer-interview-generator',
        reason: 'Generate questions to validate your value proposition',
        priority: 'medium',
        explanation: 'Create interview questions to test if customers see value in your proposition'
      }
    ],
    optional: ['idea-discovery']
  },
  
  'business_model': {
    recommended: [
      {
        toolId: 'valuation-calculator',
        reason: 'Calculate startup valuation for your business model',
        priority: 'high',
        explanation: 'Get a valuation estimate to understand your business worth and inform revenue streams'
      },
      {
        toolId: 'financial-model-calculator',
        reason: 'Project revenue and expenses to validate your business model',
        priority: 'high',
        explanation: 'Calculate unit economics, revenue projections, and cash flow to validate your model'
      },
      {
        toolId: 'pricing-strategy-calculator',
        reason: 'Determine optimal pricing for your revenue streams',
        priority: 'high',
        explanation: 'Get pricing recommendations based on costs, margins, and market positioning'
      },
      {
        toolId: 'market-size-calculator',
        reason: 'Calculate market size to validate revenue potential',
        priority: 'medium',
        explanation: 'Understand TAM, SAM, SOM to validate if your business model addresses a real market'
      },
      {
        toolId: 'runway-calculator',
        reason: 'Calculate how long you can operate with current cash',
        priority: 'medium',
        explanation: 'Understand your runway to plan your business model timeline'
      }
    ],
    optional: ['equity-dilution-calculator', 'team-cost-calculator']
  }
}
```

---

### 3. Progressive Disclosure

**Show tools based on what the user needs:**

```tsx
// In Business Model step
function getRelevantTools(stepKey: string, userInputs: any) {
  const baseTools = STEP_TOOL_MAPPING[stepKey].recommended
  
  // If user hasn't filled pricing_model, prioritize Pricing Strategy Calculator
  if (!userInputs.pricing_model) {
    return baseTools.map(tool => 
      tool.toolId === 'pricing-strategy-calculator' 
        ? { ...tool, priority: 'critical', badge: 'Required' }
        : tool
    )
  }
  
  // If user hasn't filled cost_structure, prioritize Financial Model Calculator
  if (!userInputs.cost_structure) {
    return baseTools.map(tool => 
      tool.toolId === 'financial-model-calculator' 
        ? { ...tool, priority: 'critical', badge: 'Required' }
        : tool
    )
  }
  
  return baseTools
}
```

---

### 4. Visual Guidance in UI

**In Project Step Page:**

```tsx
<div className="project-step-page">
  {/* Left: Framework Questions */}
  <div className="framework-section">
    <h2>Business Model Questions</h2>
    <QuestionForm questions={framework.questions} />
  </div>
  
  {/* Right: Helper Tools */}
  <div className="helper-tools-panel">
    <div className="tools-header">
      <h3>💡 Helper Tools</h3>
      <p>Use these tools to get data for your answers</p>
    </div>
    
    {/* Show recommended tools */}
    {recommendedTools.map(tool => (
      <ToolRecommendationCard
        tool={tool}
        reason={tool.reason}
        explanation={tool.explanation}
        priority={tool.priority}
        onUse={() => openTool(tool.toolId)}
      />
    ))}
    
    {/* Show linked tool outputs */}
    {linkedToolOutputs.length > 0 && (
      <div className="linked-outputs">
        <h4>✅ Data You've Added:</h4>
        {linkedToolOutputs.map(output => (
          <LinkedOutputCard output={output} />
        ))}
      </div>
    )}
  </div>
</div>
```

---

### 5. Tool Recommendation Card Design

```tsx
<ToolRecommendationCard>
  <div className="tool-card">
    {/* Priority badge */}
    {priority === 'critical' && (
      <Badge>Required for this step</Badge>
    )}
    
    {/* Tool info */}
    <div className="tool-header">
      <Icon name={tool.icon} />
      <h4>{tool.name}</h4>
    </div>
    
    {/* Why use it */}
    <p className="reason">
      <strong>Why:</strong> {tool.reason}
    </p>
    
    {/* When to use */}
    <p className="when-to-use">
      <strong>When:</strong> {tool.explanation}
    </p>
    
    {/* Action */}
    <Button onClick={openTool}>
      Use {tool.name}
    </Button>
  </div>
</ToolRecommendationCard>
```

---

## How This Differs from Idea Discovery

### Idea Discovery Tool
- **Purpose:** Discover WHAT business to start
- **Input:** Interests, goals, location
- **Output:** Business idea (customer + problem + solution)
- **When:** Before you have an idea
- **Standalone:** Complete flow, doesn't need projects

### Projects with Tool Guidance
- **Purpose:** Plan HOW to build your business
- **Input:** Business idea (from Discovery or elsewhere)
- **Output:** Complete startup plan
- **When:** After you have an idea
- **Integrated:** Uses tools to get data for planning

### The Flow

```
┌─────────────────────┐
│  Idea Discovery     │  ← "I don't know what to build"
│  (Find Idea)        │
└──────────┬──────────┘
           │
           ↓
    [Business Idea]
           │
           ↓
┌─────────────────────┐
│  Create Project      │  ← "I have an idea, now plan it"
│  (Plan Idea)         │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────────┐
    │  Project Steps   │
    │  ┌────────────┐  │
    │  │ JTBD Step  │  │ ← Use Customer Interview Tool
    │  └────────────┘  │
    │  ┌────────────┐  │
    │  │Value Prop  │  │ ← Use Market Size Calculator
    │  └────────────┘  │
    │  ┌────────────┐  │
    │  │Business    │  │ ← Use Valuation, Financial Model,
    │  │Model Step  │  │    Pricing Strategy Calculators
    │  └────────────┘  │
    └──────────────────┘
           │
           ↓
    [Complete Plan]
```

---

## Implementation Priority

### Phase 1: Basic Guidance (Week 1)
1. Add tool mapping system
2. Show recommended tools in each project step
3. Basic "Why use this tool" explanations

### Phase 2: Smart Recommendations (Week 2)
1. Progressive disclosure based on user inputs
2. Priority badges (Required, Recommended, Optional)
3. Contextual explanations

### Phase 3: Integration (Week 3)
1. Link tool outputs to project steps
2. Auto-fill project fields from tool outputs
3. Show linked outputs in project steps

### Phase 4: Discovery Integration (Week 4)
1. "Create Project from Idea Discovery" flow
2. Auto-populate project with Discovery data
3. Seamless transition from Discovery to Planning

---

## User Experience Example

### Sarah's Journey with Guidance

1. **Day 1:** Uses Idea Discovery Tool
   - Discovers: "EcoDelivery - sustainable package delivery"
   - Gets: Customer, Problem, Solution

2. **Day 2:** Creates Project "EcoDelivery"
   - Sees: "Start with JTBD step to understand the problem deeply"

3. **Day 2:** In JTBD Step
   - Sees Helper Tools section:
     - ✅ **Customer Interview Generator** (Recommended)
       - *Why:* Generate questions to validate the problem
       - *When:* Use this to create interview questions
     - 💡 **Competitor Analysis** (Optional)
       - *Why:* Understand how competitors solve this problem
   - Uses Customer Interview Generator
   - Links output to project
   - Data appears in project step

4. **Day 3:** In Value Prop Step
   - Sees Helper Tools:
     - ✅ **Market Size Calculator** (Required)
       - *Why:* Validate your value prop addresses a real market
     - ✅ **Competitor Analysis** (Recommended)
       - *Why:* Differentiate your value prop
   - Uses Market Size Calculator
   - Gets: $50M TAM
   - Data auto-fills in Value Prop step

5. **Day 4:** In Business Model Step
   - Sees Helper Tools:
     - ✅ **Valuation Calculator** (Recommended)
     - ✅ **Financial Model Calculator** (Required)
     - ✅ **Pricing Strategy Calculator** (Required)
   - Uses all three tools
   - All data integrated into Business Model

6. **Day 5:** Exports complete plan
   - Includes: All step outputs + All tool data
   - Complete, data-backed startup plan

---

## Key Takeaways

1. **Idea Discovery** = Find WHAT to build
2. **Projects** = Plan HOW to build it
3. **Tools** = Get DATA for planning
4. **Guidance System** = Shows users which tools to use when
5. **Integration** = Everything connects in one workspace

---

## Questions to Address

1. Should Idea Discovery automatically create a project?
2. Can users skip Idea Discovery and go straight to Projects?
3. Should tool recommendations be AI-powered or rule-based?
4. How do we handle tools that don't fit any project step?
5. Should there be a "Tool Library" view within projects?

This system makes it clear:
- **What** each tool does
- **Why** you should use it
- **When** to use it
- **How** it helps your project

