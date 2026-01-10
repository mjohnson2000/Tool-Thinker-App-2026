"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
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
  Folder,
  X,
  Search,
  Filter,
  Tag,
  CheckCircle2,
  Pause,
  Archive,
  Play,
  Trash2,
  Copy,
  Activity,
  Target,
  Sparkles,
  Grid3x3,
  List
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ConfirmationModal, AlertModal } from "@/components/ui/modal"
import { Skeleton, SkeletonStatsCard, SkeletonProjectCard, SkeletonCard } from "@/components/ui/skeleton"
import { Tooltip } from "@/components/ui/tooltip"
import { useDebounce } from "@/hooks/useDebounce"
import { RetryButton } from "@/components/ui/retry-button"
import { ProjectTemplatesModal } from "@/components/ProjectTemplatesModal"
import { ProjectFolders } from "@/components/ProjectFolders"
import { ProjectReminders } from "@/components/ProjectReminders"
import { ProjectCard } from "@/components/ProjectCard"
import { ProjectEmptyState } from "@/components/ProjectEmptyState"

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
  const [error, setError] = useState<string | null>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; projectId: string | null; projectName: string }>({
    isOpen: false,
    projectId: null,
    projectName: "",
  })
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type?: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })
  const [duplicatingProject, setDuplicatingProject] = useState<string | null>(null)
  const [projectHealthScores, setProjectHealthScores] = useState<Record<string, { score: number; status: string; nextStep?: string }>>({})
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [folders, setFolders] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all")
  const [newProjectFolderId, setNewProjectFolderId] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
      return
    }
    if (user) {
      loadDashboardData()
      loadFolders()
    }
  }, [user, authLoading, router, debouncedSearchQuery, statusFilter, selectedFolderId])

  // Refresh data when page becomes visible again (e.g., navigating back from project page)
  useEffect(() => {
    if (!user) return

    let lastRefreshTime = Date.now()
    const REFRESH_COOLDOWN = 2000 // Don't refresh more than once every 2 seconds

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        const now = Date.now()
        // Only refresh if it's been at least 2 seconds since last refresh
        if (now - lastRefreshTime > REFRESH_COOLDOWN) {
          lastRefreshTime = now
          loadDashboardData()
        }
      }
    }

    const handleFocus = () => {
      if (user) {
        const now = Date.now()
        // Only refresh if it's been at least 2 seconds since last refresh
        if (now - lastRefreshTime > REFRESH_COOLDOWN) {
          lastRefreshTime = now
          loadDashboardData()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  async function loadFolders() {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/projects/folders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders || [])
      } else if (res.status !== 503) {
        // Only log non-503 errors (503 means feature not available, which is fine)
        console.error("Failed to load folders")
      }
    } catch (error) {
      console.error("Failed to load folders:", error)
    }
  }

  async function loadDashboardData() {
    if (!user) return
    
    setLoading(true)
    try {
      // Get session token for authentication
      let { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // If session is expired or missing, try to refresh
      if (sessionError || !session?.access_token) {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        if (!refreshError && refreshedSession?.access_token) {
          session = refreshedSession
        }
      }
      
      const headers: HeadersInit = {}
      
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      // Build query params for projects
      const projectParams = new URLSearchParams()
      if (debouncedSearchQuery) projectParams.set('search', debouncedSearchQuery)
      if (statusFilter && statusFilter !== 'all') projectParams.set('status', statusFilter)
      if (selectedFolderId && selectedFolderId !== 'all') projectParams.set('folder_id', selectedFolderId)

      // Load projects, outputs, and folders in parallel
      const [projectsRes, outputsRes, foldersRes] = await Promise.all([
        fetch(`/api/projects?${projectParams.toString()}`, { headers }),
        fetch("/api/tool-outputs/list?limit=5", { headers }),
        fetch("/api/projects/folders", { headers }).catch(() => ({ ok: false, json: async () => ({ folders: [] }) })),
      ])

      const projectsData = projectsRes.ok ? await projectsRes.json() : []
      const outputsData = outputsRes.ok ? await outputsRes.json() : { outputs: [] }
      const foldersData = foldersRes.ok ? await foldersRes.json() : { folders: [] }

      // Store all projects (filtering happens client-side with useMemo)
      const allProjects = Array.isArray(projectsData) ? projectsData : []
      setProjects(allProjects)
      setRecentOutputs(outputsData.outputs || [])
      setFolders(foldersData.folders || [])

      // Load health scores for all projects
      const healthScores: Record<string, { score: number; status: string; nextStep?: string }> = {}
      await Promise.all(
        allProjects.map(async (project: any) => {
          try {
            const healthRes = await fetch(`/api/projects/${project.id}/health`, { headers })
            if (healthRes.ok) {
              const healthData = await healthRes.json()
              healthScores[project.id] = {
                score: healthData.healthScore || 0,
                status: healthData.healthStatus || 'needs_attention',
                nextStep: healthData.nextStepSuggestion,
              }
            }
          } catch (error) {
            // Ignore health score errors
          }
        })
      )
      setProjectHealthScores(healthScores)

      // Calculate stats
      setStats({
        totalProjects: allProjects.length,
        totalOutputs: outputsData.outputs?.length || 0,
        recentActivity: outputsData.outputs?.length || 0,
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      setError(error instanceof Error ? error.message : "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  async function handleDuplicateProject(projectId: string, projectName: string) {
    if (!user) return

    setDuplicatingProject(projectId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      }

      const res = await fetch(`/api/projects/${projectId}/duplicate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: `${projectName} (Copy)` }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to duplicate project")
      }

      // Reload dashboard
      await loadDashboardData()

      setAlertModal({
        isOpen: true,
        title: "Project Duplicated",
        message: `"${data.project.name}" has been created successfully.`,
        type: "success",
      })
    } catch (error) {
      console.error("Failed to duplicate project:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to duplicate project"
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        type: "error",
      })
    } finally {
      setDuplicatingProject(null)
    }
  }

  function getHealthColor(score: number) {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  function getHealthLabel(score: number) {
    if (score >= 80) return "Excellent"
    if (score >= 50) return "Good"
    return "Needs Attention"
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
        body: JSON.stringify({ 
          name: newProjectName,
          folder_id: newProjectFolderId || undefined
        }),
      })
      
      const project = await res.json()
      
      if (!res.ok) {
        throw new Error(project.error || "Failed to create project")
      }
      
      // Add new project to list and reload
      await loadDashboardData()
      await loadFolders() // Reload folders in case folder was just created
      setNewProjectName("")
      setNewProjectFolderId("")
      setShowNewProjectModal(false)
      
      // Navigate to project overview
      router.push(`/project/${project.id}/overview`)
    } catch (error) {
      console.error("Failed to create project:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create project"
      setCreateError(errorMessage)
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
      
      // Close confirmation modal
      setDeleteConfirmModal({ isOpen: false, projectId: null, projectName: "" })
      
      // Show success message
      setAlertModal({
        isOpen: true,
        title: "Project Deleted",
        message: "The project has been successfully deleted.",
        type: "success",
      })
      
      // Reload dashboard data to reflect the deletion
      await loadDashboardData()
    } catch (error) {
      console.error("Failed to delete project:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete project"
      setDeleteConfirmModal({ isOpen: false, projectId: null, projectName: "" })
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        type: "error",
      })
    }
  }

  const formatDate = useCallback((dateString: string) => {
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
  }, [])

  const getToolUrl = useCallback((toolId: string) => {
    return `/tools/${toolId}`
  }, [])

  const getToolIcon = useCallback((toolId: string) => {
    const iconMap: Record<string, any> = {
      "idea-discovery": Lightbulb,
      "business-plan-generator": FileText,
      "business-model-generator": BarChart3,
      "valuation-calculator": TrendingUp,
    }
    return iconMap[toolId] || FileText
  }, [])

  const getStatusColor = useCallback((status: string) => {
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
  }, [])

  const getStatusIcon = useCallback((status: string) => {
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
  }, [])

  // Memoize filtered projects to avoid recalculating on every render
  const filteredProjects = useMemo(() => {
    let filtered = projects
    
    // Filter by folder
    if (selectedFolderId && selectedFolderId !== "all") {
      if (selectedFolderId === "none") {
        filtered = filtered.filter((project: any) => !project.folder_id && !project.folder)
      } else {
        filtered = filtered.filter((project: any) => 
          project.folder_id === selectedFolderId || project.folder?.id === selectedFolderId
        )
      }
    }
    
    if (debouncedSearchQuery.trim()) {
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }
    
    return filtered
  }, [projects, debouncedSearchQuery, statusFilter, selectedFolderId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Quick Actions Skeleton */}
          <div className="mt-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
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
              <div className="flex gap-2">
                <Link href="/analytics">
                  <Button variant="outline" size="sm">
                    Analytics
                  </Button>
                </Link>
                <Link href="/history">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>

            {recentOutputs.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tool outputs yet</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                  Start using tools to generate outputs that will appear here for easy access
                </p>
                <Link href="/tools">
                  <Button className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700">
                    Explore Tools
                  </Button>
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
              <div className="flex gap-2 flex-wrap">
                <Tooltip content="Start from a template">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTemplatesModal(true)}
                    aria-label="Start from template"
                  >
                    <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                    Templates
                  </Button>
                </Tooltip>
                <Tooltip content="Create a new project to get started">
                  <Button 
                    id="new-project-button"
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      await loadFolders() // Reload folders before opening modal
                      setShowNewProjectModal(true)
                    }}
                    aria-label="Create new project"
                  >
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    New Project
                  </Button>
                </Tooltip>
                <ProjectFolders />
                <ProjectReminders />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search projects... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-gray-200 focus:border-gray-900"
                    aria-label="Search projects"
                    onKeyDown={(e) => {
                      // Cmd+K or Ctrl+K to focus search
                      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                        e.preventDefault()
                        e.currentTarget.focus()
                      }
                    }}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Folder
                      </label>
                      <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="all">All Folders</option>
                        <option value="none">No Folder</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {projects.length === 0 ? (
              <ProjectEmptyState
                type="no-projects"
                onCreateProject={async () => {
                  await loadFolders()
                  setShowNewProjectModal(true)
                }}
                onViewTemplates={() => setShowTemplatesModal(true)}
              />
            ) : filteredProjects.length === 0 ? (
              <ProjectEmptyState
                type="no-results"
                searchQuery={searchQuery}
                onClearFilters={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setSelectedFolderId("all")
                }}
              />
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                {filteredProjects.slice(0, 10).map((project: any) => {
                  // Calculate completion percentage from health score data
                  // Health score API provides completion info, use that as proxy
                  const healthData = projectHealthScores[project.id]
                  const completionPercentage = healthData?.score || 0 // Use health score as completion proxy for now
                  
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      healthScore={projectHealthScores[project.id]?.score}
                      nextStep={projectHealthScores[project.id]?.nextStep}
                      completionPercentage={completionPercentage}
                      viewMode={viewMode}
                      onEdit={(id) => {
                        // TODO: Implement edit functionality
                        console.log("Edit project", id)
                      }}
                      onDuplicate={(id) => handleDuplicateProject(id, project.name)}
                      onArchive={(id) => {
                        // TODO: Implement archive functionality
                        console.log("Archive project", id)
                      }}
                      onDelete={(id) => {
                        setDeleteConfirmModal({
                          isOpen: true,
                          projectId: id,
                          projectName: project.name,
                        })
                      }}
                      formatDate={formatDate}
                    />
                  )
                })}
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

        {/* Journey Map */}
        <div className="mt-8 mb-8">
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
      </div>

      {/* Templates Modal */}
      <ProjectTemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
      />

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
                  setNewProjectFolderId("")
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

              {folders.length > 0 && (
                <div>
                  <label htmlFor="projectFolder" className="block text-sm font-semibold text-gray-900 mb-2">
                    Folder (Optional)
                  </label>
                  <select
                    id="projectFolder"
                    value={newProjectFolderId}
                    onChange={(e) => setNewProjectFolderId(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                  >
                    <option value="">No Folder</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Organize your project by assigning it to a folder
                  </p>
                </div>
              )}

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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, projectId: null, projectName: "" })}
        onConfirm={() => {
          if (deleteConfirmModal.projectId) {
            handleDeleteProject(deleteConfirmModal.projectId)
          }
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirmModal.projectName}"? This action cannot be undone and will delete all associated data.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
      />

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
