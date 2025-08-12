import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job (basic authentication)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Reset daily generations for all users
    const success = await DatabaseService.resetDailyGenerations()
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset daily generations' },
        { status: 500 }
      )
    }

    console.log('Daily usage reset completed successfully')
    
    return NextResponse.json({
      message: 'Daily usage reset completed successfully',
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error in daily usage reset cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
