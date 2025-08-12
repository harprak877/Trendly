'use client'

import { useState } from 'react'
import { ContentGenerationResponse } from '@/lib/openai'

interface GenerationRequest {
  topic: string
  types: string[]
  trends_enabled: boolean
}

interface ContentGenerationFormProps {
  onContentGenerated: (content: ContentGenerationResponse, request: GenerationRequest) => void
  canGenerate: boolean
}

export function ContentGenerationForm({ onContentGenerated, canGenerate }: ContentGenerationFormProps) {
  const [topic, setTopic] = useState('')
  const [types, setTypes] = useState<string[]>(['ideas', 'captions', 'hashtags'])
  const [trendsEnabled, setTrendsEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTypeChange = (type: string) => {
    setTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || types.length === 0) {
      setError('Please enter a topic and select at least one content type.')
      return
    }

    if (!canGenerate) {
      setError('You have reached your daily generation limit. Please upgrade to Premium for unlimited generations.')
      return
    }

    setLoading(true)
    setError('')

    const request: GenerationRequest = {
      topic: topic.trim(),
      types,
      trends_enabled: trendsEnabled,
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to generate content')
      }

      const content = await response.json()
      onContentGenerated(content, request)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h2 className="text-xl font-semibold text-secondary-900 mb-6">
        Generate Content
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-secondary-700 mb-2">
            Topic or Keyword
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., healthy breakfast, workout routine, travel tips"
            maxLength={80}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="text-xs text-secondary-500 mt-1">
            {topic.length}/80 characters
          </div>
        </div>

        {/* Content Types */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-3">
            Content Types
          </label>
          <div className="space-y-3">
            {[
              { id: 'ideas', label: 'Content Ideas', description: 'Video concepts and formats' },
              { id: 'captions', label: 'Captions', description: 'Engaging post copy with hooks' },
              { id: 'hashtags', label: 'Hashtags', description: 'Strategic tag combinations' },
            ].map((type) => (
              <label key={type.id} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={types.includes(type.id)}
                  onChange={() => handleTypeChange(type.id)}
                  className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <div>
                  <div className="text-sm font-medium text-secondary-900">{type.label}</div>
                  <div className="text-xs text-secondary-600">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Trends Toggle */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={trendsEnabled}
              onChange={(e) => setTrendsEnabled(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <div>
              <div className="text-sm font-medium text-secondary-900">
                Incorporate TikTok Trends
              </div>
              <div className="text-xs text-secondary-600">
                Use current trending content patterns and formats
              </div>
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-3">
            <div className="text-sm text-error-700">{error}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !canGenerate || !topic.trim() || types.length === 0}
          className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-accent-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            'Generate Content'
          )}
        </button>

        {!canGenerate && (
          <div className="text-center">
            <div className="text-sm text-warning-600 font-medium">
              Daily limit reached
            </div>
            <div className="text-xs text-secondary-600 mt-1">
              Upgrade to Premium for unlimited generations
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
