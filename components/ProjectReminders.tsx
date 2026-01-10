"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Bell, BellPlus, Calendar, X, Loader2, CheckCircle2 } from "lucide-react"
import { AlertModal } from "@/components/ui/modal"

interface Reminder {
  id: string
  project_id: string
  reminder_date: string
  reminder_text: string
  reminder_type: string
  completed: boolean
  project?: {
    id: string
    name: string
  }
}

interface ProjectRemindersProps {
  projectId?: string
}

export function ProjectReminders({ projectId }: ProjectRemindersProps) {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newReminder, setNewReminder] = useState({
    reminder_date: "",
    reminder_text: "",
    reminder_type: "deadline",
  })
  const [loading, setLoading] = useState(true)
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
      loadReminders()
    }
  }, [user, projectId])

  async function loadReminders() {
    if (!user) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/projects/reminders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()
      if (res.ok) {
        const allReminders = data.reminders || []
        // Filter by projectId if provided
        const filtered = projectId
          ? allReminders.filter((r: Reminder) => r.project_id === projectId)
          : allReminders
        setReminders(filtered)
      } else {
        setAlertModal({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to load reminders.",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Failed to load reminders:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to load reminders.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function createReminder() {
    if (!newReminder.reminder_date || !user || !projectId) return

    setIsCreating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch("/api/projects/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          reminder_date: newReminder.reminder_date,
          reminder_text: newReminder.reminder_text,
          reminder_type: newReminder.reminder_type,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to create reminder")
      }

      setNewReminder({
        reminder_date: "",
        reminder_text: "",
        reminder_type: "deadline",
      })
      await loadReminders()
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Reminder created successfully.",
        type: "success",
      })
    } catch (error) {
      console.error("Failed to create reminder:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to create reminder.",
        type: "error",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (!user) return null

  const upcomingReminders = reminders.filter(
    (r) => !r.completed && new Date(r.reminder_date) >= new Date()
  )

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        aria-label="Manage project reminders"
      >
        <Bell className="w-4 h-4 mr-2" />
        Reminders {upcomingReminders.length > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
            {upcomingReminders.length}
          </span>
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Project Reminders"
        size="md"
      >
        <div className="space-y-4">
          {/* Create New Reminder */}
          {projectId && (
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Create New Reminder</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={newReminder.reminder_date}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, reminder_date: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reminder Text (optional)
                  </label>
                  <Input
                    value={newReminder.reminder_text}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, reminder_text: e.target.value })
                    }
                    placeholder="e.g., Review milestone progress"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newReminder.reminder_type}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, reminder_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="deadline">Deadline</option>
                    <option value="milestone">Milestone</option>
                    <option value="review">Review</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Button
                  onClick={createReminder}
                  disabled={!newReminder.reminder_date || isCreating}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <BellPlus className="w-4 h-4 mr-2" />
                      Create Reminder
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Reminders List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {projectId ? "Project Reminders" : "All Reminders"}
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No reminders yet. {projectId && "Create one to get started!"}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-3 rounded-lg border ${
                      reminder.completed
                        ? "bg-gray-50 border-gray-200"
                        : new Date(reminder.reminder_date) < new Date()
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(reminder.reminder_date).toLocaleString()}
                          </span>
                          {reminder.completed && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        {reminder.reminder_text && (
                          <p className="text-sm text-gray-600">{reminder.reminder_text}</p>
                        )}
                        {reminder.project && (
                          <p className="text-xs text-gray-500 mt-1">
                            Project: {reminder.project.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
