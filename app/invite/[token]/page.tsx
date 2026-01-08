"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Users } from "lucide-react"
import Link from "next/link"

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const token = params.token as string
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'needs-auth'>('loading')
  const [message, setMessage] = useState("")
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && token) {
      handleInvitation()
    }
  }, [token, authLoading, user])

  async function handleInvitation() {
    if (!user) {
      setStatus('needs-auth')
      setMessage("Please sign in to accept this invitation")
      return
    }

    try {
      setStatus('loading')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setStatus('needs-auth')
        setMessage("Please sign in to accept this invitation")
        return
      }

      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation")
      }

      setStatus('success')
      setMessage("Invitation accepted! Redirecting to project...")
      setProjectId(data.projectId)

      // Redirect to project after 2 seconds
      setTimeout(() => {
        if (data.projectId) {
          router.push(`/project/${data.projectId}/overview`)
        } else {
          router.push('/dashboard')
        }
      }, 2000)
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || "Failed to accept invitation. The invitation may have expired or already been used.")
    }
  }

  if (status === 'loading' || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Processing invitation...</p>
        </div>
      </div>
    )
  }

  if (status === 'needs-auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Invitation</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Link href={`/signin?redirect=/invite/${token}`}>
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href={`/signin?redirect=/invite/${token}`}>
              <Button variant="outline" className="w-full">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          {projectId && (
            <Link href={`/project/${projectId}/overview`}>
              <Button className="w-full">Go to Project</Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Error</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

