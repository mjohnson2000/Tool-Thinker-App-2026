"use client"

import { useState, useRef, useEffect } from "react"
import {
  MoreVertical,
  Edit2,
  Copy,
  Archive,
  Trash2,
  Folder,
  Tag,
  Share2,
  ExternalLink,
  X,
} from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"

interface ProjectQuickActionsProps {
  projectId: string
  projectName: string
  projectStatus?: string
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onArchive?: (id: string) => void
  onUnarchive?: (id: string) => void
  onDelete?: (id: string) => void
  onMoveToFolder?: (id: string) => void
  onAddTag?: (id: string) => void
  onShare?: (id: string) => void
  onView?: (id: string) => void
  className?: string
}

export function ProjectQuickActions({
  projectId,
  projectName,
  projectStatus,
  onEdit,
  onDuplicate,
  onArchive,
  onUnarchive,
  onDelete,
  onMoveToFolder,
  onAddTag,
  onShare,
  onView,
  className = "",
}: ProjectQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleAction = (action: () => void | undefined) => {
    if (action) {
      action()
      setIsOpen(false)
    }
  }

  const isArchived = projectStatus === "archived"

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Tooltip content="More actions">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          aria-label="Project actions"
          aria-expanded={isOpen}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </Tooltip>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
            {onView && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(() => onView(projectId))
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Project
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(() => onEdit(projectId))
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Name
              </button>
            )}

            <div className="border-t border-gray-200 my-1" />

            {onMoveToFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(() => onMoveToFolder(projectId))
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Folder className="w-4 h-4" />
                Move to Folder
              </button>
            )}

            {onAddTag && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(() => onAddTag(projectId))
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Tag className="w-4 h-4" />
                Add Tag
              </button>
            )}

            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(() => onShare(projectId))
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share Project
              </button>
            )}

            <div className="border-t border-gray-200 my-1" />

            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(() => onDuplicate(projectId))
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
            )}

            {isArchived && onUnarchive ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(() => onUnarchive(projectId))
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Archive className="w-4 h-4" />
                Unarchive
              </button>
            ) : onArchive ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(() => onArchive(projectId))
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
            ) : null}

            {onDelete && (
              <>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(() => onDelete(projectId))
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

