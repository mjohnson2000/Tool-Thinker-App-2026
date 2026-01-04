"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  toolName: string
  toolId: string
  className?: string
}

export function ShareButton({ toolName, toolId, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return
    
    try {
      // Create shareable URL
      const shareUrl = `${window.location.origin}/tools/${toolId}`
      
      // Try Web Share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: `${toolName} - Tool Thinker`,
          text: `Check out this ${toolName} on Tool Thinker`,
          url: shareUrl,
        })
        return
      }

      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // If share fails (user cancelled), fallback to clipboard
      try {
        const shareUrl = `${window.location.origin}/tools/${toolId}`
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (clipboardError) {
        console.error("Failed to share:", clipboardError)
      }
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className={`flex items-center gap-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 ${className}`}
      aria-label="Share this tool"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </>
      )}
    </Button>
  )
}

