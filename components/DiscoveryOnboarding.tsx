"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { OnboardingTooltip } from "@/components/OnboardingTooltip"
import { useOnboarding } from "@/hooks/useOnboarding"

export function DiscoveryOnboarding() {
  const searchParams = useSearchParams()
  const { onboardingState, markOnboardingComplete } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(0)
  const [showTooltips, setShowTooltips] = useState(false)

  useEffect(() => {
    // Check if we're in discovery onboarding mode
    const onboardingParam = searchParams.get("onboarding")
    if (onboardingParam === "true" && onboardingState.path === "discovery") {
      setShowTooltips(true)
      // Wait for page to render
      setTimeout(() => {
        setCurrentStep(1)
      }, 1000)
    }
  }, [searchParams, onboardingState])

  const steps = [
    {
      targetId: "idea-discovery-header",
      title: "Welcome to Idea Discovery! 💡",
      description:
        "This tool guides you through a focused journey to discover your next startup idea. We'll ask about your interests and passions, then AI will generate personalized startup opportunities.",
    },
    {
      targetId: "idea-discovery-progress",
      title: "Track Your Progress",
      description:
        "Watch your progress as you move through each step. You can always go back to previous steps to refine your answers.",
    },
    {
      targetId: "idea-discovery-content",
      title: "AI-Powered Suggestions",
      description:
        "At each step, our AI will generate 6 personalized options based on your input. Choose the one that resonates most with you.",
    },
  ]

  function handleNext() {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  function handleSkip() {
    handleComplete()
  }

  async function handleComplete() {
    setShowTooltips(false)
    // Mark onboarding as complete
    await markOnboardingComplete()
  }

  if (!showTooltips || currentStep === 0 || currentStep > steps.length) {
    return null
  }

  const currentStepData = steps[currentStep - 1]

  return (
    <OnboardingTooltip
      targetId={currentStepData.targetId}
      position="bottom"
      title={currentStepData.title}
      description={currentStepData.description}
      onNext={currentStep < steps.length ? handleNext : undefined}
      onSkip={handleSkip}
      show={true}
      step={currentStep}
      totalSteps={steps.length}
    />
  )
}

