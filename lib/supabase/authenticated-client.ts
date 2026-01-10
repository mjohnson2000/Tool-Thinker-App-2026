/**
 * Helper to create an authenticated Supabase client from a token
 * Use this in API routes when you have a token from the Authorization header
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export async function createAuthenticatedClient(token: string) {
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}

