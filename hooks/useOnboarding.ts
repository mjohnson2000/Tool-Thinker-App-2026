"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"

interface OnboardingState {
  completed: boolean
  skipped: boolean
  path?: string
  started: boolean
}

export function useOnboarding() {
  const { user } = useAuth()
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    completed: false,
    skipped: false,
    started: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadOnboardingState()
    } else {
      setLoading(false)
    }
  }, [user])

  async function loadOnboardingState() {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        console.error("Error loading onboarding state:", error)
      }

      const prefs = data?.preferences || {}
      setOnboardingState({
        completed: prefs.onboarding_completed || false,
        skipped: prefs.onboarding_skipped || false,
        path: prefs.onboarding_path,
        started: prefs.onboarding_started || false,
      })
    } catch (error) {
      console.error("Error loading onboarding state:", error)
    } finally {
      setLoading(false)
    }
  }

  async function markOnboardingComplete() {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: user.id,
            preferences: {
              onboarding_completed: true,
            },
          },
          { onConflict: "user_id" }
        )

      setOnboardingState((prev) => ({ ...prev, completed: true }))
    } catch (error) {
      console.error("Error marking onboarding complete:", error)
    }
  }

  async function markOnboardingSkipped() {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      // Update local state immediately to prevent modal from showing again
      setOnboardingState((prev) => ({ ...prev, completed: true, skipped: true }))

      // Then save to database
      await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: user.id,
            preferences: {
              onboarding_completed: true,
              onboarding_skipped: true,
            },
          },
          { onConflict: "user_id" }
        )
    } catch (error) {
      console.error("Error marking onboarding skipped:", error)
    }
  }

  function shouldShowOnboarding(): boolean {
    return !loading && user && !onboardingState.completed && !onboardingState.skipped
  }

  return {
    onboardingState,
    loading,
    shouldShowOnboarding: shouldShowOnboarding(),
    markOnboardingComplete,
    markOnboardingSkipped,
    reload: loadOnboardingState,
  }
}

