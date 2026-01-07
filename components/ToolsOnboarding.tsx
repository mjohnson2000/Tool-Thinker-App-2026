"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { OnboardingTooltip } from "@/components/OnboardingTooltip"
import { useOnboarding } from "@/hooks/useOnboarding"

export function ToolsOnboarding() {
  const searchParams = useSearchParams()
  const { onboardingState, markOnboardingComplete } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(0)
  const [showTooltips, setShowTooltips] = useState(false)

  useEffect(() => {
    // Check if we're in tools onboarding mode
    const onboardingParam = searchParams.get("onboarding")
    if (onboardingParam === "true" && onboardingState.path === "explore") {
      setShowTooltips(true)
      // Wait for page to render
      setTimeout(() => {
        setCurrentStep(1)
      }, 1000)
    }
  }, [searchParams, onboardingState])

  const steps = [
    {
      targetId: "tools-header",
      title: "Welcome to Our Tools! 🛠️",
      description:
        "We have 50+ tools organized into categories: Framework Tools, Generator Tools, Calculator Tools, and Template Tools. Each tool helps you make progress on your startup journey.",
    },
    {
      targetId: "tool-categories",
      title: "Tool Categories",
      description:
        "Browse tools by category or use the search bar to find specific tools. Each category has tools designed for different stages of your startup.",
    },
    {
      targetId: "popular-tools",
      title: "Popular Tools",
      description:
        "Start with our most popular tools. These are tried and tested by founders like you. You can use tools standalone or link their outputs to your projects.",
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

