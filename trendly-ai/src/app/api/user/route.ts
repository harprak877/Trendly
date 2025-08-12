import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    // Verify authentication
    const { userId, sessionClaims } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user data
    let user = await DatabaseService.getUserByClerkId(userId)
    if (!user) {
      // Create new user if doesn't exist
      const userEmail = (sessionClaims?.email as string) || ''
      user = await DatabaseService.createUser({
        clerk_user_id: userId,
        email: userEmail,
      })
      
      if (!user) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
    }

    // Get usage data
    const usage = await DatabaseService.getUserUsage(userId)
    const { canGenerate, remainingGenerations } = await DatabaseService.checkUserCanGenerate(userId)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at
      },
      usage: {
        daily_generations: usage?.daily_generations || 0,
        remaining_generations: remainingGenerations,
        can_generate: canGenerate,
        last_reset_date: usage?.last_reset_date || new Date().toISOString().split('T')[0]
      }
    })

  } catch (error) {
    console.error('Error in user API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
