import { NextResponse } from 'next/server'

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
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

