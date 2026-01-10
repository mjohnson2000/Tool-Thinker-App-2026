"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import {
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  Mail,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"

interface ProjectShareModalProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
}

export function ProjectShareModal({
  projectId,
  projectName,
  isOpen,
  onClose,
}: ProjectShareModalProps) {
  const { user } = useAuth()
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [shareType, setShareType] = useState<"link" | "email">("link")
  const [emailAddress, setEmailAddress] = useState("")
  const [isSending, setIsSending] = useState(false)

  async function handleGenerateShareLink() {
    if (!user) return

    setIsGenerating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate share link")
      }

      const data = await res.json()
      setShareUrl(data.shareUrl)
    } catch (error) {
      console.error("Failed to generate share link:", error)
      alert(error instanceof Error ? error.message : "Failed to generate share link")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  async function handleShareViaEmail() {
    if (!emailAddress.trim() || !user) return

    setIsSending(true)
    try {
      // This would integrate with your email service
      // For now, we'll just show a success message
      alert(`Share link would be sent to ${emailAddress}`)
      setEmailAddress("")
    } catch (error) {
      console.error("Failed to share via email:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Project"
      size="md"
    >
      <div className="space-y-6">
        {/* Share Type Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setShareType("link")}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              shareType === "link"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Globe className="w-5 h-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm font-medium">Share Link</div>
            <div className="text-xs text-gray-500 mt-1">Generate a shareable link</div>
          </button>
          <button
            onClick={() => setShareType("email")}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              shareType === "email"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Mail className="w-5 h-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm font-medium">Email</div>
            <div className="text-xs text-gray-500 mt-1">Send via email</div>
          </button>
        </div>

        {/* Share Link Section */}
        {shareType === "link" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shareable Link
              </label>
              {!shareUrl ? (
                <Button
                  onClick={handleGenerateShareLink}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Generate Share Link
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Tooltip content={isCopied ? "Copied!" : "Copy link"}>
                      <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        size="sm"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Read-only access • Expires in 30 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Preview shared view
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">How it works:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Anyone with the link can view your project (read-only)</li>
                <li>• Perfect for sharing with investors, advisors, or team members</li>
                <li>• Link expires after 30 days for security</li>
                <li>• You can revoke access anytime</li>
              </ul>
            </div>
          </div>
        )}

        {/* Email Share Section */}
        {shareType === "email" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="colleague@example.com"
                className="border-2 border-gray-200 focus:border-gray-900"
              />
            </div>
            <Button
              onClick={handleShareViaEmail}
              disabled={!emailAddress.trim() || isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Share Link
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

