"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { ProjectOnboarding } from "@/components/ProjectOnboarding"
import { JourneyMap } from "@/components/JourneyMap"
import { 
  Lightbulb, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Plus,
  ExternalLink,
  History,
  FolderOpen,
  X,
  Search,
  Filter,
  Tag,
  CheckCircle2,
  Pause,
  Archive,
  Play,
  Trash2
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface Project {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
}

interface ToolOutput {
  id: string
  tool_id: string
  tool_name: string
  output_data: any
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentOutputs, setRecentOutputs] = useState<ToolOutput[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalOutputs: 0,
    recentActivity: 0,
  })
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
      return
    }
    if (user) {
      loadDashboardData()
    }
  }, [user, authLoading, router, searchQuery, statusFilter])

  async function loadDashboardData() {
    if (!user) return
    
    setLoading(true)
    try {
      // Get session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {}
      
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      // Build query params for projects
      const projectParams = new URLSearchParams()
      if (searchQuery) projectParams.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') projectParams.set('status', statusFilter)

      // Load projects and outputs in parallel
      const [projectsRes, outputsRes] = await Promise.all([
        fetch(`/api/projects?${projectParams.toString()}`, { headers }),
        fetch("/api/tool-outputs/list?limit=5", { headers }),
      ])

      const projectsData = projectsRes.ok ? await projectsRes.json() : []
      const outputsData = outputsRes.ok ? await outputsRes.json() : { outputs: [] }

      setProjects(Array.isArray(projectsData) ? projectsData : [])
      setRecentOutputs(outputsData.outputs || [])

      // Calculate stats
      setStats({
        totalProjects: Array.isArray(projectsData) ? projectsData.length : 0,
        totalOutputs: outputsData.outputs?.length || 0,
        recentActivity: outputsData.outputs?.length || 0,
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function createProject() {
    if (!newProjectName.trim() || !user) return

    setIsCreating(true)
    setCreateError(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: newProjectName }),
      })
      
      const project = await res.json()
      
      if (!res.ok) {
        throw new Error(project.error || "Failed to create project")
      }
      
      // Add new project to list and reload
      await loadDashboardData()
      setNewProjectName("")
      setShowNewProjectModal(false)
      
      // Navigate to project overview
      router.push(`/project/${project.id}/overview`)
    } catch (error) {
      console.error("Failed to create project:", error)
      setCreateError(error instanceof Error ? error.message : "Failed to create project")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const headers: HeadersInit = {
        "Authorization": `Bearer ${session.access_token}`,
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers,
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete project")
      }
      
      // Reload dashboard data to reflect the deletion
      await loadDashboardData()
    } catch (error) {
      console.error("Failed to delete project:", error)
      alert(error instanceof Error ? error.message : "Failed to delete project")
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  function getToolUrl(toolId: string) {
    return `/tools/${toolId}`
  }

  function getToolIcon(toolId: string) {
    const iconMap: Record<string, any> = {
      "idea-discovery": Lightbulb,
      "business-plan-generator": FileText,
      "business-model-generator": BarChart3,
      "valuation-calculator": TrendingUp,
    }
    return iconMap[toolId] || FileText
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-300"
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "paused":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "review":
        return "bg-purple-100 text-purple-700 border-purple-300"
      case "complete":
        return "bg-green-100 text-green-700 border-green-300"
      case "archived":
        return "bg-gray-100 text-gray-500 border-gray-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "active":
        return <Play className="w-3 h-3" />
      case "paused":
        return <Pause className="w-3 h-3" />
      case "complete":
        return <CheckCircle2 className="w-3 h-3" />
      case "archived":
        return <Archive className="w-3 h-3" />
      default:
        return null
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
          <ProjectOnboarding />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what you've been working on.</p>
        </div>

        {/* Journey Map */}
        <div className="mb-8">
          <JourneyMap 
            currentStage={
              projects.length === 0 
                ? "discovery" 
                : projects.some((p: any) => p.status === "complete")
                ? "documentation"
                : "planning"
            }
            completedStages={
              projects.length === 0 
                ? [] 
                : projects.some((p: any) => p.status === "complete")
                ? ["discovery", "planning"]
                : ["discovery"]
            }
            variant="compact"
            showActions={true}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Saved Outputs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOutputs}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Recent Activity</p>
                <p className="text-3xl font-bold text-gray-900">{stats.recentActivity}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tool Outputs */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6" />
                Recent Tool Outputs
              </h2>
              <Link href="/history">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentOutputs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No saved outputs yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Start using tools to see your outputs here
                </p>
                <Link href="/tools">
                  <Button>Explore Tools</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOutputs.map((output) => {
                  const Icon = getToolIcon(output.tool_id)
                  return (
                    <Link
                      key={output.id}
                      href={getToolUrl(output.tool_id)}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {output.tool_name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {formatDate(output.created_at)}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Projects */}
          <div id="projects-section" className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="w-6 h-6" />
                  Your Projects
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Structured planning workspaces for your startup ideas
                </p>
              </div>
              <Button 
                id="new-project-button"
                variant="outline" 
                size="sm"
                onClick={() => setShowNewProjectModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-gray-200 focus:border-gray-900"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-2 border-gray-200"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="review">Review</option>
                    <option value="complete">Complete</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2 font-semibold">No projects yet</p>
                <p className="text-sm text-gray-400 mb-2 max-w-md mx-auto">
                  Create a project to get guided, step-by-step help building your startup plan using proven frameworks (JTBD, Value Prop, Business Model).
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Projects help you structure your thinking and track progress from idea to launch.
                </p>
                <Button onClick={() => setShowNewProjectModal(true)}>
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 10).map((project: any) => (
                  <div
                    key={project.id}
                    className="group p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/project/${project.id}/overview`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {project.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            <span className="capitalize">{project.status}</span>
                          </span>
                        </div>
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.tags.map((tag: any) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                <Tag className="w-3 h-3" />
                                {tag.tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Updated {formatDate(project.updated_at)}</span>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/project/${project.id}/overview`}>
                          <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
                              handleDeleteProject(project.id)
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {projects.length > 5 && (
                  <Link href="/dashboard?tab=projects">
                    <Button variant="outline" className="w-full">
                      View All Projects ({projects.length})
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div id="quick-actions" className="mt-8 bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/tools/idea-discovery">
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition border border-yellow-200 text-center">
                <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Idea Discovery</p>
              </div>
            </Link>
            <Link href="/tools/business-plan-generator">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition border border-blue-200 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Business Plan</p>
              </div>
            </Link>
            <Link href="/tools/business-model-generator">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition border border-green-200 text-center">
                <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Business Model</p>
              </div>
            </Link>
            <Link href="/tools">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition border border-purple-200 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">All Tools</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border-2 border-gray-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              <button
                onClick={() => {
                  setShowNewProjectModal(false)
                  setNewProjectName("")
                  setCreateError(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>What is a project?</strong> A structured workspace that guides you through building your startup plan step-by-step using proven frameworks (Jobs-to-be-Done, Value Proposition, Business Model). You'll answer questions, get AI-generated insights, and track your progress.
              </p>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{createError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Name
                </label>
                <Input
                  id="projectName"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., My SaaS Startup, E-commerce Store..."
                  className="border-2 border-gray-200 focus:border-gray-900"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && newProjectName.trim()) {
                      createProject()
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Give your startup idea a name to get started
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={createProject}
                  disabled={isCreating || !newProjectName.trim()}
                  className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Project"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewProjectModal(false)
                    setNewProjectName("")
                    setCreateError(null)
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
