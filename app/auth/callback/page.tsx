"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function handleCallback() {
      // Parse hash fragment (Supabase OAuth returns tokens in hash)
      const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null
      const code = searchParams.get('code') || hashParams?.get('code')
      const accessToken = hashParams?.get('access_token')
      const refreshToken = hashParams?.get('refresh_token')
      const errorParam = searchParams.get('error') || hashParams?.get('error')
      const errorDescription = searchParams.get('error_description') || hashParams?.get('error_description')
      const next = searchParams.get('next') || '/'

      // Handle OAuth errors
      if (errorParam) {
        setError(errorDescription || errorParam)
        setLoading(false)
        setTimeout(() => {
          router.push('/signin?error=' + encodeURIComponent(errorDescription || errorParam))
        }, 2000)
        return
      }

      // Handle code exchange flow (PKCE)
      if (code) {
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('OAuth exchange error:', exchangeError)
            setError(exchangeError.message || 'Failed to authenticate')
            setLoading(false)
            setTimeout(() => {
              router.push('/signin?error=' + encodeURIComponent(exchangeError.message || 'Authentication failed'))
            }, 2000)
            return
          }

          if (data?.session) {
            router.push(next)
            router.refresh()
          } else {
            setError('No session received')
            setLoading(false)
            setTimeout(() => {
              router.push('/signin?error=No session received')
            }, 2000)
          }
        } catch (err: any) {
          console.error('OAuth callback error:', err)
          setError(err.message || 'Authentication failed')
          setLoading(false)
          setTimeout(() => {
            router.push('/signin?error=' + encodeURIComponent(err.message || 'Authentication failed'))
          }, 2000)
        }
        return
      }

      // Handle implicit flow (tokens in hash)
      if (accessToken && refreshToken) {
        try {
          // Set the session directly from tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('Session set error:', sessionError)
            setError(sessionError.message || 'Failed to set session')
            setLoading(false)
            setTimeout(() => {
              router.push('/signin?error=' + encodeURIComponent(sessionError.message || 'Authentication failed'))
            }, 2000)
            return
          }

          if (data?.session) {
            // Success - redirect to dashboard
            router.push(next)
            router.refresh()
          } else {
            setError('No session received')
            setLoading(false)
            setTimeout(() => {
              router.push('/signin?error=No session received')
            }, 2000)
          }
        } catch (err: any) {
          console.error('Session set error:', err)
          setError(err.message || 'Authentication failed')
          setLoading(false)
          setTimeout(() => {
            router.push('/signin?error=' + encodeURIComponent(err.message || 'Authentication failed'))
          }, 2000)
        }
        return
      }

      // No code or tokens - redirect to sign in
      router.push('/signin?error=No authorization code or tokens received')
    }

    handleCallback()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to sign in page...</p>
        </div>
      </div>
    )
  }

  return null
}

