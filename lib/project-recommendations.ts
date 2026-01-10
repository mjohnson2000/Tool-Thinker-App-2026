import { FRAMEWORK_ORDER } from "@/lib/frameworks"

export interface ProjectRecommendation {
  type: "next_step" | "tool" | "optimization" | "risk" | "completion"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  actionUrl?: string
  actionLabel?: string
}

export interface ProjectAnalysis {
  projectId: string
  projectName: string
  status: string
  healthScore: number
  completionPercentage: number
  lastActivity?: string
  completedSteps: number
  totalSteps: number
  nextIncompleteStep?: string
  daysSinceUpdate?: number
  hasDescription: boolean
  hasTags: boolean
  hasNotes: boolean
}

/**
 * Generate smart recommendations for a project
 */
export function generateRecommendations(analysis: ProjectAnalysis): ProjectRecommendation[] {
  const recommendations: ProjectRecommendation[] = []

  // Risk Detection
  if (analysis.daysSinceUpdate && analysis.daysSinceUpdate > 30) {
    recommendations.push({
      type: "risk",
      title: "Project Inactive",
      description: `This project hasn't been updated in ${analysis.daysSinceUpdate} days. Consider pausing or updating it.`,
      priority: "high",
      actionLabel: "Update Project",
    })
  }

  if (analysis.healthScore < 30) {
    recommendations.push({
      type: "risk",
      title: "Low Health Score",
      description: "This project needs attention. Complete more steps or add details to improve its health.",
      priority: "high",
      actionLabel: "View Project",
    })
  }

  // Next Step Recommendations
  if (analysis.nextIncompleteStep) {
    const stepName = analysis.nextIncompleteStep
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
    
    recommendations.push({
      type: "next_step",
      title: "Continue Your Progress",
      description: `Next step: ${stepName}. You're ${Math.round(analysis.completionPercentage)}% complete.`,
      priority: "high",
      actionUrl: `/project/${analysis.projectId}/step/${analysis.nextIncompleteStep}`,
      actionLabel: "Continue Step",
    })
  }

  // Completion Predictions
  if (analysis.completionPercentage >= 80) {
    const estimatedDays = estimateCompletionDays(analysis)
    recommendations.push({
      type: "completion",
      title: "Almost There!",
      description: `You're ${Math.round(analysis.completionPercentage)}% complete. Estimated ${estimatedDays} day${estimatedDays !== 1 ? "s" : ""} to finish.`,
      priority: "medium",
      actionUrl: `/project/${analysis.projectId}/overview`,
      actionLabel: "View Progress",
    })
  }

  // Optimization Recommendations
  if (!analysis.hasDescription && analysis.completionPercentage < 50) {
    recommendations.push({
      type: "optimization",
      title: "Add Project Description",
      description: "Adding a description helps track your project's purpose and improves organization.",
      priority: "medium",
      actionUrl: `/project/${analysis.projectId}/overview`,
      actionLabel: "Add Description",
    })
  }

  if (!analysis.hasTags) {
    recommendations.push({
      type: "optimization",
      title: "Add Tags",
      description: "Tags help organize and filter your projects. Add relevant tags to this project.",
      priority: "low",
      actionUrl: `/project/${analysis.projectId}/overview`,
      actionLabel: "Add Tags",
    })
  }

  if (!analysis.hasNotes && analysis.completedSteps > 0) {
    recommendations.push({
      type: "optimization",
      title: "Document Your Progress",
      description: "Add notes to track decisions, learnings, and insights as you build your project.",
      priority: "low",
      actionUrl: `/project/${analysis.projectId}/overview`,
      actionLabel: "Add Notes",
    })
  }

  // Tool Recommendations
  if (analysis.completionPercentage >= 50 && analysis.completionPercentage < 80) {
    recommendations.push({
      type: "tool",
      title: "Generate Business Plan",
      description: "You're ready to create a comprehensive business plan from your project data.",
      priority: "medium",
      actionUrl: `/tools/business-plan-generator?projectId=${analysis.projectId}`,
      actionLabel: "Create Business Plan",
    })
  }

  if (analysis.completionPercentage >= 70) {
    recommendations.push({
      type: "tool",
      title: "Create Pitch Deck",
      description: "Generate a professional pitch deck to present your startup idea.",
      priority: "medium",
      actionUrl: `/tools/pitch-deck-generator?projectId=${analysis.projectId}`,
      actionLabel: "Create Pitch Deck",
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * Estimate days to completion based on current progress
 */
function estimateCompletionDays(analysis: ProjectAnalysis): number {
  const remainingSteps = analysis.totalSteps - analysis.completedSteps
  const avgDaysPerStep = 2 // Average days per step (can be improved with historical data)
  return Math.ceil(remainingSteps * avgDaysPerStep)
}

/**
 * Detect risks in a project
 */
export function detectRisks(analysis: ProjectAnalysis): ProjectRecommendation[] {
  const risks: ProjectRecommendation[] = []

  // Inactivity risk
  if (analysis.daysSinceUpdate && analysis.daysSinceUpdate > 30) {
    risks.push({
      type: "risk",
      title: "Inactive Project",
      description: `No activity for ${analysis.daysSinceUpdate} days. Consider pausing or archiving.`,
      priority: "high",
    })
  }

  // Low health score risk
  if (analysis.healthScore < 30) {
    risks.push({
      type: "risk",
      title: "Critical Health Score",
      description: "Project health is critically low. Immediate attention needed.",
      priority: "high",
    })
  }

  // Stalled progress risk
  if (analysis.completionPercentage > 20 && analysis.completionPercentage < 50) {
    const daysSinceStart = analysis.daysSinceUpdate || 0
    if (daysSinceStart > 60) {
      risks.push({
        type: "risk",
        title: "Stalled Progress",
        description: "Project has been in progress for a while. Consider reviewing and updating.",
        priority: "medium",
      })
    }
  }

  return risks
}

/**
 * Get next step suggestion based on framework order
 */
export function getNextStepSuggestion(
  completedSteps: string[],
  currentStep?: string
): string | null {
  if (!currentStep) {
    return FRAMEWORK_ORDER[0] || null
  }

  const currentIndex = FRAMEWORK_ORDER.indexOf(currentStep)
  if (currentIndex === -1) {
    return FRAMEWORK_ORDER[0] || null
  }

  // Find next incomplete step
  for (let i = currentIndex + 1; i < FRAMEWORK_ORDER.length; i++) {
    if (!completedSteps.includes(FRAMEWORK_ORDER[i])) {
      return FRAMEWORK_ORDER[i]
    }
  }

  // All steps completed
  return null
}

/**
 * Calculate completion prediction
 */
export function calculateCompletionPrediction(
  completedSteps: number,
  totalSteps: number,
  avgDaysPerStep: number = 2
): {
  estimatedDays: number
  estimatedDate: Date
  confidence: "high" | "medium" | "low"
} {
  const remainingSteps = totalSteps - completedSteps
  const estimatedDays = remainingSteps * avgDaysPerStep
  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays)

  let confidence: "high" | "medium" | "low" = "low"
  if (completedSteps >= totalSteps * 0.5) {
    confidence = "high"
  } else if (completedSteps >= totalSteps * 0.25) {
    confidence = "medium"
  }

  return {
    estimatedDays: Math.ceil(estimatedDays),
    estimatedDate,
    confidence,
  }
}

