import type { ProjectAnalysis } from "@/lib/project-recommendations"

export interface AutomationRule {
  id: string
  name: string
  condition: (analysis: ProjectAnalysis) => boolean
  action: (projectId: string) => Promise<void> | void
  enabled: boolean
}

/**
 * Auto-pause inactive projects
 */
export const autoPauseInactive: AutomationRule = {
  id: "auto-pause-inactive",
  name: "Auto-pause inactive projects",
  condition: (analysis) => {
    return (
      analysis.daysSinceUpdate !== undefined &&
      analysis.daysSinceUpdate > 30 &&
      analysis.status === "active"
    )
  },
  action: async (projectId: string) => {
    // This would call the API to update project status
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "paused" }),
      })
      if (!response.ok) {
        console.error("Failed to auto-pause project")
      }
    } catch (error) {
      console.error("Error auto-pausing project:", error)
    }
  },
  enabled: true,
}

/**
 * Auto-complete when all steps are done
 */
export const autoCompleteFinished: AutomationRule = {
  id: "auto-complete-finished",
  name: "Auto-complete finished projects",
  condition: (analysis) => {
    return (
      analysis.completionPercentage >= 100 &&
      analysis.status !== "complete" &&
      analysis.status !== "archived"
    )
  },
  action: async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "complete" }),
      })
      if (!response.ok) {
        console.error("Failed to auto-complete project")
      }
    } catch (error) {
      console.error("Error auto-completing project:", error)
    }
  },
  enabled: true,
}

/**
 * Alert on low health score
 */
export const alertLowHealth: AutomationRule = {
  id: "alert-low-health",
  name: "Alert on low health score",
  condition: (analysis) => {
    return analysis.healthScore < 30 && analysis.status === "active"
  },
  action: (projectId: string) => {
    // This would trigger a notification
    console.log(`Alert: Project ${projectId} has low health score`)
    // Could integrate with notification system here
  },
  enabled: true,
}

/**
 * Smart archiving for very old inactive projects
 */
export const smartArchive: AutomationRule = {
  id: "smart-archive",
  name: "Smart archive old projects",
  condition: (analysis) => {
    return (
      analysis.daysSinceUpdate !== undefined &&
      analysis.daysSinceUpdate > 90 &&
      (analysis.status === "paused" || analysis.status === "complete")
    )
  },
  action: async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "archived" }),
      })
      if (!response.ok) {
        console.error("Failed to archive project")
      }
    } catch (error) {
      console.error("Error archiving project:", error)
    }
  },
  enabled: false, // Disabled by default - requires user confirmation
}

/**
 * Check and apply automation rules for a project
 */
export async function applyAutomationRules(
  analysis: ProjectAnalysis,
  rules: AutomationRule[] = [
    autoPauseInactive,
    autoCompleteFinished,
    alertLowHealth,
    smartArchive,
  ]
): Promise<{ applied: string[]; skipped: string[] }> {
  const applied: string[] = []
  const skipped: string[] = []

  for (const rule of rules) {
    if (!rule.enabled) {
      skipped.push(rule.id)
      continue
    }

    if (rule.condition(analysis)) {
      try {
        await rule.action(analysis.projectId)
        applied.push(rule.id)
      } catch (error) {
        console.error(`Error applying rule ${rule.id}:`, error)
        skipped.push(rule.id)
      }
    }
  }

  return { applied, skipped }
}

/**
 * Get automation suggestions (rules that could be applied but aren't enabled)
 */
export function getAutomationSuggestions(
  analysis: ProjectAnalysis,
  rules: AutomationRule[] = [
    autoPauseInactive,
    autoCompleteFinished,
    alertLowHealth,
    smartArchive,
  ]
): AutomationRule[] {
  return rules.filter(
    (rule) => !rule.enabled && rule.condition(analysis)
  )
}

