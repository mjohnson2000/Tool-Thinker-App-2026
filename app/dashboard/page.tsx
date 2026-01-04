"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Project {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects")
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error("Failed to load projects:", error)
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
      const project = await res.json()
      setProjects([...projects, project])
      setNewProjectName("")
      // Navigate to project
      window.location.href = `/project/${project.id}/overview`
    } catch (error) {
      console.error("Failed to create project:", error)
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Projects</h1>
          <p className="text-gray-600">
            Start a new startup plan or continue an existing one
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

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No projects yet</p>
            <p className="text-sm text-gray-400">
              Create your first project to get started
            </p>
          </div>
        ) : (
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
    </div>
  )
}




