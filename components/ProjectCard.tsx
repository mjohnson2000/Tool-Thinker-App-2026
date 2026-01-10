"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Archive, 
  Trash2,
  ExternalLink,
  Target,
  Folder,
  Tag as TagIcon
} from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ProjectQuickActions } from "@/components/ProjectQuickActions"

interface Project {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  folder_id?: string
  folder?: {
    id: string
    name: string
    color: string
  }
  tags?: Array<{ id: string; tag: string }>
}

interface ProjectCardProps {
  project: Project
  healthScore?: number
  nextStep?: string
  completionPercentage?: number
  viewMode?: "grid" | "list"
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
  formatDate?: (date: string) => string
}

export function ProjectCard({
  project,
  healthScore,
  nextStep,
  completionPercentage = 0,
  viewMode = "grid",
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onStatusChange,
  formatDate = (date) => new Date(date).toLocaleDateString(),
}: ProjectCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200"
      case "paused":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "complete":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "review":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "archived":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-3 h-3" />
      case "paused":
        return <Clock className="w-3 h-3" />
      case "complete":
        return <CheckCircle2 className="w-3 h-3" />
      case "review":
        return <Clock className="w-3 h-3" />
      case "archived":
        return <Archive className="w-3 h-3" />
      default:
        return null
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 50) return "Good"
    return "Needs Attention"
  }

  if (viewMode === "list") {
    return (
      <div
        className="group flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowActions(false)
        }}
      >
        {/* Progress Ring */}
        <div className="flex-shrink-0">
          <ProgressRing
            percentage={completionPercentage}
            size={48}
            strokeWidth={4}
            color={healthScore && healthScore >= 80 ? "#10b981" : healthScore && healthScore >= 50 ? "#f59e0b" : "#ef4444"}
          />
        </div>

        {/* Project Info */}
        <Link
          href={`/project/${project.id}/overview`}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span className="capitalize">{project.status}</span>
                </span>
                {healthScore !== undefined && (
                  <Tooltip content={`Health Score: ${healthScore}% - ${getHealthLabel(healthScore)}`}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getHealthColor(healthScore)}`}>
                      <Activity className="w-3 h-3" />
                      {healthScore}%
                    </span>
                  </Tooltip>
                )}
                {project.folder && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200">
                    <Folder className="w-3 h-3" />
                    {project.folder.name}
                  </span>
                )}
              </div>
              {nextStep && (
                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                  <Target className="w-3 h-3" />
                  <span>Next: {nextStep}</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{completionPercentage}% complete</span>
          <span>Updated {formatDate(project.updated_at)}</span>
        </div>

        {/* Quick Actions */}
        {isHovered && (
          <div className="flex-shrink-0">
            <ProjectQuickActions
              projectId={project.id}
              projectName={project.name}
              projectStatus={project.status}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onArchive={project.status !== "archived" ? onArchive : undefined}
              onUnarchive={project.status === "archived" ? onArchive : undefined}
              onDelete={onDelete}
              onView={(id) => window.location.href = `/project/${id}/overview`}
            />
          </div>
        )}
      </div>
    )
  }

  // Grid View
  return (
    <div
      className="group relative p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowActions(false)
      }}
    >
      {/* Progress Ring - Top Right */}
      <div className="absolute top-4 right-4">
        <ProgressRing
          percentage={completionPercentage}
          size={56}
          strokeWidth={5}
          color={healthScore && healthScore >= 80 ? "#10b981" : healthScore && healthScore >= 50 ? "#f59e0b" : "#ef4444"}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700">
            {Math.round(completionPercentage)}%
          </span>
        </div>
      </div>

      {/* Health Score Badge - Top Left */}
      {healthScore !== undefined && (
        <div className="absolute top-4 left-4 z-10">
          <Tooltip content={`Health Score: ${healthScore}% - ${getHealthLabel(healthScore)}`}>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 shadow-sm ${getHealthColor(healthScore)}`}>
              <Activity className="w-3 h-3" />
              {healthScore}%
            </span>
          </Tooltip>
        </div>
      )}

      {/* Project Content */}
      <Link href={`/project/${project.id}/overview`} className="block">
        <div className="pr-16">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3rem]">
            {project.name}
          </h3>

          {/* Status Badge */}
          <div className="mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="capitalize">{project.status}</span>
            </span>
          </div>

          {/* Folder & Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {project.folder && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200">
                <Folder className="w-3 h-3" />
                {project.folder.name}
              </span>
            )}
            {project.tags && project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
              >
                <TagIcon className="w-3 h-3" />
                {tag.tag}
              </span>
            ))}
          </div>

          {/* Next Step */}
          {nextStep && (
            <div className="flex items-center gap-1 text-xs text-blue-600 mb-3">
              <Target className="w-3 h-3" />
              <span className="line-clamp-1">Next: {nextStep}</span>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500">
            Updated {formatDate(project.updated_at)}
          </div>
        </div>
      </Link>

      {/* Quick Actions - Appear on Hover */}
      {isHovered && (
        <div className="absolute bottom-4 right-4">
          <ProjectQuickActions
            projectId={project.id}
            projectName={project.name}
            projectStatus={project.status}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onArchive={project.status !== "archived" ? onArchive : undefined}
            onUnarchive={project.status === "archived" ? onArchive : undefined}
            onDelete={onDelete}
            onView={(id) => window.location.href = `/project/${id}/overview`}
          />
        </div>
      )}
    </div>
  )
}

