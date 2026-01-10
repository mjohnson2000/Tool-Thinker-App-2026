"use client"

import { Button } from "@/components/ui/button"
import { Plus, Sparkles, FolderOpen, Rocket, Lightbulb } from "lucide-react"
import Link from "next/link"

interface ProjectEmptyStateProps {
  type?: "no-projects" | "no-results" | "no-folder"
  onCreateProject?: () => void
  onViewTemplates?: () => void
  onClearFilters?: () => void
  searchQuery?: string
}

export function ProjectEmptyState({
  type = "no-projects",
  onCreateProject,
  onViewTemplates,
  onClearFilters,
  searchQuery,
}: ProjectEmptyStateProps) {
  if (type === "no-results") {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No projects found</h3>
          <p className="text-gray-600 mb-2">
            {searchQuery ? (
              <>
                No projects match <span className="font-semibold">"{searchQuery}"</span>
              </>
            ) : (
              "No projects match your current filters"
            )}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
          {onClearFilters && (
            <Button 
              onClick={onClearFilters}
              variant="outline"
              className="border-2 border-gray-300"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (type === "no-folder") {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-300">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">This folder is empty</h3>
          <p className="text-gray-600 mb-4">
            No projects have been assigned to this folder yet.
          </p>
          {onCreateProject && (
            <Button 
              onClick={onCreateProject}
              className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Default: no-projects
  return (
    <div className="text-center py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <div className="max-w-lg mx-auto">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Rocket className="w-16 h-16 text-blue-600" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-3xl font-bold text-gray-900 mb-3">Start Your First Project</h3>
        <p className="text-gray-600 mb-2 text-lg leading-relaxed">
          Create a project to get guided, step-by-step help building your startup plan using proven frameworks.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Projects help you structure your thinking and track progress from idea to launch.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {onCreateProject && (
            <Button 
              onClick={onCreateProject}
              size="lg"
              className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Project
            </Button>
          )}
          {onViewTemplates && (
            <Button 
              onClick={onViewTemplates}
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 px-8 py-6 text-lg font-semibold rounded-xl hover:bg-gray-50"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Browse Templates
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-4">Quick Tips:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Choose a Template</p>
                <p className="text-xs text-gray-500">Start with a pre-built template for faster setup</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Follow the Steps</p>
                <p className="text-xs text-gray-500">Complete each step to build your plan systematically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Track Progress</p>
                <p className="text-xs text-gray-500">Monitor your health score and completion percentage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

