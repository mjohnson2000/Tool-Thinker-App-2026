"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FRAMEWORK_ORDER, getFramework } from "@/lib/frameworks"
import { JourneyMap } from "@/components/JourneyMap"
import { TeamMembers } from "@/components/TeamMembers"
import { 
  CheckCircle2, 
  Rocket, 
  Download, 
  Sparkles, 
  Presentation, 
  FileCheck, 
  Megaphone, 
  ArrowRight,
  FileText,
  Tag,
  Plus,
  X,
  Edit2,
  Trash2,
  Pin,
  Play,
  Pause,
  Archive,
  Lock,
  ChevronDown,
  Link2,
  Activity,
  Clock,
  Target,
  Share2,
  Copy
} from "lucide-react"
import type { ProjectNote, ProjectTag } from "@/types/project"

interface StepStatus {
  stepKey: string
  status: string
  title: string
}

export default function ProjectOverviewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.projectId as string
  const [project, setProject] = useState<any>(null)
  const [steps, setSteps] = useState<StepStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [tags, setTags] = useState<ProjectTag[]>([])
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isGeneratingShare, setIsGeneratingShare] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newNote, setNewNote] = useState({
    note_text: "",
    note_type: "general" as const,
    is_pinned: false,
  })
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteFilter, setNoteFilter] = useState<string>("all")
  const [linkedTools, setLinkedTools] = useState<any[]>([])
  const [validationData, setValidationData] = useState({
    interviews: 0,
    assumptions: 0,
    validatedAssumptions: 0,
  })
  const [activity, setActivity] = useState<any[]>([])
  const [healthScore, setHealthScore] = useState<number | null>(null)

  useEffect(() => {
    if (projectId && user) {
      loadProject()
    }
  }, [projectId, user])

  // Calculate health score when data changes
  useEffect(() => {
    if (steps.length > 0 && project) {
      const score = calculateHealthScore(steps, project, linkedTools, validationData, notes)
      setHealthScore(score)
    }
  }, [steps, project, linkedTools, validationData, notes])

  async function loadProject() {
    if (!user) return
    
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
      }

      // Load project with tags and notes
      const projectRes = await fetch(`/api/projects/${projectId}`, { headers })
      let projectData: any = null
      if (projectRes.ok) {
        projectData = await projectRes.json()
        setProject(projectData)
        setTags(projectData.tags || [])
        setNotes(projectData.notes || [])
      }

      // Load tags separately if not included in project response
      try {
        if (!projectData?.tags || projectData.tags.length === 0) {
          const tagsRes = await fetch(`/api/projects/${projectId}/tags`, { headers })
          if (tagsRes.ok) {
            const tagsData = await tagsRes.json()
            setTags(tagsData.tags || [])
          }
        }
      } catch (error) {
        // Tags table might not exist yet
        console.log("Tags not available:", error)
      }

      // Load notes separately if not included in project response
      try {
        if (!projectData?.notes || projectData.notes.length === 0) {
          const notesRes = await fetch(`/api/projects/${projectId}/notes`, { headers })
          if (notesRes.ok) {
            const notesData = await notesRes.json()
            setNotes(notesData.notes || [])
          }
        }
      } catch (error) {
        // Notes table might not exist yet
        console.log("Notes not available:", error)
      }

      // Load linked tool outputs
      const toolsRes = await fetch(`/api/projects/${projectId}/tool-outputs`, { headers })
      if (toolsRes.ok) {
        const toolsData = await toolsRes.json()
        setLinkedTools(toolsData.references || [])
      }

      // Load step statuses FIRST (needed for activity and other calculations)
      const stepStatuses: StepStatus[] = []
      for (const stepKey of FRAMEWORK_ORDER) {
        try {
          const stepRes = await fetch(`/api/steps?projectId=${projectId}&stepKey=${stepKey}`)
          if (stepRes.ok) {
            const stepData = await stepRes.json()
            const framework = getFramework(stepKey)
            stepStatuses.push({
              stepKey,
              status: stepData.step?.status || "not_started",
              title: framework?.title || stepKey,
            })
          } else {
            const framework = getFramework(stepKey)
            stepStatuses.push({
              stepKey,
              status: "not_started",
              title: framework?.title || stepKey,
            })
          }
        } catch (error) {
          // Ignore errors, add as not_started
          const framework = getFramework(stepKey)
          stepStatuses.push({
            stepKey,
            status: "not_started",
            title: framework?.title || stepKey,
          })
        }
      }
      setSteps(stepStatuses)

      // Load validation data
      try {
        const validationRes = await fetch(`/api/customer-validation/interviews?projectId=${projectId}`, { headers })
        if (validationRes.ok) {
          const validationDataRes = await validationRes.json()
          const interviews = validationDataRes.interviews || []
          
          const assumptionsRes = await fetch(`/api/customer-validation/assumptions?projectId=${projectId}`, { headers })
          let assumptions: any[] = []
          if (assumptionsRes.ok) {
            const assumptionsData = await assumptionsRes.json()
            assumptions = assumptionsData.assumptions || []
          }
          
          setValidationData({
            interviews: interviews.length,
            assumptions: assumptions.length,
            validatedAssumptions: assumptions.filter((a: any) => a.validation_status === 'validated').length,
          })
        }
      } catch (error) {
        // Validation tracker might not be set up yet
        console.log("Validation data not available")
      }

      // Load activity - we'll create this from project data for now
      // Activity will be derived from project updates, step completions, etc.
      const recentActivity: any[] = []
      
      // Add step completions as activity (now stepStatuses is available)
      stepStatuses.forEach(step => {
        if (step.status === "completed") {
          recentActivity.push({
            event_type: "step_completed",
            payload: { stepKey: step.stepKey },
            created_at: new Date().toISOString(), // Would come from step data
          })
        }
      })
      
      // Add notes as activity
      if (projectData?.notes) {
        projectData.notes.slice(0, 3).forEach((note: any) => {
          recentActivity.push({
            event_type: "note_added",
            payload: { noteId: note.id },
            created_at: note.created_at,
          })
        })
      }
      
      // Add tool links as activity
      if (linkedTools.length > 0) {
        linkedTools.slice(0, 3).forEach((tool: any) => {
          recentActivity.push({
            event_type: "tool_linked",
            payload: { toolName: tool.tool_name },
            created_at: tool.created_at || new Date().toISOString(),
          })
        })
      }
      
      // Sort by date, most recent first
      recentActivity.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setActivity(recentActivity.slice(0, 10))
      
      // Check if project is complete and show celebration
      const allCompleted = stepStatuses.every(s => s.status === "completed")
      if (allCompleted && stepStatuses.length > 0) {
        setShowCompletionModal(true)
      }
    } catch (error) {
      console.error("Failed to load project:", error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  function getNextStep() {
    return steps.find((s) => s.status === "not_started") || steps[0]
  }

  async function handleExport(format: "markdown" | "word" = "markdown") {
    try {
      const endpoint = format === "word" ? "/api/export/word" : "/api/export"
      const res = await fetch(`${endpoint}?projectId=${projectId}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const extension = format === "word" ? "doc" : "md"
      a.download = `${project?.name || "startup"}-brief.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setShowExportModal(false)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export. Please try again.")
    }
  }

  async function handleGenerateShareLink() {
    if (!user) {
      alert("Please sign in to generate a share link")
      return
    }

    setIsGeneratingShare(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert("Please sign in to generate a share link")
        return
      }

      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error("Failed to generate share link")
      }

      const data = await res.json()
      setShareUrl(data.shareUrl)
    } catch (error) {
      console.error("Failed to generate share link:", error)
      alert("Failed to generate share link. Please try again.")
    } finally {
      setIsGeneratingShare(false)
    }
  }

  function handleCopyShareLink() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      alert("Share link copied to clipboard!")
    }
  }

  function handleExportToGoogleDocs() {
    // Export as Word format which can be imported to Google Docs
    handleExport("word")
    // Show instructions
    setTimeout(() => {
      alert("File downloaded! To import to Google Docs:\n1. Go to Google Docs\n2. File > Open > Upload\n3. Select the downloaded .doc file")
    }, 500)
  }

  async function handleDeleteProject() {
    if (!user || !project) return
    
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone and will delete all associated data.`)) {
      return
    }

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
      
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Failed to delete project:", error)
      alert(error.message || "Failed to delete project")
    }
  }

  async function updateProjectStatus(newStatus: string) {
    if (!user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const updated = await res.json()
        setProject(updated)
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  async function addTag() {
    if (!newTag.trim() || !user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tag: newTag.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setTags([...tags, data.tag])
        setNewTag("")
        setShowTagInput(false)
      }
    } catch (error) {
      console.error("Failed to add tag:", error)
    }
  }

  async function removeTag(tagId: string) {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/tags/${tagId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        setTags(tags.filter(t => t.id !== tagId))
      }
    } catch (error) {
      console.error("Failed to remove tag:", error)
    }
  }

  async function createNote() {
    if (!newNote.note_text.trim() || !user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert("Please sign in to add notes")
        return
      }

      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newNote),
      })

      const data = await res.json()

      if (res.ok) {
        setNotes([data.note, ...notes])
        setNewNote({ note_text: "", note_type: "general", is_pinned: false })
        setShowNewNoteModal(false)
      } else {
        // Show user-friendly error message
        const errorMsg = data.error || "Failed to create note"
        if (errorMsg.includes("table") || errorMsg.includes("project_notes")) {
          alert("Notes feature is not set up yet. Please run the database migration: lib/supabase/schema-project-enhancements.sql in your Supabase SQL editor.")
        } else {
          alert(`Failed to create note: ${errorMsg}`)
        }
        console.error("Failed to create note:", data)
      }
    } catch (error) {
      console.error("Failed to create note:", error)
      alert("Failed to create note. Please check your connection and try again.")
    }
  }

  async function deleteNote(noteId: string) {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId))
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
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

  function getNoteTypeColor(type: string) {
    switch (type) {
      case "decision":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "learning":
        return "bg-green-50 text-green-700 border-green-200"
      case "todo":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "issue":
        return "bg-red-50 text-red-700 border-red-200"
      case "insight":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  function calculateHealthScore(
    stepStatuses: StepStatus[],
    project: any,
    linkedTools: any[],
    validation: any,
    notes: ProjectNote[]
  ): number {
    // Step Completion (40%)
    const completedSteps = stepStatuses.filter(s => s.status === "completed").length
    const totalSteps = stepStatuses.length
    const stepScore = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

    // Data Quality (30%)
    let dataQualityScore = 0
    if (completedSteps > 0) dataQualityScore += 30 // Steps completed
    if (linkedTools.length > 0) dataQualityScore += 20 // Tools linked
    if (notes.length > 0) dataQualityScore += 20 // Notes added
    if (project?.description) dataQualityScore += 10 // Description added
    if (tags.length > 0) dataQualityScore += 20 // Tags added

    // Validation Status (20%)
    let validationScore = 0
    if (validation.interviews > 0) validationScore += 10
    if (validation.assumptions > 0) validationScore += 10
    if (validation.validatedAssumptions > 0) {
      validationScore += (validation.validatedAssumptions / Math.max(validation.assumptions, 1)) * 10
    }

    // Recent Activity (10%)
    const daysSinceUpdate = project?.updated_at 
      ? Math.floor((Date.now() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999
    const activityScore = daysSinceUpdate <= 7 ? 10 : daysSinceUpdate <= 30 ? 5 : 0

    // Weighted calculation
    const healthScore = 
      (stepScore * 0.4) +
      (dataQualityScore * 0.3) +
      (validationScore * 0.2) +
      (activityScore * 0.1)

    return Math.round(healthScore)
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

  function formatActivityDate(dateString: string) {
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

  function getActivityIcon(eventType: string) {
    switch (eventType) {
      case "step_completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "step_started":
        return <Play className="w-4 h-4 text-blue-600" />
      case "tool_linked":
        return <Tag className="w-4 h-4 text-purple-600" />
      case "note_added":
        return <FileText className="w-4 h-4 text-gray-600" />
      case "status_changed":
        return <Archive className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  function getActivityLabel(eventType: string, payload: any) {
    switch (eventType) {
      case "step_completed":
        return `Completed: ${payload.stepKey || "step"}`
      case "step_started":
        return `Started: ${payload.stepKey || "step"}`
      case "tool_linked":
        return `Linked: ${payload.toolName || "tool"}`
      case "note_added":
        return "Added note"
      case "status_changed":
        return `Status: ${payload.status || "changed"}`
      case "project_created":
        return "Project created"
      default:
        return eventType.replace(/_/g, " ")
    }
  }

  function getDaysSinceUpdate() {
    if (!project?.updated_at) return 0
    const diffMs = Date.now() - new Date(project.updated_at).getTime()
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }

  function getDaysActive() {
    if (!project?.created_at) return 0
    const diffMs = Date.now() - new Date(project.created_at).getTime()
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const nextStep = getNextStep()
  const completedCount = steps.filter((s) => s.status === "completed").length
  const progress = (completedCount / steps.length) * 100
  const isComplete = completedCount === steps.length && steps.length > 0
  const fromDiscovery = searchParams.get("fromDiscovery") === "true"
  const hasStarted = steps.some(s => s.status !== "not_started")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Export Your Plan</h2>
              <button
                onClick={() => {
                  setShowExportModal(false)
                  setShareUrl(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Markdown Export */}
              <button
                onClick={() => handleExport("markdown")}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Markdown (.md)</div>
                  <div className="text-sm text-gray-600">Plain text format, great for version control</div>
                </div>
                <Download className="w-5 h-5 text-gray-400" />
              </button>

              {/* Word Export */}
              <button
                onClick={() => handleExport("word")}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Word Document (.doc)</div>
                  <div className="text-sm text-gray-600">Formatted document, opens in Microsoft Word</div>
                </div>
                <Download className="w-5 h-5 text-gray-400" />
              </button>

              {/* Google Docs Export */}
              <button
                onClick={handleExportToGoogleDocs}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Google Docs</div>
                  <div className="text-sm text-gray-600">Download Word file, then import to Google Docs</div>
                </div>
                <Download className="w-5 h-5 text-gray-400" />
              </button>

              {/* Share Link */}
              <div className="w-full p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Share Link</div>
                    <div className="text-sm text-gray-600">Create a shareable link to view your plan</div>
                  </div>
                </div>
                
                {!shareUrl ? (
                  <Button
                    onClick={handleGenerateShareLink}
                    disabled={isGeneratingShare}
                    variant="outline"
                    className="w-full"
                  >
                    {isGeneratingShare ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        Generate Share Link
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                      />
                      <button
                        onClick={handleCopyShareLink}
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Link expires in 30 days. Anyone with this link can view your plan (read-only).
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                setShowExportModal(false)
                setShareUrl(null)
              }}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Completion Celebration Modal */}
      {showCompletionModal && isComplete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Project Complete!
              </h2>
              <p className="text-gray-600">
                You've completed all {steps.length} steps. Your startup plan is ready!
              </p>
            </div>
            
            {/* What's Next Options */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What would you like to do next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <Link 
                  href={`/tools/pitch-deck-generator?projectId=${projectId}`}
                  onClick={() => setShowCompletionModal(false)}
                  className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 p-4 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Presentation className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Create Pitch Deck</div>
                      <div className="text-xs text-gray-600">For investors</div>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  href={`/tools/business-plan-generator?projectId=${projectId}`}
                  onClick={() => setShowCompletionModal(false)}
                  className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-purple-600" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Business Plan</div>
                      <div className="text-xs text-gray-600">Full document</div>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  href={`/tools/marketing-blueprint?projectId=${projectId}`}
                  onClick={() => setShowCompletionModal(false)}
                  className="group bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border-2 border-pink-200 p-4 hover:border-pink-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-6 h-6 text-pink-600" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Marketing System</div>
                      <div className="text-xs text-gray-600">Ads & strategy</div>
                    </div>
                  </div>
                </Link>
                
                <button
                  onClick={handleExport}
                  className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 p-4 hover:border-gray-400 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-6 h-6 text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Export Plan</div>
                      <div className="text-xs text-gray-600">Download markdown</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setShowCompletionModal(false)} 
                variant="outline" 
                className="w-full"
              >
                Continue Editing
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome message from Discovery */}
        {fromDiscovery && !hasStarted && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Great! Your project is ready 🚀
                </h3>
                <p className="text-gray-600 mb-4">
                  We've pre-filled your first step (Jobs To Be Done) with the data from your idea discovery. 
                  Click below to start working on it!
                </p>
                {nextStep && (
                  <Link href={`/project/${projectId}/step/${nextStep.stepKey}`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Rocket className="w-4 h-4 mr-2" />
                      Start First Step: {nextStep.title}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completion Banner */}
        {isComplete && !showCompletionModal && (
          <>
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    🎉 Project Complete!
                  </h3>
                  <p className="text-gray-600 mb-3">
                    You've completed all steps. Export your plan or continue refining.
                  </p>
                  <Button 
                    onClick={handleExport} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Complete Plan
                  </Button>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="mb-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">What's Next?</h2>
              </div>
              <p className="text-gray-700 mb-6">
                Your startup plan is complete! Here are your next steps to turn your idea into reality:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pitch Deck */}
                <Link 
                  href={`/tools/pitch-deck-generator?projectId=${projectId}`}
                  className="group bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Presentation className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Create Pitch Deck</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Generate an investor-ready pitch deck using your project data
                      </p>
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        Get Started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Business Plan */}
                <Link 
                  href={`/tools/business-plan-generator?projectId=${projectId}`}
                  className="group bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Generate Business Plan</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Create a comprehensive business plan document
                      </p>
                      <div className="flex items-center text-purple-600 text-sm font-medium">
                        Get Started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Marketing Blueprint */}
                <Link 
                  href={`/tools/marketing-blueprint?projectId=${projectId}`}
                  className="group bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-pink-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Build Marketing System</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Create a complete marketing blueprint and ad campaigns
                      </p>
                      <div className="flex items-center text-pink-600 text-sm font-medium">
                        Get Started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Share & Export */}
                <div className="group bg-white rounded-lg border-2 border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Export Plan</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Export your plan to share with team members or investors
                      </p>
                      <Button 
                        onClick={handleExport}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {project?.name || "Project"}
                </h1>
                {project?.status && (
                  <div className="relative group">
                    <select
                      value={project.status}
                      onChange={(e) => updateProjectStatus(e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer appearance-none pr-8 ${getStatusColor(project.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="review">Review</option>
                      <option value="complete">Complete</option>
                      <option value="archived">Archived</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
                  </div>
                )}
                <button
                  onClick={handleDeleteProject}
                  className="ml-auto p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  title="Delete project"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-2">Startup planning progress</p>
              
              {/* Journey Map */}
              <div className="mb-6">
                <JourneyMap 
                  currentStage={isComplete ? "documentation" : "planning"}
                  completedStages={isComplete ? ["discovery", "planning"] : ["discovery"]}
                  projectId={projectId}
                  variant="compact"
                  showActions={true}
                />
              </div>
              
              {/* Prominent Get Started Section for New Projects */}
              {!isComplete && (
                <>
                  {nextStep && !hasStarted ? (
                    <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 border-2 border-blue-400 shadow-lg animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                          <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Ready to Build Your Startup Plan?
                          </h2>
                          <p className="text-blue-50 mb-4 text-lg">
                            Start with <strong className="text-white">{nextStep.title}</strong> - the first step in creating your comprehensive startup plan.
                          </p>
                          <Link href={`/project/${projectId}/step/${nextStep.stepKey}`}>
                            <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform">
                              <Rocket className="w-5 h-5 mr-2" />
                              Start: {nextStep.title}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : nextStep && hasStarted ? (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Rocket className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">
                          Continue Your Work
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Continue with the next step: <strong>{nextStep.title}</strong>
                      </p>
                      <Link href={`/project/${projectId}/step/${nextStep.stepKey}`}>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                          <Rocket className="w-4 h-4 mr-2" />
                          Continue: {nextStep.title}
                        </Button>
                      </Link>
                    </div>
                  ) : steps.length > 0 ? (
                    <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Rocket className="w-6 h-6 text-yellow-600" />
                        <h2 className="text-xl font-bold text-gray-900">
                          Get Started
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Click on any step below to begin working on your startup plan.
                      </p>
                      <Link href={`/project/${projectId}/step/${steps[0].stepKey}`}>
                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                          <Rocket className="w-4 h-4 mr-2" />
                          Start: {steps[0].title}
                        </Button>
                      </Link>
                    </div>
                  ) : null}
                </>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      <Tag className="w-3 h-3" />
                      {tag.tag}
                      <button
                        onClick={() => removeTag(tag.id)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {!showTagInput ? (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add tag
                </button>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name"
                    className="text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addTag()
                      }
                    }}
                    autoFocus
                  />
                  <Button onClick={addTag} size="sm">Add</Button>
                  <Button onClick={() => {
                    setShowTagInput(false)
                    setNewTag("")
                  }} variant="outline" size="sm">Cancel</Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline">
                Export Brief
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Header: Health Score & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Health Score Card */}
            {healthScore !== null && (
              <div className={`rounded-lg border-2 p-6 ${getHealthColor(healthScore)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Project Health</span>
                  <span className="text-xs font-medium">{getHealthLabel(healthScore)}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">{healthScore}</span>
                  <span className="text-lg text-gray-600 mb-1">/100</span>
                </div>
                <div className="mt-3 w-full bg-white/50 rounded-full h-2">
                  <div
                    className="bg-current h-2 rounded-full transition-all"
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
            )}

            {/* Steps Progress Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Steps</span>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">{completedCount}</span>
                <span className="text-lg text-gray-600 mb-1">/ {steps.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Tools Linked Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Tools Linked</span>
                <Link2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{linkedTools.length}</span>
                <span className="text-lg text-gray-600 mb-1">tools</span>
              </div>
              {linkedTools.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {linkedTools.slice(0, 2).map((t: any) => t.tool_name).join(", ")}
                  {linkedTools.length > 2 && ` +${linkedTools.length - 2} more`}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Notes Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Notes</span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{notes.length}</span>
                <span className="text-lg text-gray-600 mb-1">notes</span>
              </div>
            </div>

            {/* Validation Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Validation</span>
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interviews</span>
                  <span className="text-lg font-bold text-gray-900">{validationData.interviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assumptions</span>
                  <span className="text-lg font-bold text-gray-900">
                    {validationData.validatedAssumptions}/{validationData.assumptions}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Activity</span>
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getDaysSinceUpdate() === 0 ? "Today" : `${getDaysSinceUpdate()}d ago`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active for</span>
                  <span className="text-sm font-medium text-gray-900">{getDaysActive()} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {completedCount} of {steps.length} steps
              </span>
              <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Team Collaboration Section */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-6">
            <TeamMembers 
              projectId={projectId} 
              isOwner={project && user ? String(project.user_id) === String(user.id) : false} 
            />
          </div>

          {/* Recent Activity Feed */}
          {activity.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="space-y-3">
                {activity.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5">
                      {getActivityIcon(item.event_type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{getActivityLabel(item.event_type, item.payload || {})}</p>
                      <p className="text-xs text-gray-500">{formatActivityDate(item.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {nextStep && !isComplete && (
                <Link href={`/project/${projectId}/step/${nextStep.stepKey}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Rocket className="w-4 h-4 mr-2" />
                    Continue Step
                  </Button>
                </Link>
              )}
              <Button onClick={() => setShowNewNoteModal(true)} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
              <Link href={`/tools/customer-validation-tracker?projectId=${projectId}`}>
                <Button variant="outline" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Validate
                </Button>
              </Link>
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Linked Tools Panel */}
        {linkedTools.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Linked Tools ({linkedTools.length})</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {linkedTools.slice(0, 4).map((tool: any) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{tool.tool_name}</p>
                    {tool.step_id && (
                      <p className="text-xs text-gray-500">Linked to step</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {linkedTools.length > 4 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                +{linkedTools.length - 4} more tools linked
              </p>
            )}
          </div>
        )}

        {/* Locked Step Warning */}
        {searchParams.get("locked") === "true" && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Step Locked
                </h3>
                <p className="text-sm text-yellow-800">
                  You need to complete <strong>{decodeURIComponent(searchParams.get("requiredName") || "the previous step")}</strong> before accessing this step.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            // Check if step is locked (previous step not completed)
            const isLocked = index > 0 && steps[index - 1]?.status !== "completed"
            const stepFramework = getFramework(step.stepKey)
            
            return (
              <div
                key={step.stepKey}
                className={`block bg-white rounded-lg border p-6 transition ${
                  isLocked
                    ? "border-gray-200 opacity-60 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer"
                }`}
                onClick={() => {
                  if (!isLocked) {
                    router.push(`/project/${projectId}/step/${step.stepKey}`)
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isLocked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                          {index + 1}
                        </span>
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isLocked ? "text-gray-500" : "text-gray-900"}`}>
                          {step.title}
                        </h3>
                        {isLocked && (
                          <p className="text-xs text-gray-500 mt-1">
                            Complete "{steps[index - 1]?.title}" first
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      step.status
                    )}`}
                  >
                    {step.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {nextStep && !isComplete && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">
                {hasStarted ? "Continue Your Work" : "Get Started"}
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              {hasStarted 
                ? `Continue with the next step: ${nextStep.title}`
                : `Start by working on: ${nextStep.title}. This step will help you understand your customer's problem deeply.`
              }
            </p>
            <Link href={`/project/${projectId}/step/${nextStep.stepKey}`}>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Rocket className="w-4 h-4 mr-2" />
                {hasStarted ? `Continue: ${nextStep.title}` : `Start: ${nextStep.title}`}
              </Button>
            </Link>
          </div>
        )}

        {/* Helper Tools Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xl">💡</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Need Help with a Step?</h2>
              <p className="text-sm text-gray-600">Each step has recommended tools to help you get the data you need</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            When you open a project step, you'll see a "Helper Tools" section with recommended calculators and generators 
            that can provide data and insights for that specific step. These tools are contextually suggested based on 
            what you're working on.
          </p>
          {nextStep && (
            <Link href={`/project/${projectId}/step/${nextStep.stepKey}`}>
              <Button variant="outline" className="w-full">
                View Helper Tools for {nextStep.title} →
              </Button>
            </Link>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Project Notes</h2>
            </div>
            <Button onClick={() => setShowNewNoteModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>

          {/* Note Filter */}
          <div className="mb-4">
            <select
              value={noteFilter}
              onChange={(e) => setNoteFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Notes</option>
              <option value="general">General</option>
              <option value="decision">Decisions</option>
              <option value="learning">Learnings</option>
              <option value="todo">Todos</option>
              <option value="issue">Issues</option>
              <option value="insight">Insights</option>
            </select>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-2">No notes yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Capture your thoughts, decisions, and learnings as you work on this project
              </p>
              <Button onClick={() => setShowNewNoteModal(true)} variant="outline">
                Add Your First Note
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes
                .filter(note => noteFilter === "all" || note.note_type === noteFilter)
                .map((note) => (
                  <div
                    key={note.id}
                    className={`border rounded-lg p-4 ${note.is_pinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {note.is_pinned && <Pin className="w-4 h-4 text-blue-600" />}
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getNoteTypeColor(note.note_type)}`}>
                          {note.note_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{note.note_text}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Note</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Type
                </label>
                <select
                  value={newNote.note_type}
                  onChange={(e) => setNewNote({ ...newNote, note_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="general">General</option>
                  <option value="decision">Decision</option>
                  <option value="learning">Learning</option>
                  <option value="todo">Todo</option>
                  <option value="issue">Issue</option>
                  <option value="insight">Insight</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note *
                </label>
                <Textarea
                  value={newNote.note_text}
                  onChange={(e) => setNewNote({ ...newNote, note_text: e.target.value })}
                  rows={6}
                  placeholder="Write your note here..."
                  className="resize-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-note"
                  checked={newNote.is_pinned}
                  onChange={(e) => setNewNote({ ...newNote, is_pinned: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="pin-note" className="text-sm text-gray-700">
                  Pin this note
                </label>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button onClick={createNote} className="flex-1" disabled={!newNote.note_text.trim()}>
                Add Note
              </Button>
              <Button
                onClick={() => {
                  setShowNewNoteModal(false)
                  setNewNote({ note_text: "", note_type: "general", is_pinned: false })
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
