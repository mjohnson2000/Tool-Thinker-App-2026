"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AlertModal } from "@/components/ui/modal"

interface Template {
  id: string
  name: string
  description: string
  icon: string
  category: string
}

interface ProjectTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectTemplatesModal({ isOpen, onClose }: ProjectTemplatesModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
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
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  async function loadTemplates() {
    setLoading(true)
    try {
      const res = await fetch("/api/projects/templates")
      const data = await res.json()
      if (res.ok) {
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Failed to load templates:", error)
    } finally {
      setLoading(false)
    }
  }

  async function createFromTemplate(templateId: string) {
    if (!user || !templateId) return

    setIsCreating(true)
    try {
      // Get fresh session (this will auto-refresh if needed)
      let { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // If session is expired or missing, try to refresh
      if (sessionError || !session?.access_token) {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !refreshedSession?.access_token) {
          throw new Error("Your session has expired. Please sign in again.")
        }
        session = refreshedSession
      }

      const name = projectName.trim() || templates.find(t => t.id === templateId)?.name || "New Project"

      const res = await fetch("/api/projects/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          templateId,
          projectName: name,
        }),
      })

      let data
      try {
        data = await res.json()
      } catch (parseError) {
        console.error("Failed to parse response:", parseError)
        throw new Error("Invalid response from server. Please try again.")
      }

      if (!res.ok) {
        // If JWT expired error, try refreshing and retrying once
        if ((data?.error?.includes("JWT") || data?.error?.includes("expired") || res.status === 401) && session?.refresh_token) {
          // Refresh session and retry
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
          if (!refreshError && refreshedSession?.access_token) {
            const retryRes = await fetch("/api/projects/templates", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${refreshedSession.access_token}`,
              },
              body: JSON.stringify({
                templateId,
                projectName: name,
              }),
            })
            let retryData
            try {
              retryData = await retryRes.json()
            } catch (parseError) {
              console.error("Failed to parse retry response:", parseError)
              throw new Error("Invalid response from server. Please try again.")
            }
            
            if (!retryRes.ok) {
              throw new Error(retryData?.error || "Failed to create project from template")
            }
            
            if (!retryData?.project || !retryData.project.id) {
              throw new Error("Project was created but no project data was returned")
            }
            // Success on retry - continue with success flow
            if (!retryData.project || !retryData.project.id) {
              throw new Error("Project was created but no project data was returned")
            }
            
            // Show success message briefly, then navigate
            setAlertModal({
              isOpen: true,
              title: "Project Created",
              message: `"${retryData.project.name}" has been created successfully. Redirecting...`,
              type: "success",
            })
            
            console.log("Project created successfully on retry:", retryData.project.id)
            
            // Wait a moment for user to see success, then navigate
            // Give database a moment to fully save the project
            setTimeout(() => {
              // Navigate first, then close modal after a brief delay
              router.replace(`/project/${retryData.project.id}/overview`)
              // Close modal after navigation is initiated
              setTimeout(() => {
                onClose()
              }, 100)
            }, 1200)
            return
          }
        }
        throw new Error(data.error || "Failed to create project from template")
      }

      // Success - navigate to project
      if (!data || !data.project || !data.project.id) {
        console.error("Invalid project data received:", data)
        throw new Error("Project was created but no project data was returned. Please refresh and try again.")
      }

      console.log("Project created successfully:", data.project.id, data.project)
      
      // Verify project has required fields
      if (!data.project.name) {
        console.warn("Project created but missing name field:", data.project)
      }

      // Show success message briefly, then navigate
      setAlertModal({
        isOpen: true,
        title: "Project Created",
        message: `"${data.project.name}" has been created successfully. Redirecting...`,
        type: "success",
      })

      // Wait a moment for user to see success, then navigate
      // Give database a moment to fully save the project
      setTimeout(() => {
        // Navigate first, then close modal after a brief delay
        router.replace(`/project/${data.project.id}/overview`)
        // Close modal after navigation is initiated
        setTimeout(() => {
          onClose()
        }, 100)
      }, 1200)
    } catch (error) {
      console.error("Failed to create project from template:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create project from template"
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        type: "error",
      })
      // Don't close the modal on error - let user try again
    } finally {
      setIsCreating(false)
    }
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setProjectName(template.name)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Start from Template"
        size="lg"
      >
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                Choose a template to get started quickly. Templates include pre-filled data to help you begin.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedTemplate === template.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{template.name}</h3>
                          {selectedTemplate === template.id && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Project Name
                    </label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="border-2 border-gray-200 focus:border-gray-900"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => createFromTemplate(selectedTemplate)}
                      disabled={isCreating || !projectName.trim()}
                      className="flex-1"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Create Project
                        </>
                      )}
                    </Button>
                    <Button onClick={onClose} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!selectedTemplate && (
                <div className="text-center py-4 text-sm text-gray-500">
                  Select a template to continue
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </>
  )
}

