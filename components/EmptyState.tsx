"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface EmptyStateProps {
  icon: ReactNode
  title: string
  message: string
  ctaText?: string
  onCtaClick?: () => void
  secondaryCtaText?: string
  onSecondaryCtaClick?: () => void
}

export function EmptyState({
  icon,
  title,
  message,
  ctaText,
  onCtaClick,
  secondaryCtaText,
  onSecondaryCtaClick,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{message}</p>
        {(ctaText || secondaryCtaText) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            {ctaText && onCtaClick && (
              <Button
                onClick={onCtaClick}
                className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                {ctaText}
              </Button>
            )}
            {secondaryCtaText && onSecondaryCtaClick && (
              <Button
                onClick={onSecondaryCtaClick}
                variant="outline"
                className="px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {secondaryCtaText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
