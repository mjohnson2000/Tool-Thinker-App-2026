"use client"

import { useEffect, useState } from "react"
import { useOnboarding } from "@/hooks/useOnboarding"
import { Sparkles } from "lucide-react"

/**
 * Subtle highlight component for new users on the home page
 * Shows a gentle pulse animation on the path selection cards
 */
export function NewUserHighlight() {
  const { shouldShowOnboarding, onboardingState } = useOnboarding()
  const [showHighlight, setShowHighlight] = useState(false)

  useEffect(() => {
    // Show highlight for new users who haven't completed onboarding
    if (shouldShowOnboarding && !onboardingState.completed && !onboardingState.skipped) {
      setShowHighlight(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowHighlight(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [shouldShowOnboarding, onboardingState])

  if (!showHighlight) return null

  return (
    <div className="fixed bottom-8 right-8 z-40 animate-bounce">
      <div className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-semibold">Choose a path to get started!</span>
      </div>
    </div>
  )
}

