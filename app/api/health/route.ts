import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Health check endpoint for monitoring
export async function GET() {
  try {
    // You can add database health checks here
    // For example, check Supabase connection
    
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    logger.error("Health check error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}


