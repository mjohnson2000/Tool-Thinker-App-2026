"use client"

import { useMemo } from "react"

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  className?: string
}

export function ProgressRing({
  percentage,
  size = 64,
  strokeWidth = 6,
  color = "#3b82f6",
  backgroundColor = "#e5e7eb",
  className = "",
}: ProgressRingProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
  
  const { radius, circumference, offset } = useMemo(() => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (clampedPercentage / 100) * circumference
    
    return { radius, circumference, offset }
  }, [size, strokeWidth, clampedPercentage])

  return (
    <svg
      width={size}
      height={size}
      className={`transform -rotate-90 ${className}`}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500 ease-out"
      />
    </svg>
  )
}

