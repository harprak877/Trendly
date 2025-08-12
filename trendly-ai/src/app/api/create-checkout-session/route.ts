import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { StripeService, STRIPE_CONFIG } from '@/lib/stripe'
import { DatabaseService } from '@/lib/database'

export async function POST() {
  try {
    // Verify authentication
    const { userId, sessionClaims } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
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

    // Check if user is already premium
    if (user.subscription_tier === 'premium') {
      return NextResponse.json(
        { error: 'User already has premium subscription' },
        { status: 400 }
      )
    }

    // Create checkout session
    const session = await StripeService.createCheckoutSession({
      priceId: STRIPE_CONFIG.premiumPriceId,
      userId: userId,
      userEmail: user.email,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}