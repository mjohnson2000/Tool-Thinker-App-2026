"use client"

import { useState, useEffect } from "react"
import { 
  Lightbulb, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateRecommendations, detectRisks, type ProjectAnalysis, type ProjectRecommendation } from "@/lib/project-recommendations"
import Link from "next/link"

interface ProjectRecommendationsProps {
  projectId: string
  projectName: string
  healthScore: number
  completionPercentage: number
  lastActivity?: string
  completedSteps: number
  totalSteps: number
  nextIncompleteStep?: string
  hasDescription: boolean
  hasTags: boolean
  hasNotes: boolean
  className?: string
}

export function ProjectRecommendations({
  projectId,
  projectName,
  healthScore,
  completionPercentage,
  lastActivity,
  completedSteps,
  totalSteps,
  nextIncompleteStep,
  hasDescription,
  hasTags,
  hasNotes,
  className = "",
}: ProjectRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([])
  const [risks, setRisks] = useState<ProjectRecommendation[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const daysSinceUpdate = lastActivity
      ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    const analysis: ProjectAnalysis = {
      projectId,
      projectName,
      status: "active", // This should come from props
      healthScore,
      completionPercentage,
      lastActivity,
      completedSteps,
      totalSteps,
      nextIncompleteStep,
      daysSinceUpdate,
      hasDescription,
      hasTags,
      hasNotes,
    }

    const recs = generateRecommendations(analysis)
    const detectedRisks = detectRisks(analysis)

    setRecommendations(recs)
    setRisks(detectedRisks)
  }, [
    projectId,
    projectName,
    healthScore,
    completionPercentage,
    lastActivity,
    completedSteps,
    totalSteps,
    nextIncompleteStep,
    hasDescription,
    hasTags,
    hasNotes,
  ])

  const getRecommendationIcon = (type: ProjectRecommendation["type"]) => {
    switch (type) {
      case "next_step":
        return <Target className="w-5 h-5" />
      case "tool":
        return <Sparkles className="w-5 h-5" />
      case "optimization":
        return <TrendingUp className="w-5 h-5" />
      case "risk":
        return <AlertTriangle className="w-5 h-5" />
      case "completion":
        return <Target className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  const getRecommendationColor = (type: ProjectRecommendation["type"], priority: string) => {
    if (type === "risk" || priority === "high") {
      return "bg-red-50 border-red-200 text-red-800"
    }
    if (priority === "medium") {
      return "bg-yellow-50 border-yellow-200 text-yellow-800"
    }
    return "bg-blue-50 border-blue-200 text-blue-800"
  }

  const allRecommendations = [...risks, ...recommendations].slice(0, 5)

  if (allRecommendations.length === 0) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Smart Recommendations</h3>
          {allRecommendations.length > 0 && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              {allRecommendations.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          {isExpanded ? (
            <>
              <span className="text-xs text-gray-500">Collapse</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span className="text-xs text-gray-500">Expand</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {allRecommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getRecommendationColor(rec.type, rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getRecommendationIcon(rec.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1">{rec.title}</h4>
                  <p className="text-sm opacity-90 mb-3">{rec.description}</p>
                  {rec.actionUrl && rec.actionLabel && (
                    <Link href={rec.actionUrl}>
                      <Button
                        size="sm"
                        variant={rec.type === "risk" ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {rec.actionLabel}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

