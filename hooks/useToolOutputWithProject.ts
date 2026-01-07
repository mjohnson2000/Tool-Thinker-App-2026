"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { useSaveToolOutput } from "./useSaveToolOutput"

interface SaveAndLinkOptions {
  toolId: string
  toolName: string
  outputData: any
  inputData?: any
  metadata?: Record<string, any>
  projectId?: string
  stepId?: string
}

export function useToolOutputWithProject() {
  const { user } = useAuth()
  const { saveOutput, saving } = useSaveToolOutput()
  const [linking, setLinking] = useState(false)
  const [linked, setLinked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOutputId, setSavedOutputId] = useState<string | null>(null)

  const saveAndLink = async (options: SaveAndLinkOptions) => {
    if (!user) {
      setError("You must be signed in to save outputs")
      return { success: false, error: "Not authenticated" }
    }

    setError(null)
    setLinked(false)

    try {
      // First, save the tool output
      const saveResult = await saveOutput({
        toolId: options.toolId,
        toolName: options.toolName,
        outputData: options.outputData,
        inputData: options.inputData,
        metadata: options.metadata,
      })

      if (!saveResult.success || !saveResult.data) {
        throw new Error(saveResult.error || "Failed to save output")
      }

      const outputId = saveResult.data.id
      setSavedOutputId(outputId)

      // If projectId is provided, link to project
      if (options.projectId) {
        setLinking(true)
        
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          throw new Error("No active session found")
        }

        const linkRes = await fetch(`/api/projects/${options.projectId}/tool-outputs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            tool_output_id: outputId,
            step_id: options.stepId || null,
            reference_type: "context",
          }),
        })

        const linkData = await linkRes.json()

        if (!linkRes.ok) {
          throw new Error(linkData.error || "Failed to link to project")
        }

        setLinked(true)
        setLinking(false)
      }

      return { 
        success: true, 
        outputId,
        linked: !!options.projectId,
        data: saveResult.data 
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save output"
      setError(errorMessage)
      setLinking(false)
      return { success: false, error: errorMessage }
    }
  }

  return {
    saveAndLink,
    saving: saving || linking,
    savingOutput: saving,
    linkingToProject: linking,
    linked,
    error,
    savedOutputId,
  }
}

