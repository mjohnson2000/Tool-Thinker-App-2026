"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { FolderPlus, Check, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface Project {
  id: string
  name: string
  status: string
}

interface AddToProjectButtonProps {
  toolOutputId: string
  toolId: string
  toolName: string
  stepId?: string
}

export function AddToProjectButton({ 
  toolOutputId, 
  toolId, 
  toolName,
  stepId 
}: AddToProjectButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(stepId || null)
  const [linked, setLinked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get projectId and stepId from URL params if present
  const projectIdFromUrl = searchParams.get('projectId')
  const stepIdFromUrl = searchParams.get('stepId')

  useEffect(() => {
    if (projectIdFromUrl) {
      setSelectedProjectId(projectIdFromUrl)
    }
    if (stepIdFromUrl) {
      setSelectedStepId(stepIdFromUrl)
    }
  }, [projectIdFromUrl, stepIdFromUrl])

  useEffect(() => {
    if (user && showModal) {
      loadProjects()
    }
  }, [user, showModal])

  async function loadProjects() {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const headers: HeadersInit = {
        Authorization: `Bearer ${session.access_token}`,
      }

      const res = await fetch("/api/projects", { headers })
      const data = await res.json()

      if (res.ok && Array.isArray(data)) {
        setProjects(data)
        // Auto-select project from URL if available
        if (projectIdFromUrl && data.find((p: Project) => p.id === projectIdFromUrl)) {
          setSelectedProjectId(projectIdFromUrl)
        }
      }
    } catch (err) {
      console.error("Failed to load projects:", err)
    }
  }

  async function linkToProject() {
    if (!selectedProjectId || !user) return

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
        "Content-Type": "application/json",
      }

      const res = await fetch(`/api/projects/${selectedProjectId}/tool-outputs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          tool_output_id: toolOutputId,
          step_id: selectedStepId || null,
          reference_type: "context",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to link to project")
      }

      setLinked(true)
      setShowModal(false)

      // If returnTo=project in URL, redirect back to project
      if (searchParams.get('returnTo') === 'project' && projectIdFromUrl) {
        if (stepIdFromUrl) {
          router.push(`/project/${projectIdFromUrl}/step/${stepIdFromUrl}`)
        } else {
          router.push(`/project/${projectIdFromUrl}/overview`)
        }
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "Failed to link to project")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (linked) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium">Added to Project</span>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FolderPlus className="w-4 h-4" />
        Add to Project
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border-2 border-gray-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add to Project</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setError(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="project" className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Project
                </label>
                {projects.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">No projects yet. Create one first.</p>
                    <Button
                      onClick={() => {
                        setShowModal(false)
                        router.push("/dashboard")
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <select
                    id="project"
                    value={selectedProjectId || ""}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-gray-900 rounded-lg p-3"
                  >
                    <option value="">Select a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedProjectId && (
                <div>
                  <label htmlFor="step" className="block text-sm font-semibold text-gray-900 mb-2">
                    Link to Step (Optional)
                  </label>
                  <select
                    id="step"
                    value={selectedStepId || ""}
                    onChange={(e) => setSelectedStepId(e.target.value || null)}
                    className="w-full border-2 border-gray-200 focus:border-gray-900 rounded-lg p-3"
                  >
                    <option value="">No specific step (link to project)</option>
                    <option value="jtbd">Jobs To Be Done</option>
                    <option value="value_prop">Value Proposition</option>
                    <option value="business_model">Business Model</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Linking to a step helps organize your tool outputs
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={linkToProject}
                  disabled={loading || !selectedProjectId}
                  className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700"
                >
                  {loading ? "Linking..." : "Add to Project"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setError(null)
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

