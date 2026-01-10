"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  FileText,
  Loader2,
  X
} from "lucide-react"
import Link from "next/link"
import { AlertModal } from "@/components/ui/modal"

export default function CompareProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [availableProjects, setAvailableProjects] = useState<any[]>([])
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: "success" | "error" | "warning" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
      return
    }
    if (user) {
      loadProjects()
      // Check for project IDs in URL
      const projectIds = searchParams.get('projects')?.split(',')
      if (projectIds && projectIds.length >= 2) {
        setSelectedProjects(projectIds)
        compareProjects(projectIds)
      }
    }
  }, [user, authLoading, router, searchParams])

  async function loadProjects() {
    if (!user) return

    setLoadingProjects(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const projects = await res.json()
        setAvailableProjects(Array.isArray(projects) ? projects : [])
      }
    } catch (error) {
      console.error("Failed to load projects:", error)
    } finally {
      setLoadingProjects(false)
    }
  }

  async function compareProjects(projectIds: string[]) {
    if (projectIds.length < 2) {
      setAlertModal({
        isOpen: true,
        title: "Invalid Selection",
        message: "Please select at least 2 projects to compare.",
        type: "warning",
      })
      return
    }

    if (projectIds.length > 5) {
      setAlertModal({
        isOpen: true,
        title: "Too Many Projects",
        message: "You can compare a maximum of 5 projects at once.",
        type: "warning",
      })
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch("/api/projects/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectIds }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to compare projects")
      }

      setComparison(data)
    } catch (error) {
      console.error("Failed to compare projects:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to compare projects",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  function toggleProject(projectId: string) {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId)
      } else {
        if (prev.length >= 5) {
          setAlertModal({
            isOpen: true,
            title: "Maximum Reached",
            message: "You can compare a maximum of 5 projects at once.",
            type: "warning",
          })
          return prev
        }
        return [...prev, projectId]
      }
    })
  }

  if (loadingProjects) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Compare Projects</h1>
          <p className="text-gray-600">Compare up to 5 projects side by side</p>
        </div>

        {!comparison ? (
          /* Project Selection */
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Projects to Compare</h2>
            <p className="text-gray-600 mb-6">
              Select 2-5 projects to compare their progress, status, and completion rates.
            </p>

            {availableProjects.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No projects available to compare</p>
                <Link href="/dashboard">
                  <Button>Create a Project</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                  {availableProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedProjects.includes(project.id)
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{project.status}</p>
                        </div>
                        {selectedProjects.includes(project.id) && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selectedProjects.length} of {Math.min(5, availableProjects.length)} selected
                  </p>
                  <Button
                    onClick={() => compareProjects(selectedProjects)}
                    disabled={selectedProjects.length < 2 || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Compare Projects
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Comparison Results */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Comparison Results</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setComparison(null)
                  setSelectedProjects([])
                }}
              >
                Compare Different Projects
              </Button>
            </div>

            {/* Completion Rates */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Completion Rates</h3>
              <div className="space-y-4">
                {comparison.metrics.completionRates.map((metric: any) => (
                  <div key={metric.projectId}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{metric.projectName}</span>
                      <span className="text-sm font-semibold text-gray-700">{metric.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full transition-all"
                        style={{ width: `${metric.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparison.projects.map((project: any) => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                    <Link href={`/project/${project.id}/overview`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium text-gray-900 capitalize">{project.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed Steps</span>
                      <span className="font-medium text-gray-900">
                        {Object.values(project.steps).filter((s: any) => s.status === 'completed').length} / {Object.keys(project.steps).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Updated</span>
                      <span className="font-medium text-gray-900">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}

