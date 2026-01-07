"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { History, Trash2, ExternalLink, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface ToolOutput {
  id: string
  tool_id: string
  tool_name: string
  output_data: any
  input_data?: any
  metadata?: any
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [outputs, setOutputs] = useState<ToolOutput[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      loadHistory()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  // Reload when filter changes
  useEffect(() => {
    if (user && !authLoading) {
      loadHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTool])

  async function loadHistory() {
    try {
      setError(null)
      
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {}
      
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }
      
      const url = selectedTool
        ? `/api/tool-outputs/list?toolId=${selectedTool}`
        : "/api/tool-outputs/list"
      const response = await fetch(url, { headers })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load history")
      }

      setOutputs(data.outputs || [])
    } catch (err: any) {
      setError(err.message || "Failed to load history")
    } finally {
      setLoading(false)
    }
  }

  async function deleteOutput(id: string) {
    if (!confirm("Are you sure you want to delete this output?")) return

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {}
      
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch(`/api/tool-outputs/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        throw new Error("Failed to delete output")
      }

      setOutputs(outputs.filter((output) => output.id !== id))
    } catch (err: any) {
      alert(err.message || "Failed to delete output")
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function getToolUrl(toolId: string) {
    return `/tools/${toolId}`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your history</p>
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get unique tools for filter
  const uniqueTools = Array.from(
    new Set(outputs.map((output) => output.tool_id))
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <History className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Your History
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            View and manage all your saved tool outputs
          </p>
        </div>

        {/* Filter */}
        {uniqueTools.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedTool === null ? "default" : "outline"}
              onClick={() => {
                setSelectedTool(null)
                loadHistory()
              }}
              className="rounded-full"
            >
              All Tools
            </Button>
            {uniqueTools.map((toolId) => {
              const tool = outputs.find((o) => o.tool_id === toolId)
              return (
                <Button
                  key={toolId}
                  variant={selectedTool === toolId ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTool(toolId)
                    loadHistory()
                  }}
                  className="rounded-full"
                >
                  {tool?.tool_name || toolId}
                </Button>
              )
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Outputs List */}
        {outputs.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-2 border-gray-100">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No saved outputs yet</p>
            <p className="text-gray-500 text-sm mb-6">
              Start using tools to see your history here
            </p>
            <Link href="/tools">
              <Button>Explore Tools</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {outputs.map((output) => (
              <div
                key={output.id}
                className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {output.tool_name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {output.tool_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(output.created_at)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(output.output_data, null, 2).substring(0, 300)}
                        {JSON.stringify(output.output_data, null, 2).length > 300 && "..."}
                      </pre>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={getToolUrl(output.tool_id)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteOutput(output.id)}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

