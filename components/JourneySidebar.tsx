"use client"

import { useState, useEffect } from "react"
import { usePathname, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { JourneyMap, type JourneyStage } from "@/components/JourneyMap"
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Map,
  CheckCircle2,
  Lightbulb,
  FileText,
  Presentation,
  Megaphone,
  Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Journey stages data for sidebar display
const journeyStages = [
  {
    id: "discovery" as JourneyStage,
    title: "Discovery",
    description: "Find your idea",
    icon: Lightbulb,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
  },
  {
    id: "planning" as JourneyStage,
    title: "Planning",
    description: "Build your plan",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    id: "validation" as JourneyStage,
    title: "Validation",
    description: "Test assumptions",
    icon: CheckCircle2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  {
    id: "documentation" as JourneyStage,
    title: "Documentation",
    description: "Raise funding",
    icon: Presentation,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
  },
  {
    id: "marketing" as JourneyStage,
    title: "Marketing",
    description: "Build marketing",
    icon: Megaphone,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
  },
  {
    id: "launch" as JourneyStage,
    title: "Launch",
    description: "Go live",
    icon: Rocket,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    id: "growth" as JourneyStage,
    title: "Growth",
    description: "Scale business",
    icon: Rocket,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
  },
]

export function JourneySidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentStage, setCurrentStage] = useState<JourneyStage>("discovery")
  const [completedStages, setCompletedStages] = useState<JourneyStage[]>([])
  const [projectId, setProjectId] = useState<string | undefined>()
  const pathname = usePathname()
  const params = useParams()
  const { user } = useAuth()

  // Extract projectId from URL if on project page
  useEffect(() => {
    if (params?.projectId && typeof params.projectId === 'string') {
      setProjectId(params.projectId)
    } else {
      setProjectId(undefined)
    }
  }, [params])

  // Determine current stage and completed stages based on user's projects
  useEffect(() => {
    async function determineStage() {
      if (!user) {
        setCurrentStage("discovery")
        setCompletedStages([])
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return

        const headers: HeadersInit = {
          Authorization: `Bearer ${session.access_token}`,
        }

        // Fetch user's projects
        const projectsRes = await fetch("/api/projects", { headers })
        const projects = projectsRes.ok ? await projectsRes.json() : []

        // Determine stage based on projects
        const hasProjects = Array.isArray(projects) && projects.length > 0
        const hasCompletedProjects = hasProjects && projects.some((p: any) => p.status === "complete")

        // If on a project page, check if it's complete
        if (projectId) {
          const projectRes = await fetch(`/api/projects/${projectId}`, { headers })
          if (projectRes.ok) {
            const project = await projectRes.json()
            // Check if all steps are complete
            const stepsRes = await fetch(`/api/steps?projectId=${projectId}`, { headers })
            if (stepsRes.ok) {
              // We'll determine based on project status
              if (project.status === "complete") {
                setCurrentStage("documentation")
                setCompletedStages(["discovery", "planning"])
              } else {
                setCurrentStage("planning")
                setCompletedStages(["discovery"])
              }
              return
            }
          }
        }

        // Default logic based on projects
        if (hasCompletedProjects) {
          setCurrentStage("documentation")
          setCompletedStages(["discovery", "planning"])
        } else if (hasProjects) {
          setCurrentStage("planning")
          setCompletedStages(["discovery"])
        } else {
          setCurrentStage("discovery")
          setCompletedStages([])
        }
      } catch (error) {
        console.error("Failed to determine journey stage:", error)
        // Default to discovery
        setCurrentStage("discovery")
        setCompletedStages([])
      }
    }

    determineStage()
  }, [user, projectId])

  // Check if we should show the sidebar on this page
  const shouldShow = () => {
    if (!user) return false
    
    // Hide on these pages
    const hidePages = [
      '/signin',
      '/auth',
      '/blogs',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/disclaimer',
    ]
    
    if (hidePages.some(page => pathname?.startsWith(page))) {
      return false
    }

    // Show on these pages
    const showPages = [
      '/dashboard',
      '/project',
      '/tools',
      '/history',
      '/settings',
    ]

    return showPages.some(page => pathname?.startsWith(page))
  }

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-expand on desktop when open, collapse on mobile
  useEffect(() => {
    if (isOpen && !isMobile) {
      setIsCollapsed(false)
    } else if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isOpen, isMobile])

  if (!shouldShow()) {
    return null
  }

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <>
        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center"
          aria-label="Open journey map"
        >
          <Map className="w-6 h-6" />
        </button>

        {/* Bottom Sheet Overlay */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
              {/* Handle */}
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-3 p-2 text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Header */}
              <div className="px-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Your Startup Journey</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Track your progress from idea to launch
                </p>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <JourneyMap
                  currentStage={currentStage}
                  completedStages={completedStages}
                  projectId={projectId}
                  variant="compact"
                  showActions={true}
                />
              </div>
            </div>
          </>
        )}
      </>
    )
  }

  // Desktop: Sidebar
  return (
    <>
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-gray-900 text-white p-2 rounded-r-lg shadow-lg hover:bg-gray-800 transition-all ${
          isCollapsed ? 'translate-x-0' : 'translate-x-64'
        }`}
        aria-label={isCollapsed ? "Expand journey map" : "Collapse journey map"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-10 bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ${
          isCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{ width: '16rem' }} // 256px
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-900">Your Journey</h2>
              <p className="text-xs text-gray-500 mt-0.5">Track your progress</p>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              aria-label="Collapse"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Summary */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Progress</span>
              <span className="text-xs font-semibold text-gray-900">
                {completedStages.length}/{journeyStages.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedStages.length / journeyStages.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {journeyStages.map((stage) => {
                const isCompleted = completedStages.includes(stage.id)
                const isCurrent = currentStage === stage.id
                const Icon = stage.icon

                return (
                  <div
                    key={stage.id}
                    className={`p-2.5 rounded-lg border transition-all cursor-default ${
                      isCurrent
                        ? `${stage.bgColor} ${stage.borderColor} border-2 shadow-sm`
                        : isCompleted
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isCurrent
                            ? "bg-blue-500 text-white"
                            : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3
                            className={`text-xs font-semibold ${
                              isCurrent ? stage.color : isCompleted ? "text-green-800" : "text-gray-700"
                            }`}
                          >
                            {stage.title}
                          </h3>
                          {isCurrent && (
                            <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-tight">{stage.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer - Quick Actions */}
          <div className="px-3 py-2.5 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={() => setIsCollapsed(true)}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1.5" />
              Collapse
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

