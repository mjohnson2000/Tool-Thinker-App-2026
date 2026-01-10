"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import {
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  X,
  Check,
  AtSign,
  Loader2,
} from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"
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

interface Comment {
  id: string
  project_id: string
  step_id?: string
  user_id: string
  user_email?: string
  comment_text: string
  mentions?: string[]
  created_at: string
  updated_at: string
  is_edited?: boolean
}

interface ProjectCommentsProps {
  projectId: string
  stepId?: string
  className?: string
}

export function ProjectComments({ projectId, stepId, className = "" }: ProjectCommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; email: string }>>([])

  useEffect(() => {
    if (user && projectId) {
      loadComments()
      loadTeamMembers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, projectId, stepId])

  async function loadTeamMembers() {
    if (!user) return

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
        // Map members to include email
        const membersWithEmail = (data.members || []).map((member: any) => ({
          id: member.user_id || member.id,
          email: member.user_email || member.email || "Unknown",
        }))
        setTeamMembers(membersWithEmail)
      }
    } catch (error) {
      console.error("Failed to load team members:", error)
    }
  }

  async function loadComments() {
    if (!user) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const params = new URLSearchParams({ project_id: projectId })
      if (stepId) params.set("step_id", stepId)

      const res = await fetch(`/api/projects/${projectId}/comments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      // Extract mentions from comment text
      const mentionRegex = /@(\w+)/g
      const mentions: string[] = []
      let match
      while ((match = mentionRegex.exec(newComment)) !== null) {
        mentions.push(match[1])
      }

      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          comment_text: newComment.trim(),
          step_id: stepId || null,
          mentions: mentions.length > 0 ? mentions : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to post comment")
      }

      setNewComment("")
      await loadComments()
    } catch (error) {
      console.error("Failed to post comment:", error)
      alert(error instanceof Error ? error.message : "Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editText.trim()) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          comment_text: editText.trim(),
        }),
      })

      if (res.ok) {
        setEditingId(null)
        setEditText("")
        await loadComments()
      }
    } catch (error) {
      console.error("Failed to edit comment:", error)
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        await loadComments()
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  function handleMentionInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setNewComment(value)

    // Check for @ mention
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionQuery(textAfterAt)
        setShowMentionSuggestions(true)
        return
      }
    }

    setShowMentionSuggestions(false)
  }

  function insertMention(email: string) {
    const cursorPos = textareaRef.current?.selectionStart || 0
    const textBefore = newComment.substring(0, cursorPos)
    const textAfter = newComment.substring(cursorPos)
    const lastAtIndex = textBefore.lastIndexOf("@")
    
    if (lastAtIndex !== -1) {
      const beforeAt = textBefore.substring(0, lastAtIndex)
      const newText = `${beforeAt}@${email} ${textAfter}`
      setNewComment(newText)
      setShowMentionSuggestions(false)
      setTimeout(() => {
        textareaRef.current?.focus()
        const newPos = lastAtIndex + email.length + 2
        textareaRef.current?.setSelectionRange(newPos, newPos)
      }, 0)
    }
  }

  const filteredMembers = teamMembers.filter((member) =>
    member.email.toLowerCase().includes(mentionQuery.toLowerCase())
  )

  if (!user) return null

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            Comments {stepId ? "(Step-specific)" : "(Project-wide)"}
          </h3>
          {comments.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {comments.length}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No comments yet</p>
            <p className="text-xs mt-1">Start the conversation below</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment.id)}
                      disabled={!editText.trim()}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setEditText("")
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {comment.user_email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {comment.user_email || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                          {comment.is_edited && " (edited)"}
                        </div>
                      </div>
                    </div>
                    {String(comment.user_id) === String(user.id) && (
                      <div className="flex items-center gap-1">
                        <Tooltip content="Edit comment">
                          <button
                            onClick={() => {
                              setEditingId(comment.id)
                              setEditText(comment.comment_text)
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Delete comment">
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.comment_text.split(/(@\w+)/g).map((part, i) => {
                      if (part.startsWith("@")) {
                        return (
                          <span key={i} className="text-blue-600 font-medium">
                            {part}
                          </span>
                        )
                      }
                      return part
                    })}
                  </div>
                  {comment.mentions && comment.mentions.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <AtSign className="w-3 h-3" />
                      <span>Mentioned: {comment.mentions.join(", ")}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 relative">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleMentionInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmitComment()
              }
              if (e.key === "Escape") {
                setShowMentionSuggestions(false)
              }
            }}
            placeholder={`Add a comment... (${stepId ? "This will be visible on this step" : "This will be visible project-wide"})`}
            className="min-h-[80px] pr-10"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">⌘+Enter to send</span>
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mention Suggestions */}
        {showMentionSuggestions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => insertMention(member.email)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <AtSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{member.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

