"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { History, Trash2, ExternalLink, Calendar, Rocket, Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
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
  const router = useRouter()
  const [outputs, setOutputs] = useState<ToolOutput[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [creatingProject, setCreatingProject] = useState<string | null>(null)
  const [expandedDiscoveries, setExpandedDiscoveries] = useState<Set<string>>(new Set())

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

  function toggleDiscoveryDetails(outputId: string) {
    setExpandedDiscoveries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(outputId)) {
        newSet.delete(outputId)
      } else {
        newSet.add(outputId)
      }
      return newSet
    })
  }

  function renderIdeaDiscoveryPreview(output: ToolOutput) {
    const data = output.output_data
    if (!data) return <p className="text-sm text-gray-500">No preview available</p>

    const businessArea = data.selectedBusinessArea || data.businessArea
    const customer = data.selectedCustomer || data.customer
    const job = data.selectedJob || data.job
    const solution = data.selectedSolution || data.solution

    return (
      <div className="flex items-center gap-4 text-sm">
        {businessArea && (
          <div className="flex items-center gap-2">
            <span className="text-lg">{businessArea.icon || "💡"}</span>
            <span className="font-semibold text-gray-900">{businessArea.title || "Untitled Idea"}</span>
          </div>
        )}
        {customer && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>→</span>
            <span>{customer.title || "Customer"}</span>
          </div>
        )}
        {job && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>→</span>
            <span>{job.title || "Problem"}</span>
          </div>
        )}
        {solution && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>→</span>
            <span>{solution.title || "Solution"}</span>
          </div>
        )}
      </div>
    )
  }

  function getToolUrl(toolId: string) {
    return `/tools/${toolId}`
  }

  async function createProjectFromDiscovery(output: ToolOutput) {
    if (!user) {
      router.push("/signin")
      return
    }

    if (output.tool_id !== "idea-discovery") {
      return
    }

    setCreatingProject(output.id)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const discoveryData = output.output_data
      if (!discoveryData) {
        throw new Error("No discovery data found")
      }

      // Handle both old and new data structures
      const businessArea = discoveryData.selectedBusinessArea || discoveryData.businessArea
      const customer = discoveryData.selectedCustomer || discoveryData.customer
      const job = discoveryData.selectedJob || discoveryData.job
      const solution = discoveryData.selectedSolution || discoveryData.solution

      if (!businessArea || !customer || !job || !solution) {
        throw new Error("Incomplete discovery data. Please ensure all fields are filled.")
      }

      const projectName = businessArea.title || "My Startup Idea"

      const res = await fetch("/api/projects/from-discovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectName,
          discoveryData: {
            selectedBusinessArea: businessArea,
            selectedCustomer: customer,
            selectedJob: job,
            selectedSolution: solution,
          },
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to create project")
      }

      // Navigate to the project overview
      router.push(`/project/${result.project.id}/overview?fromDiscovery=true`)
    } catch (err: any) {
      setError(err.message || "Failed to create project. Please try again.")
      setCreatingProject(null)
    }
  }

  function renderIdeaDiscoveryOutput(output: ToolOutput) {
    const data = output.output_data
    if (!data) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">No discovery data available</p>
        </div>
      )
    }

    // Handle both old and new data structures
    const businessArea = data.selectedBusinessArea || data.businessArea
    const customer = data.selectedCustomer || data.customer
    const job = data.selectedJob || data.job
    const solution = data.selectedSolution || data.solution

    // If no data at all, show fallback
    if (!businessArea && !customer && !job && !solution) {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Discovery data:</p>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Business Area */}
        {businessArea && (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{businessArea.icon || "💡"}</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Business Idea</h4>
                <p className="font-bold text-gray-900">{businessArea.title || "Untitled Idea"}</p>
                {businessArea.description && (
                  <p className="text-sm text-gray-600 mt-1">{businessArea.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer */}
        {customer && (
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{customer.icon || "👤"}</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Target Customer</h4>
                <p className="font-bold text-gray-900">{customer.title || "Customer"}</p>
                {customer.description && (
                  <p className="text-sm text-gray-600 mt-1">{customer.description}</p>
                )}
                {customer.painPoints && customer.painPoints.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Pain Points:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {customer.painPoints.slice(0, 3).map((point: string, idx: number) => (
                        <li key={idx}>• {point}</li>
                      ))}
                      {customer.painPoints.length > 3 && (
                        <li className="text-gray-500">+ {customer.painPoints.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Job */}
        {job && (
          <div className="bg-gradient-to-br from-red-50 to-white rounded-lg p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{job.icon || "🎯"}</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Job-to-be-Done</h4>
                <p className="font-bold text-gray-900">{job.title || "Job"}</p>
                {job.description && (
                  <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                )}
                {job.problemStatement && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs font-semibold text-red-800 mb-1">Problem:</p>
                    <p className="text-xs text-red-700">{job.problemStatement}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Solution */}
        {solution && (
          <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-4 border border-green-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{solution.icon || "🚀"}</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Solution</h4>
                <p className="font-bold text-gray-900">{solution.title || "Solution"}</p>
                {solution.description && (
                  <p className="text-sm text-gray-600 mt-1">{solution.description}</p>
                )}
                {solution.keyFeatures && solution.keyFeatures.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Key Features:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {solution.keyFeatures.slice(0, 3).map((feature: string, idx: number) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                      {solution.keyFeatures.length > 3 && (
                        <li className="text-gray-500">+ {solution.keyFeatures.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderGenericOutput(output: ToolOutput) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
          {JSON.stringify(output.output_data, null, 2).substring(0, 500)}
          {JSON.stringify(output.output_data, null, 2).length > 500 && "..."}
        </pre>
      </div>
    )
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

        {/* Success Message */}
        {creatingProject && (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-blue-800 text-sm font-medium">Creating project...</p>
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
            {outputs.map((output) => {
              const isIdeaDiscovery = output.tool_id === "idea-discovery"
              
              return (
                <div
                  key={output.id}
                  className={`bg-white rounded-xl p-6 shadow-lg border-2 ${
                    isIdeaDiscovery ? "border-yellow-200" : "border-gray-100"
                  } hover:shadow-xl transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {isIdeaDiscovery && (
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-yellow-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">
                            {output.tool_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {output.tool_id}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(output.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Render output based on type */}
                      {isIdeaDiscovery ? (
                        <div>
                          {/* Preview */}
                          <div className="mb-3">
                            {renderIdeaDiscoveryPreview(output)}
                          </div>
                          
                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => toggleDiscoveryDetails(output.id)}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
                          >
                            {expandedDiscoveries.has(output.id) ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                View Full Details
                              </>
                            )}
                          </button>

                          {/* Full Details (Collapsible) */}
                          {expandedDiscoveries.has(output.id) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {renderIdeaDiscoveryOutput(output)}
                            </div>
                          )}
                        </div>
                      ) : (
                        renderGenericOutput(output)
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {isIdeaDiscovery && (
                        <Button
                          onClick={() => createProjectFromDiscovery(output)}
                          disabled={creatingProject === output.id}
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          {creatingProject === output.id ? (
                            <>Creating...</>
                          ) : (
                            <>
                              <Rocket className="w-4 h-4 mr-2" />
                              Create Project
                            </>
                          )}
                        </Button>
                      )}
                      <Link href={getToolUrl(output.tool_id)}>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Tool
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

