"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { ReactNode } from "react"

interface HelpTooltipProps {
  content: string | ReactNode
  children?: ReactNode
  className?: string
}

export function HelpTooltip({ content, children, className }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {children ? (
            <span className={className}>{children}</span>
          ) : (
            <HelpCircle className={`w-4 h-4 text-gray-400 cursor-help ${className}`} />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm p-3 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
