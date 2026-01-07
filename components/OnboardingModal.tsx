"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Lightbulb, FolderOpen, Compass, X, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useOnboarding } from "@/hooks/useOnboarding"
import { supabase } from "@/lib/supabase/client"

interface OnboardingModalProps {
  onComplete: (path?: string) => void
  onSkip: () => void
}

export function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const { user } = useAuth()
  const { markOnboardingSkipped, reload } = useOnboarding()
  const router = useRouter()
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  async function handlePathSelect(path: string) {
    setSelectedPath(path)
    
    // Close modal immediately for better UX
    onComplete(path)
    
    // Save onboarding path to user preferences
    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          // Update user preferences
          const { error } = await supabase
            .from("user_preferences")
            .upsert(
              {
                user_id: user.id,
                preferences: {
                  onboarding_path: path,
                  onboarding_started: true,
                },
              },
              { onConflict: "user_id" }
            )

          if (error) {
            console.error("Failed to save onboarding path:", error)
          }
        }
      } catch (error) {
        console.error("Error saving onboarding path:", error)
      }
    }

    // Small delay before navigation to allow modal to close smoothly
    setTimeout(() => {
      // Navigate based on path
      if (path === "project") {
        // Will show project creation modal on dashboard
        router.push("/dashboard?onboarding=project")
      } else if (path === "discovery") {
        router.push("/tools/idea-discovery?onboarding=true")
      } else if (path === "explore") {
        router.push("/tools?onboarding=true")
      }
    }, 200) // Small delay for smooth transition
  }

  async function handleSkip() {
    // Close the modal first to prevent flicker
    onSkip()
    // Mark onboarding as skipped using the hook
    await markOnboardingSkipped()
    // Reload the state to update shouldShowOnboarding
    await reload()
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Tool Thinker! 🎉</h2>
            <p className="text-gray-600 mt-2">
              We help founders make quick progress with the right tools at the right time.
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <p className="text-lg text-gray-700 mb-8 text-center">
            What would you like to do first?
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Path 1: I have a business idea */}
            <button
              onClick={() => handlePathSelect("project")}
              className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                selectedPath === "project"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <FolderOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  I have a business idea
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Great! Let's create a project to plan it step-by-step.
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Structured planning</p>
                  <p>✓ Step-by-step guidance</p>
                  <p>✓ AI-powered insights</p>
                </div>
              </div>
              {selectedPath === "project" && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>

            {/* Path 2: I need to discover an idea */}
            <button
              onClick={() => handlePathSelect("discovery")}
              className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                selectedPath === "discovery"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                  <Lightbulb className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  I need to discover an idea
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Perfect! Our Idea Discovery tool will help you find business ideas from scratch based on your interests and goals.
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ AI-powered suggestions</p>
                  <p>✓ Personalized opportunities</p>
                  <p>✓ Guided journey</p>
                </div>
              </div>
              {selectedPath === "discovery" && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>

            {/* Path 3: Just explore tools */}
            <button
              onClick={() => handlePathSelect("explore")}
              className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                selectedPath === "explore"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Compass className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  I just want to explore tools
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  No problem! Browse our 50+ tools to see what's available.
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ 50+ tools available</p>
                  <p>✓ Calculators & generators</p>
                  <p>✓ Use anytime</p>
                </div>
              </div>
              {selectedPath === "explore" && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Skip Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Skip for now
            </button>
            <p className="text-xs text-gray-400 mt-2">
              You can explore tools and features on your own. Onboarding won't appear again.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

