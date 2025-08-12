import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DatabaseService } from '@/lib/database'
import { OpenAIService } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId, sessionClaims } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { topic, types, trends_enabled } = body

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.length > 80) {
      return NextResponse.json(
        { error: 'Invalid topic. Must be a string with max 80 characters.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(types) || types.length === 0) {
      return NextResponse.json(
        { error: 'Invalid types. Must be a non-empty array.' },
        { status: 400 }
      )
    }

    const validTypes = ['ideas', 'captions', 'hashtags']
    if (!types.every(type => validTypes.includes(type))) {
      return NextResponse.json(
        { error: 'Invalid types. Must contain only: ideas, captions, hashtags' },
        { status: 400 }
      )
    }

    // Check user existence and creation
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

    // Check generation limits
    const { canGenerate, remainingGenerations } = await DatabaseService.checkUserCanGenerate(userId)
    if (!canGenerate) {
      return NextResponse.json(
        { 
          error: 'Generation limit reached',
          message: 'You have reached your daily generation limit. Upgrade to Premium for unlimited generations.',
          remainingGenerations: 0
        },
        { status: 403 }
      )
    }

    // Get trend data if enabled
    let trendData: Array<{ title: string; description: string }> = []
    if (trends_enabled) {
      const trends = await DatabaseService.getTrendData()
      trendData = trends.map(trend => ({
        title: trend.title,
        description: trend.description
      }))
    }

    // Generate content using OpenAI
    const content = await OpenAIService.generateContent({
      topic,
      types,
      trendsEnabled: trends_enabled,
      trendData,
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    // Apply watermark for free users
    let finalContent = content
    if (user.subscription_tier === 'free') {
      finalContent = OpenAIService.addWatermark(content)
    }

    // Increment usage count
    const incrementSuccess = await DatabaseService.incrementUserGeneration(userId)
    if (!incrementSuccess) {
      console.error('Failed to increment user generation count')
    }

    return NextResponse.json({
      ...finalContent,
      remainingGenerations: user.subscription_tier === 'premium' 
        ? -1 
        : Math.max(0, remainingGenerations - 1)
    })

  } catch (error) {
    console.error('Error in generate API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}