"use client"

import { ReactNode } from "react"

interface OnboardingWrapperProps {
  children: ReactNode
}

/**
 * OnboardingWrapper - Wraps the app for onboarding functionality
 * 
 * Note: The onboarding modal has been removed. Path selection is now
 * integrated directly into the home page via PathSelectionCard components.
 * This wrapper is kept for potential future onboarding features.
 */
export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  return <>{children}</>
}

