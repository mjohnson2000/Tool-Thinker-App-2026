"use client"

import { FRAMEWORK_ORDER } from "@/lib/frameworks"

interface ProgressBarProps {
  currentStep: string
  completedSteps: string[]
}

export function ProgressBar({ currentStep, completedSteps }: ProgressBarProps) {
  const currentIndex = FRAMEWORK_ORDER.indexOf(currentStep as any)
  const total = FRAMEWORK_ORDER.length
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentIndex + 1} of {total}
        </span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gray-900 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {FRAMEWORK_ORDER.map((step, index) => {
          const isCompleted = completedSteps.includes(step)
          const isCurrent = step === currentStep
          return (
            <div
              key={step}
              className={`text-xs ${
                isCurrent
                  ? "text-gray-900 font-semibold"
                  : isCompleted
                  ? "text-gray-600"
                  : "text-gray-400"
              }`}
            >
              {index + 1}
            </div>
          )
        })}
      </div>
    </div>
  )
}



