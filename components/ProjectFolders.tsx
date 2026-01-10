"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { FolderPlus, Folder, X, Loader2, Edit2, Trash2, Check, Package, Eye, ExternalLink } from "lucide-react"
import { AlertModal, ConfirmationModal } from "@/components/ui/modal"
import Link from "next/link"

interface Folder {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
  project_count?: number
}

interface ProjectFoldersProps {
  projectId?: string
  onFolderSelect?: (folderId: string | null) => void
}

export function ProjectFolders({ projectId, onFolderSelect }: ProjectFoldersProps) {
  const { user } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [loading, setLoading] = useState(true)
  const [foldersAvailable, setFoldersAvailable] = useState(true)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean
    folderId: string | null
    folderName: string
  }>({
    isOpen: false,
    folderId: null,
    folderName: "",
  })
  const [currentProjectFolderId, setCurrentProjectFolderId] = useState<string | null>(null)
  const [viewingFolderId, setViewingFolderId] = useState<string | null>(null)
  const [folderProjects, setFolderProjects] = useState<any[]>([])
  const [loadingFolderProjects, setLoadingFolderProjects] = useState(false)
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
    if (user) {
      loadFolders()
      if (projectId) {
        loadCurrentProjectFolder()
      }
    }
  }, [user, projectId])

  async function loadCurrentProjectFolder() {
    if (!projectId || !user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const project = await res.json()
        setCurrentProjectFolderId(project.folder_id || null)
      }
    } catch (error) {
      console.error("Failed to load current project folder:", error)
    }
  }

  async function loadFolders() {
    if (!user) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/projects/folders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()
      if (res.ok) {
        const foldersList = data.folders || []
        
        // Load project counts for each folder
        if (foldersList.length > 0 && session?.access_token) {
          const foldersWithCounts = await Promise.all(
            foldersList.map(async (folder: Folder) => {
              try {
                const projectsRes = await fetch(`/api/projects?folder_id=${folder.id}`, {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                })
                if (projectsRes.ok) {
                  const projects = await projectsRes.json()
                  return { ...folder, project_count: projects.length || 0 }
                }
                return { ...folder, project_count: 0 }
              } catch {
                return { ...folder, project_count: 0 }
              }
            })
          )
          setFolders(foldersWithCounts)
        } else {
          setFolders(foldersList)
        }
        setFoldersAvailable(true)
      } else {
        // If folders feature isn't available, just set empty array (don't show error)
        // The feature will be available once the database migration is run
        setFolders([])
        // Check if it's a 503 (service unavailable) to know if feature isn't available
        if (res.status === 503) {
          setFoldersAvailable(false)
        }
      }
    } catch (error) {
      console.error("Failed to load folders:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to load folders.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function createFolder() {
    if (!newFolderName.trim() || !user) return

    setIsCreating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch("/api/projects/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        // Check if it's a "not available" error (503)
        if (res.status === 503) {
          setFoldersAvailable(false)
          setAlertModal({
            isOpen: true,
            title: "Feature Not Available",
            message: "The folders feature requires a database migration. The feature will be available once the migration is run.",
            type: "info",
          })
          return
        }
        throw new Error(data.error || "Failed to create folder")
      }

      setNewFolderName("")
      await loadFolders()
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: `Folder "${data.folder.name}" created successfully.`,
        type: "success",
      })
    } catch (error) {
      console.error("Failed to create folder:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to create folder.",
        type: "error",
      })
    } finally {
      setIsCreating(false)
    }
  }

  async function updateFolder(folderId: string) {
    if (!editingFolderName.trim() || !user) return

    setIsUpdating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`/api/projects/folders/${folderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: editingFolderName.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update folder")
      }

      setEditingFolderId(null)
      setEditingFolderName("")
      await loadFolders()
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: `Folder renamed successfully.`,
        type: "success",
      })
    } catch (error) {
      console.error("Failed to update folder:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to update folder.",
        type: "error",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  async function deleteFolder(folderId: string) {
    if (!user) return

    setIsDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`/api/projects/folders/${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete folder")
      }

      setDeleteConfirmModal({ isOpen: false, folderId: null, folderName: "" })
      await loadFolders()
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Folder deleted successfully. Projects in this folder have been unassigned.",
        type: "success",
      })
    } catch (error) {
      console.error("Failed to delete folder:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete folder.",
        type: "error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  async function assignProjectToFolder(folderId: string | null) {
    if (!projectId || !user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          folder_id: folderId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to assign folder")
      }

      setCurrentProjectFolderId(folderId)
      if (onFolderSelect) {
        onFolderSelect(folderId)
      }
      await loadFolders()
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: folderId ? "Project assigned to folder." : "Project removed from folder.",
        type: "success",
      })
    } catch (error) {
      console.error("Failed to assign folder:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to assign folder.",
        type: "error",
      })
    }
  }

  async function viewFolderContents(folderId: string) {
    if (!user) return

    setViewingFolderId(folderId)
    setLoadingFolderProjects(true)
    setFolderProjects([])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects?folder_id=${folderId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const projects = await res.json()
        setFolderProjects(projects || [])
      } else {
        throw new Error("Failed to load folder contents")
      }
    } catch (error) {
      console.error("Failed to load folder contents:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to load folder contents.",
        type: "error",
      })
    } finally {
      setLoadingFolderProjects(false)
    }
  }

  if (!user) return null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        aria-label="Manage project folders"
      >
        <Folder className="w-4 h-4 mr-2" />
        Folders
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setViewingFolderId(null)
          setFolderProjects([])
        }}
        title={viewingFolderId ? `Projects in "${folders.find(f => f.id === viewingFolderId)?.name || 'Folder'}"` : "Project Folders"}
        size="md"
      >
        <div className="space-y-4">
          {/* Create New Folder */}
          {foldersAvailable ? (
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Create New Folder</h3>
              <div className="flex gap-2">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFolderName.trim() && !isCreating) {
                      createFolder()
                    }
                  }}
                />
                <Button
                  onClick={createFolder}
                  disabled={!newFolderName.trim() || isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FolderPlus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-b border-gray-200 pb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Folders feature not available.</strong> Run the database migration to enable this feature.
                </p>
              </div>
            </div>
          )}

          {viewingFolderId ? (
            /* Folder Contents View */
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    setViewingFolderId(null)
                    setFolderProjects([])
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                  Back to folders
                </button>
              </div>
              {loadingFolderProjects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : folderProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>This folder is empty</p>
                  <p className="text-xs text-gray-400 mt-1">No projects assigned to this folder yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {folderProjects.map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/project/${project.id}/overview`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
                        <p className="text-xs text-gray-500 capitalize mt-1">{project.status}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Folders List */
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Your Folders
                {projectId && <span className="text-xs font-normal text-gray-500 ml-2">(Select to assign to project)</span>}
              </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No folders yet. Create one to get started!
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {projectId && (
                  <div
                    onClick={() => assignProjectToFolder(null)}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                      currentProjectFolderId === null
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border-2 border-gray-300" />
                      <span className="text-sm font-medium text-gray-900">No Folder</span>
                    </div>
                    {currentProjectFolderId === null && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                )}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      projectId
                        ? `cursor-pointer ${
                            currentProjectFolderId === folder.id
                              ? "bg-blue-50 border-2 border-blue-500"
                              : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                          }`
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={projectId ? () => assignProjectToFolder(folder.id) : undefined}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: folder.color }}
                      />
                      {editingFolderId === folder.id ? (
                        <Input
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editingFolderName.trim() && !isUpdating) {
                              updateFolder(folder.id)
                            } else if (e.key === "Escape") {
                              setEditingFolderId(null)
                              setEditingFolderName("")
                            }
                          }}
                          className="flex-1 h-7 text-sm"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-900 truncate">{folder.name}</span>
                          {folder.project_count !== undefined && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {folder.project_count}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {!projectId && editingFolderId !== folder.id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            viewFolderContents(folder.id)
                          }}
                          className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="View folder contents"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingFolderId(folder.id)
                            setEditingFolderName(folder.name)
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Rename folder"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirmModal({
                              isOpen: true,
                              folderId: folder.id,
                              folderName: folder.name,
                            })
                          }}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete folder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {editingFolderId === folder.id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateFolder(folder.id)
                          }}
                          disabled={!editingFolderName.trim() || isUpdating}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                          title="Save"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingFolderId(null)
                            setEditingFolderName("")
                          }}
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {projectId && currentProjectFolderId === folder.id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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

      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, folderId: null, folderName: "" })}
        onConfirm={() => {
          if (deleteConfirmModal.folderId) {
            deleteFolder(deleteConfirmModal.folderId)
          }
        }}
        title="Delete Folder"
        message={`Are you sure you want to delete "${deleteConfirmModal.folderName}"? Projects in this folder will be unassigned but not deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  )
}
