"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Activity, 
  FileText,
  Lightbulb,
  Loader2,
  CheckCircle2,
  Clock,
  FolderOpen
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertModal } from "@/components/ui/modal"

interface AnalyticsData {
  overview: {
    totalProjects: number
    totalToolOutputs: number
    completionRate: number
    averageHealth: number
  }
  projectsByStatus: Record<string, number>
  mostUsedTools: Array<{
    toolId: string
    toolName: string
    count: number
  }>
  activity: {
    totalSteps: number
    completedSteps: number
  }
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
      return
    }
    if (user) {
      loadAnalytics()
    }
  }, [user, authLoading, router])

  async function loadAnalytics() {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch("/api/analytics/dashboard", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to load analytics")
      }

      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error("Failed to load analytics:", err)
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights into your startup planning progress</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Projects</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalProjects}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Completion Rate</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.completionRate}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Health Score</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.averageHealth}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Tool Outputs</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalToolOutputs}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects by Status */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Projects by Status
            </h2>
            <div className="space-y-4">
              {Object.entries(analytics.projectsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="font-medium text-gray-900 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full"
                        style={{
                          width: `${(count / analytics.overview.totalProjects) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Used Tools */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Most Used Tools
            </h2>
            <div className="space-y-4">
              {analytics.mostUsedTools.length > 0 ? (
                analytics.mostUsedTools.map((tool, index) => (
                  <div key={tool.toolId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{tool.toolName}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{tool.count} uses</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No tool usage data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Activity Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Steps</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.activity.totalSteps}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Completed Steps</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.activity.completedSteps}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

