/**
 * Auto-fill Mapping System
 * Maps tool output data to project step input fields
 */

export interface FieldMapping {
  toolField: string // Path to field in tool output (e.g., "pre_money_valuation.most_likely.value")
  stepField: string // ID of the step input field
  transform?: (value: any) => string // Optional transformation function
  description: string // What this mapping does
}

export interface ToolToStepMapping {
  toolId: string
  stepKey: string
  mappings: FieldMapping[]
  priority: "high" | "medium" | "low"
}

/**
 * Get nested value from object using dot notation path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Set nested value in object using dot notation path
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {}
    return current[key]
  }, obj)
  target[lastKey] = value
}

/**
 * Transform valuation value to readable string
 */
function formatValuation(value: any): string {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.value) return value.value
  return String(value)
}

/**
 * Transform array to comma-separated string
 */
function arrayToString(arr: any[]): string {
  if (!Array.isArray(arr)) return String(arr)
  return arr.join(', ')
}

/**
 * Transform market size data to readable format
 */
function formatMarketSize(data: any): string {
  if (typeof data === 'string') return data
  if (typeof data === 'object') {
    const parts: string[] = []
    if (data.tam) parts.push(`TAM: ${data.tam}`)
    if (data.sam) parts.push(`SAM: ${data.sam}`)
    if (data.som) parts.push(`SOM: ${data.som}`)
    return parts.join(' | ')
  }
  return String(data)
}

/**
 * Transform pricing strategy to readable format
 */
function formatPricingStrategy(data: any): string {
  if (typeof data === 'string') return data
  if (typeof data === 'object') {
    if (data.recommended_price) {
      return `Recommended: ${data.recommended_price}${data.reasoning ? ` - ${data.reasoning}` : ''}`
    }
    return JSON.stringify(data)
  }
  return String(data)
}

/**
 * Transform financial model data to readable format
 */
function formatFinancialModel(data: any): string {
  if (typeof data === 'string') return data
  if (typeof data === 'object') {
    const parts: string[] = []
    if (data.unit_economics) {
      parts.push(`Unit Economics: ${JSON.stringify(data.unit_economics)}`)
    }
    if (data.revenue_projection) {
      parts.push(`Revenue: ${data.revenue_projection}`)
    }
    if (data.cash_flow) {
      parts.push(`Cash Flow: ${data.cash_flow}`)
    }
    return parts.join('\n')
  }
  return String(data)
}

/**
 * All tool-to-step mappings
 */
export const AUTO_FILL_MAPPINGS: ToolToStepMapping[] = [
  // Valuation Calculator → Business Model
  {
    toolId: "valuation-calculator",
    stepKey: "business_model",
    priority: "high",
    mappings: [
      {
        toolField: "pre_money_valuation.most_likely.value",
        stepField: "revenue_streams",
        transform: (val) => `Valuation: ${formatValuation(val)}. This valuation suggests strong revenue potential.`,
        description: "Adds valuation context to revenue streams",
      },
      {
        toolField: "recommendations.suggested_range",
        stepField: "revenue_streams",
        transform: (val) => `Suggested valuation range: ${val}. Consider this when planning revenue targets.`,
        description: "Adds valuation range to revenue planning",
      },
    ],
  },
  // Market Size Calculator → Value Prop
  {
    toolId: "market-size-calculator",
    stepKey: "value_prop",
    priority: "high",
    mappings: [
      {
        toolField: "tam",
        stepField: "proof_points",
        transform: formatMarketSize,
        description: "Adds market size data as proof point",
      },
      {
        toolField: "sam",
        stepField: "proof_points",
        transform: (val) => `Addressable Market (SAM): ${val}`,
        description: "Adds SAM as proof point",
      },
    ],
  },
  // Market Size Calculator → Business Model
  {
    toolId: "market-size-calculator",
    stepKey: "business_model",
    priority: "high",
    mappings: [
      {
        toolField: "tam",
        stepField: "revenue_streams",
        transform: (val) => `Total Addressable Market: ${val}. This represents the maximum revenue opportunity.`,
        description: "Adds market size context to revenue streams",
      },
    ],
  },
  // Pricing Strategy Calculator → Business Model
  {
    toolId: "pricing-strategy-calculator",
    stepKey: "business_model",
    priority: "high",
    mappings: [
      {
        toolField: "recommended_price",
        stepField: "pricing_model",
        transform: formatPricingStrategy,
        description: "Fills pricing model with recommended price",
      },
      {
        toolField: "pricing_strategy",
        stepField: "pricing_model",
        transform: (val) => typeof val === 'string' ? val : JSON.stringify(val),
        description: "Fills pricing model with strategy details",
      },
    ],
  },
  // Financial Model Calculator → Business Model
  {
    toolId: "financial-model-calculator",
    stepKey: "business_model",
    priority: "high",
    mappings: [
      {
        toolField: "unit_economics",
        stepField: "cost_structure",
        transform: formatFinancialModel,
        description: "Adds unit economics to cost structure",
      },
      {
        toolField: "revenue_projection",
        stepField: "revenue_streams",
        transform: (val) => `Projected Revenue: ${val}`,
        description: "Adds revenue projection to revenue streams",
      },
    ],
  },
  // Competitor Analysis → Value Prop
  {
    toolId: "competitor-analysis",
    stepKey: "value_prop",
    priority: "medium",
    mappings: [
      {
        toolField: "differentiators",
        stepField: "differentiator",
        transform: arrayToString,
        description: "Adds competitor differentiators",
      },
      {
        toolField: "competitive_advantages",
        stepField: "differentiator",
        transform: arrayToString,
        description: "Adds competitive advantages",
      },
    ],
  },
  // Customer Interview Generator → JTBD
  {
    toolId: "customer-interview-generator",
    stepKey: "jtbd",
    priority: "high",
    mappings: [
      {
        toolField: "pain_points",
        stepField: "pain",
        transform: arrayToString,
        description: "Adds identified pain points",
      },
      {
        toolField: "current_solutions",
        stepField: "current_solution",
        transform: arrayToString,
        description: "Adds current solutions mentioned",
      },
    ],
  },
]

/**
 * Get all mappings for a specific tool and step combination
 */
export function getMappingsForToolAndStep(
  toolId: string,
  stepKey: string
): FieldMapping[] {
  const mapping = AUTO_FILL_MAPPINGS.find(
    (m) => m.toolId === toolId && m.stepKey === stepKey
  )
  return mapping?.mappings || []
}

/**
 * Get all tools that can auto-fill a specific step
 */
export function getToolsForStep(stepKey: string): string[] {
  return AUTO_FILL_MAPPINGS
    .filter((m) => m.stepKey === stepKey)
    .map((m) => m.toolId)
}

/**
 * Extract data from tool output based on mapping
 */
export function extractDataForMapping(
  toolOutput: any,
  mapping: FieldMapping
): string | null {
  try {
    const value = getNestedValue(toolOutput, mapping.toolField)
    if (value === undefined || value === null) return null
    
    if (mapping.transform) {
      return mapping.transform(value)
    }
    
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (Array.isArray(value)) return arrayToString(value)
    return JSON.stringify(value)
  } catch (error) {
    console.error('Error extracting data for mapping:', error)
    return null
  }
}

/**
 * Generate auto-fill suggestions for a tool output and step
 */
export function getAutoFillSuggestions(
  toolId: string,
  stepKey: string,
  toolOutput: any
): Array<{ field: string; value: string; description: string }> {
  const mappings = getMappingsForToolAndStep(toolId, stepKey)
  
  return mappings
    .map((mapping) => {
      const value = extractDataForMapping(toolOutput, mapping)
      if (!value) return null
      
      return {
        field: mapping.stepField,
        value,
        description: mapping.description,
      }
    })
    .filter((suggestion): suggestion is { field: string; value: string; description: string } => suggestion !== null)
}

