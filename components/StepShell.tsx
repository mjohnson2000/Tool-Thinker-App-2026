"use client"

import { ReactNode } from "react"
import { ProgressBar } from "./ProgressBar"
import { FRAMEWORK_ORDER } from "@/lib/frameworks"

interface StepShellProps {
  currentStep: string
  completedSteps: string[]
  title: string
  description?: string
  children: ReactNode
}

export function StepShell({
  currentStep,
  completedSteps,
  title,
  description,
  children,
}: StepShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
        <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />
        {children}
      </div>
    </div>
  )
}



