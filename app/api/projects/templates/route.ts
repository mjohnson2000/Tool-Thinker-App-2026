import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, getOrCreateStep } from '@/lib/db/client'
import { FRAMEWORK_ORDER } from '@/lib/frameworks'
import { logger } from '@/lib/logger'

/**
 * GET /api/projects/templates
 * Get list of available project templates
 */
export async function GET(req: NextRequest) {
  const templates = [
    {
      id: 'saas-startup',
      name: 'SaaS Startup',
      description: 'Template for building a software-as-a-service business',
      icon: '💻',
      category: 'Technology',
      steps: {
        jtbd: {
          inputs: {
            customer: 'Small business owners',
            job: 'Manage customer relationships efficiently',
            problem: 'Current solutions are too complex and expensive',
          },
        },
        value_prop: {
          inputs: {
            target_customer: 'Small business owners',
            pain_points: 'Complex CRM systems, high costs, difficult to use',
            solution: 'Simple, affordable CRM designed for small businesses',
          },
        },
      },
    },
    {
      id: 'ecommerce-store',
      name: 'E-commerce Store',
      description: 'Template for launching an online retail business',
      icon: '🛒',
      category: 'Retail',
      steps: {
        jtbd: {
          inputs: {
            customer: 'Online shoppers',
            job: 'Find quality products at good prices',
            problem: 'Too many options, hard to find trusted sellers',
          },
        },
      },
    },
    {
      id: 'marketplace',
      name: 'Marketplace Platform',
      description: 'Template for building a two-sided marketplace',
      icon: '🏪',
      category: 'Platform',
      steps: {
        jtbd: {
          inputs: {
            customer: 'Service providers and customers',
            job: 'Connect service providers with customers',
            problem: 'No easy way to find and book trusted local services',
          },
        },
      },
    },
    {
      id: 'mobile-app',
      name: 'Mobile App',
      description: 'Template for building a mobile application business',
      icon: '📱',
      category: 'Technology',
      steps: {
        jtbd: {
          inputs: {
            customer: 'Mobile users',
            job: 'Accomplish tasks on the go',
            problem: 'Existing solutions are not mobile-optimized',
          },
        },
      },
    },
    {
      id: 'content-platform',
      name: 'Content Platform',
      description: 'Template for building a content creation or media platform',
      icon: '📝',
      category: 'Media',
      steps: {
        jtbd: {
          inputs: {
            customer: 'Content creators and consumers',
            job: 'Create and consume quality content',
            problem: 'Platforms take too much revenue, hard to build audience',
          },
        },
      },
    },
  ]

  return NextResponse.json({ templates })
}

/**
 * POST /api/projects/templates
 * Create a project from a template
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { templateId, projectName } = body

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Get template (in production, this would come from a database)
    const templates = [
      {
        id: 'saas-startup',
        name: 'SaaS Startup',
        steps: {
          jtbd: {
            inputs: {
              customer: 'Small business owners',
              job: 'Manage customer relationships efficiently',
              problem: 'Current solutions are too complex and expensive',
            },
          },
        },
      },
      {
        id: 'ecommerce-store',
        name: 'E-commerce Store',
        steps: {
          jtbd: {
            inputs: {
              customer: 'Online shoppers',
              job: 'Find quality products at good prices',
              problem: 'Too many options, hard to find trusted sellers',
            },
          },
        },
      },
    ]

    const template = templates.find(t => t.id === templateId)
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    // Create project
    const name = projectName || template.name
    const project = await db.createProject(String(user.id), name)

    // Pre-fill steps with template data
    if (template.steps) {
      for (const [stepKey, stepData] of Object.entries(template.steps)) {
        if (FRAMEWORK_ORDER.includes(stepKey as any)) {
          const step = await getOrCreateStep(project.id, stepKey)
          if (stepData.inputs) {
            await db.saveStepInputs(step.id, stepData.inputs)
          }
        }
      }
    }

    return NextResponse.json({
      project,
      message: "Project created from template successfully"
    })
  } catch (error: unknown) {
    logger.error("Error creating project from template:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create project from template"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

