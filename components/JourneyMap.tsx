"use client"

import Link from "next/link"
import { 
  Lightbulb, 
  FileText, 
  CheckCircle2, 
  Presentation, 
  Megaphone, 
  Rocket,
  ArrowRight,
  Circle,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

export type JourneyStage = 
  | "discovery"
  | "planning"
  | "validation"
  | "documentation"
  | "marketing"
  | "launch"
  | "growth"

interface JourneyStageData {
  id: JourneyStage
  title: string
  description: string
  icon: typeof Lightbulb
  color: string
  bgColor: string
  borderColor: string
  tools: Array<{
    name: string
    href: string
  }>
  actions: Array<{
    label: string
    href: string
    primary?: boolean
  }>
}

const journeyStages: JourneyStageData[] = [
  {
    id: "discovery",
    title: "Discovery & Ideation",
    description: "Find or refine your business idea",
    icon: Lightbulb,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    tools: [
      { name: "Idea Discovery", href: "/tools/idea-discovery" },
      { name: "Competitor Analysis", href: "/tools/competitor-analysis" },
    ],
    actions: [
      { label: "Discover an Idea", href: "/tools/idea-discovery", primary: true },
      { label: "Create Project", href: "/dashboard" },
    ],
  },
  {
    id: "planning",
    title: "Planning & Validation",
    description: "Create structured plan and validate assumptions",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    tools: [
      { name: "Customer Interview Guide", href: "/tools/customer-interview-generator" },
      { name: "Market Size Calculator", href: "/tools/market-size-calculator" },
      { name: "Financial Model Calculator", href: "/tools/financial-model-calculator" },
      { name: "Pricing Strategy Calculator", href: "/tools/pricing-strategy-calculator" },
    ],
    actions: [
      { label: "Create Project", href: "/dashboard", primary: true },
      { label: "View Projects", href: "/dashboard" },
    ],
  },
  {
    id: "validation",
    title: "Validation",
    description: "Test assumptions and validate with customers",
    icon: CheckCircle2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    tools: [
      { name: "Customer Interview Guide", href: "/tools/customer-interview-generator" },
      { name: "Customer Validation Tracker", href: "/tools/customer-validation-tracker" },
    ],
    actions: [
      { label: "Start Validation", href: "/tools/customer-interview-generator", primary: true },
    ],
  },
  {
    id: "documentation",
    title: "Documentation & Fundraising",
    description: "Create documents to raise funding",
    icon: Presentation,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    tools: [
      { name: "Pitch Deck Generator", href: "/tools/pitch-deck-generator" },
      { name: "Business Plan Generator", href: "/tools/business-plan-generator" },
      { name: "Valuation Calculator", href: "/tools/valuation-calculator" },
    ],
    actions: [
      { label: "Create Pitch Deck", href: "/tools/pitch-deck-generator", primary: true },
      { label: "Generate Business Plan", href: "/tools/business-plan-generator" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & Launch Prep",
    description: "Build marketing system and prepare for launch",
    icon: Megaphone,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
    tools: [
      { name: "Marketing Blueprint", href: "/tools/marketing-blueprint" },
      { name: "Facebook Ads Generator", href: "/tools/facebook-ads-generator" },
    ],
    actions: [
      { label: "Build Marketing System", href: "/tools/marketing-blueprint", primary: true },
    ],
  },
  {
    id: "launch",
    title: "Launch",
    description: "Launch your product or service",
    icon: Rocket,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    tools: [],
    actions: [
      { label: "View Launch Tools", href: "/tools", primary: true },
    ],
  },
  {
    id: "growth",
    title: "Growth & Operations",
    description: "Scale your business and manage operations",
    icon: Rocket,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    tools: [
      { name: "Team Cost Calculator", href: "/tools/team-cost-calculator" },
      { name: "Equity Dilution Calculator", href: "/tools/equity-dilution-calculator" },
      { name: "Runway Calculator", href: "/tools/runway-calculator" },
    ],
    actions: [
      { label: "Explore Growth Tools", href: "/tools", primary: true },
    ],
  },
]

interface JourneyMapProps {
  currentStage?: JourneyStage
  completedStages?: JourneyStage[]
  projectId?: string
  variant?: "full" | "compact" | "minimal"
  showActions?: boolean
  className?: string
}

export function JourneyMap({
  currentStage,
  completedStages = [],
  projectId,
  variant = "full",
  showActions = true,
  className = "",
}: JourneyMapProps) {
  const getStageStatus = (stageId: JourneyStage) => {
    if (completedStages.includes(stageId)) return "completed"
    if (currentStage === stageId) return "current"
    return "upcoming"
  }

  const getStageIndex = (stageId: JourneyStage) => {
    return journeyStages.findIndex((s) => s.id === stageId)
  }

  const currentIndex = currentStage ? getStageIndex(currentStage) : -1

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Startup Journey</h2>
        <p className="text-gray-600">
          From idea to launch - track your progress through each stage
        </p>
      </div>

      {/* Journey Timeline */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />
        
        {/* Stages */}
        <div className="space-y-6">
          {journeyStages.map((stage, index) => {
            const status = getStageStatus(stage.id)
            const Icon = stage.icon
            const isCompleted = status === "completed"
            const isCurrent = status === "current"
            const isUpcoming = status === "upcoming"

            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Stage Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-green-100 border-green-500"
                        : isCurrent
                        ? `${stage.bgColor} ${stage.borderColor} border-2 ring-4 ring-opacity-20 ${stage.borderColor.replace("border-", "ring-")}`
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <Icon
                        className={`w-8 h-8 ${
                          isCurrent ? stage.color : "text-gray-400"
                        }`}
                      />
                    )}
                  </div>
                  {/* Stage Number */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Stage Content */}
                <div className="flex-1 pt-2">
                  <div
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrent
                        ? `${stage.bgColor} ${stage.borderColor} shadow-lg`
                        : isCompleted
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg mb-1 ${
                            isCurrent ? stage.color : isCompleted ? "text-green-800" : "text-gray-600"
                          }`}
                        >
                          {stage.title}
                          {isCurrent && (
                            <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Current Stage
                            </span>
                          )}
                          {isCompleted && (
                            <span className="ml-2 text-xs font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              ✓ Complete
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
                      </div>
                    </div>

                    {/* Tools Available */}
                    {variant === "full" && stage.tools.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Tools Available:</p>
                        <div className="flex flex-wrap gap-2">
                          {stage.tools.map((tool) => {
                            const toolHref = projectId && tool.href.includes("?") 
                              ? `${tool.href}&projectId=${projectId}`
                              : projectId
                              ? `${tool.href}?projectId=${projectId}`
                              : tool.href
                            
                            return (
                              <Link
                                key={tool.name}
                                href={toolHref}
                                className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              >
                                {tool.name}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {showActions && stage.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {stage.actions.map((action) => {
                          const actionHref = projectId && action.href.includes("?")
                            ? `${action.href}&projectId=${projectId}`
                            : projectId
                            ? `${action.href}?projectId=${projectId}`
                            : action.href

                          return action.primary ? (
                            <Link key={action.label} href={actionHref}>
                              <Button
                                size="sm"
                                className={`${
                                  isCurrent
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : isCompleted
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-600 hover:bg-gray-700"
                                }`}
                              >
                                {action.label}
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          ) : (
                            <Link key={action.label} href={actionHref}>
                              <Button variant="outline" size="sm">
                                {action.label}
                              </Button>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Summary */}
      {variant === "full" && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Progress: {completedStages.length} of {journeyStages.length} stages completed
            </span>
            <div className="flex gap-1">
              {journeyStages.map((stage) => {
                const status = getStageStatus(stage.id)
                return (
                  <div
                    key={stage.id}
                    className={`w-2 h-2 rounded-full ${
                      status === "completed"
                        ? "bg-green-500"
                        : status === "current"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                    title={stage.title}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

