import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/client'
import { logger } from '@/lib/logger'

/**
 * GET /api/analytics/dashboard
 * Get user analytics and insights
 */
export async function GET(req: NextRequest) {
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

    // Get all projects
    const projects = await db.getProjects(String(user.id))

    // Calculate analytics
    const totalProjects = projects.length
    const projectsByStatus = projects.reduce((acc: Record<string, number>, project: any) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {})

    // Get tool outputs count
    const { count: toolOutputsCount } = await supabase
      .from('tool_outputs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .catch(() => ({ count: 0 }))

    // Calculate completion rates
    let totalSteps = 0
    let completedSteps = 0

    for (const project of projects) {
      const steps = await supabase
        .from('steps')
        .select('status')
        .eq('project_id', project.id)
        .catch(() => ({ data: [] }))
      
      const stepData = steps.data || []
      totalSteps += stepData.length
      completedSteps += stepData.filter((s: any) => s.status === 'completed').length
    }

    const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    // Get most used tools
    const { data: toolUsage } = await supabase
      .from('tool_outputs')
      .select('tool_id, tool_name')
      .eq('user_id', user.id)
      .catch(() => ({ data: [] }))

    const toolCounts = (toolUsage?.data || []).reduce((acc: Record<string, number>, tool: any) => {
      acc[tool.tool_id] = (acc[tool.tool_id] || 0) + 1
      return acc
    }, {})

    const mostUsedTools = Object.entries(toolCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([toolId, count]: any) => ({
        toolId,
        count,
        toolName: (toolUsage?.data || []).find((t: any) => t.tool_id === toolId)?.tool_name || toolId,
      }))

    // Calculate average project health
    let totalHealth = 0
    let projectsWithHealth = 0

    for (const project of projects.slice(0, 10)) { // Limit to avoid too many API calls
      try {
        const healthRes = await fetch(`${req.nextUrl.origin}/api/projects/${project.id}/health`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (healthRes.ok) {
          const healthData = await healthRes.json()
          totalHealth += healthData.healthScore || 0
          projectsWithHealth++
        }
      } catch (error) {
        // Ignore errors
      }
    }

    const averageHealth = projectsWithHealth > 0 ? Math.round(totalHealth / projectsWithHealth) : 0

    return NextResponse.json({
      overview: {
        totalProjects,
        totalToolOutputs: toolOutputsCount || 0,
        completionRate,
        averageHealth,
      },
      projectsByStatus,
      mostUsedTools,
      activity: {
        totalSteps,
        completedSteps,
      },
    })
  } catch (error: unknown) {
    logger.error("Error fetching analytics:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch analytics"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

