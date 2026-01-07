"use client"

import { useState, useEffect, useRef } from "react"
import { X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingTooltipProps {
  targetId?: string // ID of element to highlight
  position?: "top" | "bottom" | "left" | "right" | "center"
  title: string
  description: string
  onNext?: () => void
  onSkip?: () => void
  show?: boolean
  step?: number
  totalSteps?: number
}

export function OnboardingTooltip({
  targetId,
  position = "bottom",
  title,
  description,
  onNext,
  onSkip,
  show = true,
  step,
  totalSteps,
}: OnboardingTooltipProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (targetId && show) {
      const element = document.getElementById(targetId)
      setTargetElement(element)
    }
  }, [targetId, show])

  useEffect(() => {
    if (targetElement && tooltipRef.current && show) {
      const updatePosition = () => {
        const rect = targetElement.getBoundingClientRect()
        const tooltipRect = tooltipRef.current?.getBoundingClientRect()
        const scrollY = window.scrollY
        const scrollX = window.scrollX

        let top = 0
        let left = 0

        switch (position) {
          case "top":
            top = rect.top + scrollY - (tooltipRect?.height || 0) - 10
            left = rect.left + scrollX + rect.width / 2 - (tooltipRect?.width || 0) / 2
            break
          case "bottom":
            top = rect.bottom + scrollY + 10
            left = rect.left + scrollX + rect.width / 2 - (tooltipRect?.width || 0) / 2
            break
          case "left":
            top = rect.top + scrollY + rect.height / 2 - (tooltipRect?.height || 0) / 2
            left = rect.left + scrollX - (tooltipRect?.width || 0) - 10
            break
          case "right":
            top = rect.top + scrollY + rect.height / 2 - (tooltipRect?.height || 0) / 2
            left = rect.right + scrollX + 10
            break
          case "center":
            top = window.innerHeight / 2 + scrollY - (tooltipRect?.height || 0) / 2
            left = window.innerWidth / 2 + scrollX - (tooltipRect?.width || 0) / 2
            break
        }

        setTooltipPosition({ top, left })
      }

      updatePosition()
      window.addEventListener("scroll", updatePosition)
      window.addEventListener("resize", updatePosition)

      // Scroll target into view
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" })

      return () => {
        window.removeEventListener("scroll", updatePosition)
        window.removeEventListener("resize", updatePosition)
      }
    }
  }, [targetElement, position, show])

  if (!show) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40" />

      {/* Highlight target element */}
      {targetElement && (
        <div
          className="fixed z-40 border-4 border-blue-500 rounded-lg pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top + window.scrollY - 4,
            left: targetElement.getBoundingClientRect().left + window.scrollX - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-xl shadow-2xl p-6 max-w-sm"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {step && totalSteps && (
          <div className="text-xs text-gray-500 mb-2">
            Step {step} of {totalSteps}
          </div>
        )}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 ml-2"
              aria-label="Skip"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex gap-2">
          {onNext && (
            <Button onClick={onNext} className="flex-1">
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {onSkip && (
            <Button onClick={onSkip} variant="outline" className="flex-1">
              Skip
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

