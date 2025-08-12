'use client'

import { useState } from 'react'

interface SubscriptionCardProps {
  subscriptionTier: 'free' | 'premium'
  remainingGenerations: number
  dailyGenerations: number
}

export function SubscriptionCard({ 
  subscriptionTier, 
  remainingGenerations, 
  dailyGenerations 
}: SubscriptionCardProps) {
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async () => {
    if (subscriptionTier === 'premium') return
    
    setUpgrading(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  const isPremium = subscriptionTier === 'premium'
  const usagePercentage = isPremium ? 0 : Math.min((dailyGenerations / 5) * 100, 100)

  return (
    <div className={`rounded-lg p-6 ${
      isPremium 
        ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white' 
        : 'bg-white border border-secondary-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-semibold text-lg ${
            isPremium ? 'text-white' : 'text-secondary-900'
          }`}>
            {isPremium ? 'Premium Plan' : 'Free Plan'}
          </h3>
          {isPremium && (
            <div className="flex items-center mt-1">
              <svg className="w-4 h-4 text-yellow-300 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-primary-100">Active</span>
            </div>
          )}
        </div>
        {isPremium && (
          <div className="text-2xl">🚀</div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="mb-6">
        {isPremium ? (
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">∞</div>
            <div className="text-primary-100 text-sm">Unlimited Generations</div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-secondary-600">Daily Usage</span>
              <span className="text-sm font-medium text-secondary-900">
                {dailyGenerations}/5
              </span>
            </div>
            <div className="w-full bg-secondary-100 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-secondary-600">
              {remainingGenerations > 0 
                ? `${remainingGenerations} generations remaining today`
                : 'Daily limit reached'
              }
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      {!isPremium && (
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-accent-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {upgrading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Upgrading...
            </div>
          ) : (
            'Upgrade to Premium'
          )}
        </button>
      )}

      {/* Premium Features */}
      {!isPremium && (
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <div className="text-sm text-secondary-600 mb-2">Premium includes:</div>
          <ul className="text-sm text-secondary-700 space-y-1">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Unlimited generations
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No watermark
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Priority support
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}