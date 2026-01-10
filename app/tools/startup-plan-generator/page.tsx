"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"
import { AlertModal } from "@/components/ui/modal"

interface Project {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
}

export default function StartupPlanGeneratorPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type?: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setError(null)
      const res = await fetch("/api/projects")
      const data = await res.json()
      
      // Check if response contains an error
      if (data.error) {
        console.error("API Error:", data.error)
        setError(data.error)
        setProjects([]) // Set empty array on error
        return
      }
      
      // Check HTTP status
      if (!res.ok) {
        setError(data.error || "Failed to load projects")
        setProjects([])
        return
      }
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        console.error("Unexpected response format:", data)
        setError("Unexpected response format")
        setProjects([])
      }
    } catch (error: any) {
      console.error("Failed to load projects:", error)
      setError(error.message || "Failed to load projects. Please check your connection.")
      setProjects([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  async function createProject() {
    if (!newProjectName.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      })
      
      const data = await res.json()
      
      // Check if response contains an error
      if (data.error) {
        console.error("API Error:", data.error)
        setAlertModal({
          isOpen: true,
          title: "Error",
          message: `Failed to create project: ${data.error}`,
          type: "error",
        })
        setIsCreating(false)
        return
      }
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project")
      }
      
      const project = data
      setProjects([...projects, project])
      setNewProjectName("")
      // Navigate to project
      window.location.href = `/project/${project.id}/overview`
    } catch (error: any) {
      console.error("Failed to create project:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: `Failed to create project: ${error.message || "Unknown error"}`,
        type: "error",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <Rocket className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Startup Plan Generator</h1>
          <p className="text-xl text-gray-600">
            Turn your messy idea into a validated, structured, executable startup plan
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              onKeyPress={(e) => e.key === "Enter" && createProject()}
            />
            <Button onClick={createProject} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm font-semibold mb-1">Error loading projects</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={loadProjects}
              className="mt-2 text-sm text-red-800 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No projects yet</p>
            <p className="text-sm text-gray-400">
              Create your first project to get started
            </p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}/overview`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{project.status}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Updated {new Date(project.updated_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: "", message: "", type: "info" })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}

