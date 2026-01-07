/**
 * Tool Guidance Mapping System
 * Maps project steps to relevant tools with explanations
 */

export interface ToolRecommendation {
  toolId: string
  toolName: string
  reason: string
  explanation: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  icon?: string
}

export interface StepToolMapping {
  recommended: ToolRecommendation[]
  optional: ToolRecommendation[]
}

export const STEP_TOOL_MAPPING: Record<string, StepToolMapping> = {
  jtbd: {
    recommended: [
      {
        toolId: 'customer-interview-generator',
        toolName: 'Customer Interview Guide',
        reason: 'Generate interview questions to validate the problem',
        explanation: 'Use this to create questions that help you understand the job-to-be-done better and validate customer pain points',
        priority: 'high',
        category: 'Generator Tools',
        icon: 'mic',
      },
      {
        toolId: 'customer-validation-tracker',
        toolName: 'Customer Validation Tracker',
        reason: 'Track interviews and validate assumptions',
        explanation: 'Schedule interviews, record answers, and track which assumptions are validated or invalidated by customer feedback',
        priority: 'high',
        category: 'Generator Tools',
        icon: 'target',
      },
      {
        toolId: 'idea-discovery',
        toolName: 'Idea Discovery',
        reason: 'If you haven\'t discovered your idea yet, start here',
        explanation: 'This tool helps you discover and refine your business idea before planning. Use it if you\'re still exploring ideas.',
        priority: 'medium',
        category: 'Generator Tools',
        icon: 'lightbulb',
      },
    ],
    optional: [
      {
        toolId: 'competitor-analysis',
        toolName: 'Competitor Analysis Tool',
        reason: 'Understand how competitors solve this problem',
        explanation: 'Analyze competitors to see how they address similar jobs-to-be-done',
        priority: 'low',
        category: 'Generator Tools',
        icon: 'search',
      },
    ],
  },

  value_prop: {
    recommended: [
      {
        toolId: 'market-size-calculator',
        toolName: 'Market Size Calculator',
        reason: 'Calculate market size to validate your value proposition',
        explanation: 'Understanding market size (TAM, SAM, SOM) helps you validate if your value prop addresses a real, sizable market',
        priority: 'high',
        category: 'Calculator Tools',
        icon: 'trending-up',
      },
      {
        toolId: 'competitor-analysis',
        toolName: 'Competitor Analysis Tool',
        reason: 'Analyze competitors to differentiate your value prop',
        explanation: 'See how competitors position themselves to make your value proposition unique and compelling',
        priority: 'high',
        category: 'Generator Tools',
        icon: 'search',
      },
      {
        toolId: 'customer-interview-generator',
        toolName: 'Customer Interview Guide',
        reason: 'Generate questions to validate your value proposition',
        explanation: 'Create interview questions to test if customers see value in your proposition and understand what makes you different',
        priority: 'medium',
        category: 'Generator Tools',
        icon: 'mic',
      },
    ],
    optional: [
      {
        toolId: 'idea-discovery',
        toolName: 'Idea Discovery',
        reason: 'Refine your idea if needed',
        explanation: 'If you need to refine your business idea, use this tool to explore different angles',
        priority: 'low',
        category: 'Generator Tools',
        icon: 'lightbulb',
      },
    ],
  },

  business_model: {
    recommended: [
      {
        toolId: 'valuation-calculator',
        toolName: 'Valuation Calculator',
        reason: 'Calculate startup valuation for your business model',
        explanation: 'Get a valuation estimate to understand your business worth and inform your revenue streams and fundraising strategy',
        priority: 'high',
        category: 'Calculator Tools',
        icon: 'gem',
      },
      {
        toolId: 'financial-model-calculator',
        toolName: 'Financial Model Calculator',
        reason: 'Project revenue and expenses to validate your business model',
        explanation: 'Calculate unit economics, revenue projections, and cash flow to validate your business model and understand financial viability',
        priority: 'critical',
        category: 'Calculator Tools',
        icon: 'dollar-sign',
      },
      {
        toolId: 'pricing-strategy-calculator',
        toolName: 'Pricing Strategy Calculator',
        reason: 'Determine optimal pricing for your revenue streams',
        explanation: 'Get pricing recommendations based on costs, margins, and market positioning to validate your pricing model',
        priority: 'critical',
        category: 'Calculator Tools',
        icon: 'calculator',
      },
      {
        toolId: 'market-size-calculator',
        toolName: 'Market Size Calculator',
        reason: 'Calculate market size to validate revenue potential',
        explanation: 'Understand TAM, SAM, SOM to validate if your business model addresses a real market with sufficient revenue potential',
        priority: 'medium',
        category: 'Calculator Tools',
        icon: 'trending-up',
      },
      {
        toolId: 'runway-calculator',
        toolName: 'Runway Calculator',
        reason: 'Calculate how long you can operate with current cash',
        explanation: 'Understand your runway to plan your business model timeline and funding needs',
        priority: 'medium',
        category: 'Calculator Tools',
        icon: 'clock',
      },
    ],
    optional: [
      {
        toolId: 'equity-dilution-calculator',
        toolName: 'Equity Dilution Calculator',
        reason: 'Understand how funding affects ownership',
        explanation: 'Calculate how funding rounds will affect your ownership percentage',
        priority: 'low',
        category: 'Calculator Tools',
        icon: 'trending-down',
      },
      {
        toolId: 'team-cost-calculator',
        toolName: 'Team Cost Calculator',
        reason: 'Calculate total cost of employees',
        explanation: 'Understand the full cost of building your team, including hidden costs',
        priority: 'low',
        category: 'Calculator Tools',
        icon: 'users',
      },
    ],
  },
}

/**
 * Get tool recommendations for a specific project step
 */
export function getToolRecommendations(stepKey: string): StepToolMapping | null {
  return STEP_TOOL_MAPPING[stepKey] || null
}

/**
 * Get all recommended tools for a step (high priority and above)
 */
export function getRecommendedTools(stepKey: string): ToolRecommendation[] {
  const mapping = STEP_TOOL_MAPPING[stepKey]
  if (!mapping) return []
  
  return [
    ...mapping.recommended.filter(t => t.priority === 'critical' || t.priority === 'high'),
    ...mapping.recommended.filter(t => t.priority === 'medium'),
  ]
}

/**
 * Get tool URL based on tool ID
 */
export function getToolUrl(toolId: string): string {
  // Map tool IDs to their URLs
  const toolUrlMap: Record<string, string> = {
    'customer-interview-generator': '/tools/customer-interview-generator',
    'customer-validation-tracker': '/tools/customer-validation-tracker',
    'idea-discovery': '/tools/idea-discovery',
    'competitor-analysis': '/tools/competitor-analysis',
    'market-size-calculator': '/tools/market-size-calculator',
    'valuation-calculator': '/tools/valuation-calculator',
    'financial-model-calculator': '/tools/financial-model-calculator',
    'pricing-strategy-calculator': '/tools/pricing-strategy-calculator',
    'runway-calculator': '/tools/runway-calculator',
    'equity-dilution-calculator': '/tools/equity-dilution-calculator',
    'team-cost-calculator': '/tools/team-cost-calculator',
  }
  
  return toolUrlMap[toolId] || `/tools/${toolId}`
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: ToolRecommendation['priority']): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: ToolRecommendation['priority']): string {
  switch (priority) {
    case 'critical':
      return 'Required'
    case 'high':
      return 'Recommended'
    case 'medium':
      return 'Helpful'
    case 'low':
      return 'Optional'
    default:
      return 'Optional'
  }
}

