import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db, getOrCreateStep } from "@/lib/db/client"
import { FRAMEWORK_ORDER } from "@/lib/frameworks"
import { logger } from "@/lib/logger"

/**
 * GET /api/projects/[projectId]/export-data
 * Get all project data formatted for use in other tools (Pitch Deck, Business Plan, etc.)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    // Get project
    const project = await db.getProjectById(params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Verify project belongs to user
    if (String(project.user_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Project does not belong to user" },
        { status: 403 }
      )
    }

    // Get all step data
    const stepData: Record<string, any> = {}
    
    for (const stepKey of FRAMEWORK_ORDER) {
      try {
        const step = await getOrCreateStep(params.projectId, stepKey)
        const stepInputs = await db.getStepInputs(step.id)
        const stepOutput = await db.getStepOutput(step.id)
        
        stepData[stepKey] = {
          inputs: stepInputs?.data || {},
          output: stepOutput?.user_edited_output || stepOutput?.ai_output || null,
          status: step.status,
        }
      } catch (error) {
        logger.error(`Error loading step ${stepKey}:`, error)
        stepData[stepKey] = {
          inputs: {},
          output: null,
          status: "not_started",
        }
      }
    }

    // Extract key information for tools
    const jtbd = stepData.jtbd || {}
    const valueProp = stepData.value_prop || {}
    const businessModel = stepData.business_model || {}

    // Format data for easy use in tools
    const formattedData = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        created_at: project.created_at,
      },
      steps: stepData,
      // Extracted fields for common use cases
      extracted: {
        // For Pitch Deck
        companyName: project.name,
        businessIdea: extractBusinessIdea(jtbd, valueProp),
        targetMarket: extractTargetMarket(jtbd, valueProp),
        valueProposition: extractValueProposition(valueProp),
        traction: extractTraction(businessModel),
        team: extractTeam(businessModel),
        fundingAmount: extractFundingAmount(businessModel),
        useOfFunds: extractUseOfFunds(businessModel),
        
        // For Business Plan
        missionStatement: extractMissionStatement(valueProp),
        productsServices: extractProductsServices(valueProp, businessModel),
        competitiveAdvantages: extractCompetitiveAdvantages(valueProp),
        marketSize: extractMarketSize(valueProp),
        revenueModel: extractRevenueModel(businessModel),
        pricingStrategy: extractPricingStrategy(businessModel),
        financialProjections: extractFinancialProjections(businessModel),
      },
    }

    return NextResponse.json(formattedData)
  } catch (error: unknown) {
    logger.error("Error exporting project data:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to export project data"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Helper functions to extract data from step outputs
function extractBusinessIdea(jtbd: any, valueProp: any): string {
  if (valueProp?.output?.value_proposition) {
    return valueProp.output.value_proposition
  }
  if (jtbd?.output?.problem_statement) {
    return jtbd.output.problem_statement
  }
  if (jtbd?.inputs?.pain) {
    return jtbd.inputs.pain
  }
  return ""
}

function extractTargetMarket(jtbd: any, valueProp: any): string {
  if (valueProp?.output?.target_market) {
    return valueProp.output.target_market
  }
  if (jtbd?.output?.target_customer) {
    return jtbd.output.target_customer
  }
  if (jtbd?.inputs?.who) {
    return jtbd.inputs.who
  }
  return ""
}

function extractValueProposition(valueProp: any): string {
  if (valueProp?.output?.value_proposition) {
    return valueProp.output.value_proposition
  }
  if (valueProp?.inputs?.value_proposition) {
    return valueProp.inputs.value_proposition
  }
  return ""
}

function extractTraction(businessModel: any): string {
  if (businessModel?.output?.traction) {
    return businessModel.output.traction
  }
  if (businessModel?.output?.milestones) {
    return Array.isArray(businessModel.output.milestones)
      ? businessModel.output.milestones.join(", ")
      : businessModel.output.milestones
  }
  return ""
}

function extractTeam(businessModel: any): string {
  if (businessModel?.output?.team) {
    return businessModel.output.team
  }
  if (businessModel?.output?.founders) {
    return Array.isArray(businessModel.output.founders)
      ? businessModel.output.founders.join(", ")
      : businessModel.output.founders
  }
  return ""
}

function extractFundingAmount(businessModel: any): string {
  if (businessModel?.output?.funding_amount) {
    return businessModel.output.funding_amount
  }
  if (businessModel?.output?.funding_needed) {
    return businessModel.output.funding_needed
  }
  return ""
}

function extractUseOfFunds(businessModel: any): string {
  if (businessModel?.output?.use_of_funds) {
    return businessModel.output.use_of_funds
  }
  if (businessModel?.output?.funding_allocation) {
    return Array.isArray(businessModel.output.funding_allocation)
      ? businessModel.output.funding_allocation.join(", ")
      : businessModel.output.funding_allocation
  }
  return ""
}

function extractMissionStatement(valueProp: any): string {
  if (valueProp?.output?.mission_statement) {
    return valueProp.output.mission_statement
  }
  if (valueProp?.output?.value_proposition) {
    return valueProp.output.value_proposition
  }
  return ""
}

function extractProductsServices(valueProp: any, businessModel: any): string[] {
  const products: string[] = []
  
  if (businessModel?.output?.products) {
    if (Array.isArray(businessModel.output.products)) {
      products.push(...businessModel.output.products)
    } else {
      products.push(businessModel.output.products)
    }
  }
  
  if (valueProp?.output?.products) {
    if (Array.isArray(valueProp.output.products)) {
      products.push(...valueProp.output.products)
    } else {
      products.push(valueProp.output.products)
    }
  }
  
  return products.length > 0 ? products : []
}

function extractCompetitiveAdvantages(valueProp: any): string[] {
  if (valueProp?.output?.competitive_advantages) {
    if (Array.isArray(valueProp.output.competitive_advantages)) {
      return valueProp.output.competitive_advantages
    }
    return [valueProp.output.competitive_advantages]
  }
  if (valueProp?.output?.differentiation) {
    if (Array.isArray(valueProp.output.differentiation)) {
      return valueProp.output.differentiation
    }
    return [valueProp.output.differentiation]
  }
  return []
}

function extractMarketSize(valueProp: any): string {
  if (valueProp?.output?.market_size) {
    return valueProp.output.market_size
  }
  if (valueProp?.output?.tam_sam_som) {
    return valueProp.output.tam_sam_som
  }
  return ""
}

function extractRevenueModel(businessModel: any): string {
  if (businessModel?.output?.revenue_model) {
    return businessModel.output.revenue_model
  }
  if (businessModel?.output?.business_model) {
    return businessModel.output.business_model
  }
  return ""
}

function extractPricingStrategy(businessModel: any): string {
  if (businessModel?.output?.pricing_strategy) {
    return businessModel.output.pricing_strategy
  }
  if (businessModel?.output?.pricing_model) {
    return businessModel.output.pricing_model
  }
  return ""
}

function extractFinancialProjections(businessModel: any): any {
  if (businessModel?.output?.financial_projections) {
    return businessModel.output.financial_projections
  }
  if (businessModel?.output?.revenue_projections) {
    return businessModel.output.revenue_projections
  }
  return null
}

