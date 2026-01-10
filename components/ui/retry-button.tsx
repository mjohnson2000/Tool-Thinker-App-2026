"use client"

import { Button } from "./button"
import { RefreshCw } from "lucide-react"

interface RetryButtonProps {
  onRetry: () => void
  isLoading?: boolean
  className?: string
}

export function RetryButton({ onRetry, isLoading = false, className }: RetryButtonProps) {
  return (
    <Button
      onClick={onRetry}
      disabled={isLoading}
      variant="outline"
      className={className}
      aria-label="Retry operation"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
      {isLoading ? "Retrying..." : "Retry"}
    </Button>
  )
}

