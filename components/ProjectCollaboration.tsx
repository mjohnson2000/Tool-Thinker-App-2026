"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal, AlertModal } from "@/components/ui/modal"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { 
  Users, 
  UserPlus, 
  Mail, 
  X, 
  Eye, 
  Edit, 
  Crown,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"

interface ProjectCollaborationProps {
  projectId: string
  projectName: string
}

interface Member {
  id: string
  user_id: string
  role: "owner" | "editor" | "viewer"
  status: "pending" | "active" | "declined"
  user_email?: string
}

export function ProjectCollaboration({ projectId, projectName }: ProjectCollaborationProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer")
  const [inviting, setInviting] = useState(false)
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
      loadMembers()
    }
  }, [isOpen, projectId])

  async function loadMembers() {
    if (!user) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error("Failed to load members:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !user) return

    setInviting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to invite member")
      }

      setAlertModal({
        isOpen: true,
        title: "Invitation Sent",
        message: `An invitation has been sent to ${inviteEmail}.`,
        type: "success",
      })

      setInviteEmail("")
      await loadMembers()
    } catch (error) {
      console.error("Failed to invite member:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to send invitation",
        type: "error",
      })
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        await loadMembers()
        setAlertModal({
          isOpen: true,
          title: "Member Removed",
          message: "The member has been removed from the project.",
          type: "success",
        })
      }
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "editor":
        return <Edit className="w-4 h-4 text-blue-600" />
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "owner":
        return "Owner"
      case "editor":
        return "Editor"
      case "viewer":
        return "Viewer"
      default:
        return role
    }
  }

  return (
    <>
      <Tooltip content="Manage project collaboration">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          aria-label="Manage collaboration"
        >
          <Users className="w-4 h-4 mr-2" />
          Collaborate
        </Button>
      </Tooltip>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Project Collaboration"
        size="lg"
      >
        <div className="space-y-6">
          {/* Invite Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Members</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="border-2 border-gray-200 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="viewer">Viewer - Can view project</option>
                  <option value="editor">Editor - Can edit project</option>
                </select>
              </div>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
                className="w-full"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Team Members ({members.length})
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No team members yet</p>
                <p className="text-sm mt-2">Invite team members to collaborate on this project</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {member.user_email || "Pending invitation"}
                          </span>
                          {member.status === "pending" && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                              Pending
                            </span>
                          )}
                          {member.status === "active" && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleIcon(member.role)}
                          <span className="text-sm text-gray-600">{getRoleLabel(member.role)}</span>
                        </div>
                      </div>
                    </div>
                    {member.role !== "owner" && (
                      <Tooltip content="Remove member">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                          aria-label="Remove member"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    )}
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

