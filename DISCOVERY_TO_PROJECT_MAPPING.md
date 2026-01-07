# Discovery → Project Data Mapping

## Current Mapping (Enhanced)

### Discovery Tool Collects:
```typescript
selectedCustomer: {
  title: "Small Business Owners",
  description: "Owners of local businesses...",
  icon: "🏪",
  painPoints: ["Lack of time", "Limited budget", "No technical skills"]
}

selectedJob: {
  title: "Manage online presence",
  description: "Businesses need to...",
  problemStatement: "They struggle with..."
}

selectedSolution: {
  title: "All-in-one platform",
  description: "A platform that...",
  keyFeatures: ["Feature 1", "Feature 2"]
}
```

### Maps to JTBD Step Fields:

#### 1. WHO (Who experiences this most?)
**Before (Minimal):**
```
"Small Business Owners - Owners of local businesses..."
```

**After (Comprehensive):**
```
Small Business Owners

Owners of local businesses who need to establish and maintain an online presence but lack the time, technical skills, or budget to do it effectively.

Key Pain Points:
• Lack of time
• Limited budget  
• No technical skills
```

#### 2. PAIN (What frustration or pain occurs?)
**Before:**
```
"They struggle with managing their online presence..."
```

**After:**
```
Job: Manage online presence

They struggle with managing their online presence effectively due to lack of time and technical expertise. This leads to poor online visibility and missed opportunities.
```

#### 3. SITUATION (When does the problem happen?)
**Before:**
```
"Businesses need to establish an online presence..."
```

**After:**
```
When trying to: Manage online presence

Businesses need to establish and maintain an online presence to compete in today's market.

Business Context: Digital Marketing Services - Services that help businesses establish and grow their online presence through various digital channels.
```

#### 4. CURRENT_SOLUTION (How do they solve it today?)
**Before:**
```
"Potential solution: All-in-one platform - A platform that..."
```

**After:**
```
Potential Solution Approach: All-in-one platform

A platform that provides all the tools needed to manage online presence in one place.

Key Features:
• Feature 1
• Feature 2
• Feature 3
• Feature 4
```

## Benefits of Enhanced Mapping

1. **No Redundancy**: User sees all their discovery work reflected
2. **Comprehensive Context**: All fields are fully populated with relevant data
3. **Better Continuity**: Clear connection between discovery and planning
4. **Time Savings**: User doesn't need to re-enter information

## Testing Checklist

- [ ] Complete discovery journey
- [ ] Create project from discovery
- [ ] Open JTBD step
- [ ] Verify "who" field contains customer + pain points
- [ ] Verify "pain" field contains problem statement
- [ ] Verify "situation" field contains job + business context
- [ ] Verify "current_solution" field contains solution + features
- [ ] All fields should be pre-filled and editable

