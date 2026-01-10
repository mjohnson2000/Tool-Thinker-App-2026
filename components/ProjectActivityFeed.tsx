"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import {
  Activity,
  UserPlus,
  CheckCircle2,
  Edit2,
  MessageSquare,
  Link2,
  Clock,
  Loader2,
} from "lucide-react"
// Simple date formatter - no external dependency needed
function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  let result = ""
  if (diffMins < 1) result = "just now"
  else if (diffMins < 60) result = `${diffMins}m ago`
  else if (diffHours < 24) result = `${diffHours}h ago`
  else if (diffDays < 7) result = `${diffDays}d ago`
  else if (diffWeeks < 4) result = `${diffWeeks}w ago`
  else if (diffMonths < 12) result = `${diffMonths}mo ago`
  else result = `${Math.floor(diffMonths / 12)}y ago`

  return options?.addSuffix ? result : result.replace(" ago", "")
}

interface ActivityItem {
  id: string
  activity_type: string
  description: string
  user_id: string
  user_email?: string
  created_at: string
  metadata?: Record<string, any>
}

interface ProjectActivityFeedProps {
  projectId: string
  className?: string
  limit?: number
}

export function ProjectActivityFeed({
  projectId,
  className = "",
  limit = 20,
}: ProjectActivityFeedProps) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && projectId) {
      loadActivity()
    }
  }, [user, projectId])

  async function loadActivity() {
    if (!user) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/activity?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error("Failed to load activity:", error)
    } finally {
      setLoading(false)
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case "project_created":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "project_updated":
        return <Edit2 className="w-4 h-4 text-blue-600" />
      case "step_completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "step_started":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "member_invited":
      case "member_joined":
        return <UserPlus className="w-4 h-4 text-purple-600" />
      case "comment_added":
        return <MessageSquare className="w-4 h-4 text-blue-600" />
      case "tool_linked":
        return <Link2 className="w-4 h-4 text-indigo-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  function getActivityColor(type: string) {
    switch (type) {
      case "project_created":
      case "step_completed":
        return "bg-green-50 border-green-200"
      case "project_updated":
      case "step_started":
        return "bg-blue-50 border-blue-200"
      case "member_invited":
      case "member_joined":
        return "bg-purple-50 border-purple-200"
      case "comment_added":
        return "bg-blue-50 border-blue-200"
      case "tool_linked":
        return "bg-indigo-50 border-indigo-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (!user) return null

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No activity yet</p>
            <p className="text-xs mt-1">Activity will appear here as you work on the project</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-3 rounded-lg border ${getActivityColor(activity.activity_type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {activity.user_email || activity.user_id?.substring(0, 8) || "Unknown user"}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

