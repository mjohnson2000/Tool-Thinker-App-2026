"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Edit, 
  Eye, 
  X, 
  Check,
  Loader2
} from "lucide-react"

interface ProjectMember {
  id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  joined_at: string
  user_email?: string
}

interface TeamMembersProps {
  projectId: string
  isOwner: boolean
}

export function TeamMembers({ projectId, isOwner }: TeamMembersProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadMembers()
    }
  }, [projectId])

  async function loadMembers() {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load members")
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (err: any) {
      setError(err.message || "Failed to load members")
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) {
      setError("Please enter an email address")
      return
    }

    setInviting(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(`/api/projects/${projectId}/members`, {
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation")
      }

      // Reload members
      await loadMembers()
      setShowInviteModal(false)
      setInviteEmail("")
      setInviteRole('viewer')
    } catch (err: any) {
      setError(err.message || "Failed to send invitation")
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to remove member")
      }

      await loadMembers()
    } catch (err: any) {
      setError(err.message || "Failed to remove member")
    }
  }

  async function handleUpdateRole(memberId: string, newRole: 'owner' | 'editor' | 'viewer') {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      await loadMembers()
    } catch (err: any) {
      setError(err.message || "Failed to update role")
    }
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'editor':
        return <Edit className="w-4 h-4 text-blue-600" />
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'editor':
        return 'Editor'
      case 'viewer':
        return 'Viewer'
      default:
        return role
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <span className="text-sm text-gray-500">({members.length})</span>
        </div>
        {isOwner ? (
          <Button
            onClick={() => setShowInviteModal(true)}
            size="sm"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </Button>
        ) : null}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No team members yet</p>
            {isOwner && (
              <p className="text-sm mt-1">Invite team members to collaborate</p>
            )}
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                  {member.user_email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {member.user_email || `User ${member.user_id.slice(0, 8)}`}
                    </span>
                    {String(member.user_id) === String(user?.id) && (
                      <span className="text-xs text-gray-500">(You)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleIcon(member.role)}
                    <span className="text-xs text-gray-600">{getRoleLabel(member.role)}</span>
                  </div>
                </div>
              </div>

              {isOwner && String(member.user_id) !== String(user?.id) && (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                  <Button
                    onClick={() => handleRemoveMember(member.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail("")
                  setError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="viewer">Viewer - Can view project</option>
                  <option value="editor">Editor - Can edit project</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex-1"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteEmail("")
                    setError(null)
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

