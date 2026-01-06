import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

export function createClient() {
  const cookieStore = cookies()
  
  // Get auth token from cookies
  const accessToken = cookieStore.get('sb-access-token')?.value

  const supabase = createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: accessToken ? {
          Authorization: `Bearer ${accessToken}`,
        } : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )

  return supabase
}

