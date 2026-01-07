"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  getToolUrl, 
  getPriorityColor, 
  getPriorityLabel,
  type ToolRecommendation 
} from "@/lib/tool-guidance/mapping"
import { 
  Calculator, 
  DollarSign, 
  Gem, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Users,
  Mic,
  Lightbulb,
  Search,
  Target,
  ArrowRight
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calculator: Calculator,
  'dollar-sign': DollarSign,
  gem: Gem,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  clock: Clock,
  users: Users,
  mic: Mic,
  lightbulb: Lightbulb,
  search: Search,
  target: Target,
}

interface ToolRecommendationCardProps {
  tool: ToolRecommendation
  projectId?: string
  stepId?: string
  onUse?: (toolId: string) => void
}

export function ToolRecommendationCard({ 
  tool, 
  projectId,
  stepId,
  onUse 
}: ToolRecommendationCardProps) {
  const IconComponent = tool.icon ? iconMap[tool.icon] || Calculator : Calculator
  const priorityColor = getPriorityColor(tool.priority)
  const priorityLabel = getPriorityLabel(tool.priority)
  const toolUrl = getToolUrl(tool.toolId)
  
  // Build URL with project context if available
  const urlWithContext = projectId && stepId
    ? `${toolUrl}?projectId=${projectId}&stepId=${stepId}&returnTo=project`
    : toolUrl

  const handleClick = () => {
    if (onUse) {
      onUse(tool.toolId)
    }
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{tool.toolName}</h4>
            <p className="text-xs text-gray-500">{tool.category}</p>
          </div>
        </div>
        {tool.priority === 'critical' && (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${priorityColor}`}>
            {priorityLabel}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            💡 Why use this:
          </p>
          <p className="text-sm text-gray-600">{tool.reason}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            📍 When to use:
          </p>
          <p className="text-sm text-gray-600">{tool.explanation}</p>
        </div>
      </div>

      <Link href={urlWithContext} onClick={handleClick}>
        <Button 
          variant={tool.priority === 'critical' ? 'default' : 'outline'}
          className="w-full"
        >
          Use {tool.toolName}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  )
}

