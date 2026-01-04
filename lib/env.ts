/**
 * Environment variable validation and access
 * Provides type-safe access to environment variables with validation
 */

import { z } from 'zod'

const envSchema = z.object({
  // Public (client-side) variables
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_BOOK_PURCHASE_URL: z.string().url().optional(),
  
  // Server-side only variables
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().optional(),
})

// Validate environment variables (server-side only)
// Uses safeParse to avoid crashing - only warns in development
function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BOOK_PURCHASE_URL: process.env.NEXT_PUBLIC_BOOK_PURCHASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  })

  if (!parsed.success) {
    // Only throw in development - in production, log warning and use defaults
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
      throw new Error('Invalid environment variables. Please check your .env.local file.')
    } else {
      // Production: log warning but don't crash
      console.warn('⚠️  Some environment variables may be missing or invalid:', parsed.error.flatten().fieldErrors)
    }
  }

  // Return parsed data if valid, otherwise return safe defaults
  if (parsed.success) {
    return parsed.data
  }

  // Fallback to process.env with defaults (backward compatible)
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_BOOK_PURCHASE_URL: process.env.NEXT_PUBLIC_BOOK_PURCHASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'production',
    PORT: process.env.PORT,
  }
}

// Validate on module load (server-side only)
// Client-side: use process.env directly (Next.js handles this)
const env: z.infer<typeof envSchema> = typeof window === 'undefined' 
  ? validateEnv()
  : {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      NEXT_PUBLIC_BOOK_PURCHASE_URL: process.env.NEXT_PUBLIC_BOOK_PURCHASE_URL,
      OPENAI_API_KEY: undefined, // Not available on client
      OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      PORT: undefined, // Not available on client
    }

export { env }

