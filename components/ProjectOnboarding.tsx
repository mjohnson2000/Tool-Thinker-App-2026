"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { OnboardingTooltip } from "@/components/OnboardingTooltip"
import { useOnboarding } from "@/hooks/useOnboarding"

export function ProjectOnboarding() {
  const searchParams = useSearchParams()
  const { onboardingState, markOnboardingComplete } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(0)
  const [showTooltips, setShowTooltips] = useState(false)

  useEffect(() => {
    // Check if we're in project onboarding mode
    const onboardingParam = searchParams.get("onboarding")
    if (onboardingParam === "project" && onboardingState.path === "project") {
      setShowTooltips(true)
      // Wait for page to render
      setTimeout(() => {
        setCurrentStep(1)
      }, 1000)
    }
  }, [searchParams, onboardingState])

  const steps = [
    {
      targetId: "new-project-button",
      title: "Create Your First Project",
      description:
        "A project is a structured workspace for building your startup plan. Click here to create one!",
    },
    {
      targetId: "projects-section",
      title: "Your Projects",
      description:
        "All your projects will appear here. Each project guides you through 3 steps: Jobs To Be Done, Value Proposition, and Business Model.",
    },
    {
      targetId: "quick-actions",
      title: "Quick Actions",
      description:
        "Quick access to popular tools. You can use tools standalone or link them to your projects.",
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
    // Mark onboarding as complete for this path
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

