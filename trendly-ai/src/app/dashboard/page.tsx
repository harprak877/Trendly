'use client'

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { ContentGenerationForm } from '@/components/ContentGenerationForm'
import { ContentOutput } from '@/components/ContentOutput'
import { SubscriptionCard } from '@/components/SubscriptionCard'
import { ContentGenerationResponse } from '@/lib/openai'

interface UserData {
  user: {
    id: string
    email: string
    subscription_tier: 'free' | 'premium'
    created_at: string
  }
  usage: {
    daily_generations: number
    remaining_generations: number
    can_generate: boolean
    last_reset_date: string
  }
}

interface GenerationRequest {
  topic: string
  types: string[]
  trends_enabled: boolean
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRequest, setLastRequest] = useState<GenerationRequest | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContentGenerated = (content: ContentGenerationResponse, request: GenerationRequest) => {
    setGeneratedContent(content)
    setLastRequest(request)
    // Refresh user data to update usage
    fetchUserData()
  }

  const handleRegenerate = async () => {
    if (!lastRequest) return
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lastRequest),
      })

      if (response.ok) {
        const content = await response.json()
        setGeneratedContent(content)
        fetchUserData()
      }
    } catch (error) {
      console.error('Error regenerating content:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Trendly.ai
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-secondary-600">
                Welcome back!
              </div>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form and Subscription */}
          <div className="lg:col-span-1 space-y-6">
            {/* Subscription Card */}
            {userData && (
              <SubscriptionCard 
                subscriptionTier={userData.user.subscription_tier}
                remainingGenerations={userData.usage.remaining_generations}
                dailyGenerations={userData.usage.daily_generations}
              />
            )}

            {/* Content Generation Form */}
            <ContentGenerationForm 
              onContentGenerated={handleContentGenerated}
              canGenerate={userData?.usage.can_generate || false}
            />
          </div>

          {/* Right Column - Generated Content */}
          <div className="lg:col-span-2">
            {generatedContent ? (
              <ContentOutput 
                content={generatedContent}
                onRegenerate={handleRegenerate}
                showWatermark={userData?.user.subscription_tier === 'free'}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-8 text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Ready to create viral content?
                </h3>
                <p className="text-secondary-600 mb-6">
                  Enter a topic and select the content types you want to generate. 
                  Our AI will create trending content ideas, captions, and hashtags for you.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="font-medium text-primary-900 mb-1">💡 Ideas</div>
                    <div className="text-primary-700">Specific video concepts</div>
                  </div>
                  <div className="bg-accent-50 p-4 rounded-lg">
                    <div className="font-medium text-accent-900 mb-1">✍️ Captions</div>
                    <div className="text-accent-700">Engaging post copy</div>
                  </div>
                  <div className="bg-success-50 p-4 rounded-lg">
                    <div className="font-medium text-success-900 mb-1">🏷️ Hashtags</div>
                    <div className="text-success-700">Strategic tag combinations</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}