"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"

interface SaveToolOutputOptions {
  toolId: string
  toolName: string
  outputData: any
  inputData?: any
  metadata?: Record<string, any>
}

export function useSaveToolOutput() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveOutput = async (options: SaveToolOutputOptions) => {
    if (!user) {
      setError("You must be signed in to save outputs")
      return { success: false, error: "Not authenticated" }
    }

    setSaving(true)
    setError(null)

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { "Content-Type": "application/json" }
      
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      const response = await fetch("/api/tool-outputs/save", {
        method: "POST",
        headers,
        body: JSON.stringify(options),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save output")
      }

      return { success: true, data: data.data }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save output"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setSaving(false)
    }
  }

  return { saveOutput, saving, error }
}

