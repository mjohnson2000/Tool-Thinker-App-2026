"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { X, ExternalLink, CheckCircle2, Zap, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { ToolOutputPreview } from "@/components/ToolOutputPreview"
import { useRouter } from "next/navigation"

interface LinkedToolOutput {
  id: string
  tool_id: string
  tool_name: string
  tool_outputs?: {
    id: string
    output_data: any
    created_at: string
  } | null
  step_id: string | null
  reference_type: string
  created_at: string
}

interface AutoFillSuggestion {
  field: string
  value: string
  description: string
}

interface LinkedToolOutputsProps {
  projectId: string
  stepId?: string
  onAutoFillComplete?: () => void // Callback when auto-fill completes
}

export function LinkedToolOutputs({ projectId, stepId, onAutoFillComplete }: LinkedToolOutputsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [outputs, setOutputs] = useState<LinkedToolOutput[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, AutoFillSuggestion[]>>({})
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<string, boolean>>({})
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({})
  const [filling, setFilling] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadLinkedOutputs()
    }
  }, [user, projectId, stepId])

  async function loadLinkedOutputs() {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError("Not authenticated")
        return
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${session.access_token}`,
      }

      const res = await fetch(`/api/projects/${projectId}/tool-outputs`, { headers })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load linked outputs")
      }

      // Filter by stepId if provided
      const filtered = stepId
        ? data.references.filter((ref: LinkedToolOutput) => ref.step_id === stepId)
        : data.references

      setOutputs(filtered || [])

      // Load auto-fill suggestions for each output if we have a stepId
      if (stepId && filtered && filtered.length > 0) {
        loadSuggestionsForOutputs(filtered)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load linked outputs")
    } finally {
      setLoading(false)
    }
  }

  async function loadSuggestionsForOutputs(outputs: LinkedToolOutput[]) {
    if (!stepId) return

    for (const output of outputs) {
      if (!output.tool_outputs?.id) continue

      setLoadingSuggestions((prev) => ({ ...prev, [output.id]: true }))
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) continue

        const headers: HeadersInit = {
          Authorization: `Bearer ${session.access_token}`,
        }

        const res = await fetch(
          `/api/projects/${projectId}/steps/${stepId}/auto-fill?toolOutputId=${output.tool_outputs.id}`,
          { headers }
        )

        if (res.ok) {
          const data = await res.json()
          setSuggestions((prev) => ({
            ...prev,
            [output.id]: data.suggestions || [],
          }))
        }
      } catch (err) {
        console.error("Failed to load suggestions:", err)
      } finally {
        setLoadingSuggestions((prev) => ({ ...prev, [output.id]: false }))
      }
    }
  }

  async function handleAutoFill(outputId: string, toolOutputId: string) {
    if (!stepId) {
      alert("Step ID is required for auto-fill")
      return
    }

    setFilling(outputId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert("Not authenticated")
        return
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      }

      const res = await fetch(
        `/api/projects/${projectId}/steps/${stepId}/auto-fill`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ toolOutputId }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to auto-fill")
      }

      alert(
        `Successfully filled ${data.filledFields.length} field(s): ${data.filledFields.join(", ")}`
      )
      
      // Refresh the page to show updated inputs
      router.refresh()
      
      // Call callback if provided
      if (onAutoFillComplete) {
        onAutoFillComplete()
      }
    } catch (err: any) {
      alert(err.message || "Failed to auto-fill step fields")
    } finally {
      setFilling(null)
    }
  }

  function toggleExpand(outputId: string) {
    setExpandedOutputs((prev) => ({
      ...prev,
      [outputId]: !prev[outputId],
    }))
  }

  async function unlinkOutput(referenceId: string) {
    if (!confirm("Remove this tool output from the project?")) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const headers: HeadersInit = {
        Authorization: `Bearer ${session.access_token}`,
      }

      const res = await fetch(`/api/projects/${projectId}/tool-outputs/${referenceId}`, {
        method: "DELETE",
        headers,
      })

      if (!res.ok) {
        throw new Error("Failed to unlink output")
      }

      setOutputs(outputs.filter((o) => o.id !== referenceId))
    } catch (err: any) {
      alert(err.message || "Failed to unlink output")
    }
  }

  function getToolUrl(toolId: string): string {
    return `/tools/${toolId}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Loading linked outputs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (outputs.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border-2 border-green-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold text-gray-900">Linked Tool Outputs</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Tool outputs that have been added to this {stepId ? "step" : "project"}
      </p>
      
      <div className="space-y-3">
        {outputs.map((output) => {
          const outputSuggestions = suggestions[output.id] || []
          const hasSuggestions = outputSuggestions.length > 0
          const isExpanded = expandedOutputs[output.id] || false
          const isLoadingSuggestions = loadingSuggestions[output.id]

          return (
            <div
              key={output.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{output.tool_name}</h4>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {output.tool_id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Added {new Date(output.created_at).toLocaleDateString()}
                  </p>
                  
                  {output.tool_outputs && (
                    <div className="mb-3">
                      <ToolOutputPreview
                        toolId={output.tool_id}
                        toolName={output.tool_name}
                        outputData={output.tool_outputs.output_data}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Auto-fill Suggestions */}
                  {stepId && (
                    <div className="mt-3">
                      {isLoadingSuggestions ? (
                        <p className="text-xs text-gray-500">Loading suggestions...</p>
                      ) : hasSuggestions ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-blue-900">
                              💡 Can auto-fill {outputSuggestions.length} field(s)
                            </p>
                            <button
                              onClick={() => toggleExpand(output.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="space-y-2 mt-2">
                              {outputSuggestions.map((suggestion, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded p-2 border border-blue-100"
                                >
                                  <p className="text-xs font-medium text-gray-900 mb-1">
                                    {suggestion.field}
                                  </p>
                                  <p className="text-xs text-gray-600 mb-1">
                                    {suggestion.description}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono bg-gray-50 p-1 rounded truncate">
                                    {suggestion.value.substring(0, 100)}
                                    {suggestion.value.length > 100 && "..."}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          No auto-fill suggestions available for this tool and step
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {stepId && hasSuggestions && output.tool_outputs?.id && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAutoFill(output.id, output.tool_outputs!.id)}
                      disabled={filling === output.id}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      {filling === output.id ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Filling...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Fill Step
                        </span>
                      )}
                    </Button>
                  )}
                  <Link href={getToolUrl(output.tool_id)}>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unlinkOutput(output.id)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

