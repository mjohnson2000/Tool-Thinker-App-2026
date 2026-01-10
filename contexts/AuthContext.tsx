"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, Session, AuthError } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithProvider: (provider: "google" | "github") => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Helper to sync cookies with session
    const syncCookies = (session: Session | null) => {
      if (session) {
        // Set cookies with proper expiration
        const maxAgeAccess = 60 * 60 * 24 * 7 // 7 days
        const maxAgeRefresh = 60 * 60 * 24 * 30 // 30 days
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAgeAccess}; SameSite=Lax`
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${maxAgeRefresh}; SameSite=Lax`
      } else {
        // Clear cookies on sign out
        document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax'
        document.cookie = 'sb-refresh-token=; path=/; max-age=0; SameSite=Lax'
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      syncCookies(session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      syncCookies(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error && data.session) {
      // Ensure session is set and cookies are synced
      setSession(data.session)
      setUser(data.session.user)
      // Sync cookies immediately
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      // Small delay to ensure cookies are set before redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push("/")
      router.refresh()
    }
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (!error && data.session) {
      // Ensure session is set and cookies are synced
      setSession(data.session)
      setUser(data.session.user)
      // Sync cookies immediately
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      // Small delay to ensure cookies are set before redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push("/")
      router.refresh()
    }
    return { error }
  }

  const signInWithProvider = async (provider: "google" | "github") => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) {
        console.error("OAuth error:", error)
        // Error will be handled by the redirect
      }
      // Note: signInWithOAuth redirects the browser, so we don't need to handle the response
    } catch (err: any) {
      console.error("OAuth sign in error:", err)
    }
  }

  const signOut = async () => {
    // Clear cookies first
    document.cookie = 'sb-access-token=; path=/; max-age=0'
    document.cookie = 'sb-refresh-token=; path=/; max-age=0'
    // Then sign out from Supabase
    await supabase.auth.signOut()
    // Clear state
    setSession(null)
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const resetPassword = async (email: string) => {
    // Use our custom API endpoint that sends branded email via Resend
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: { message: data.error || 'Failed to send password reset email' } }
      }

      // Success - email sent (we don't reveal if email exists for security)
      return { error: null }
    } catch (err: any) {
      return { error: { message: err.message || 'Failed to send password reset email' } }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithProvider,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

