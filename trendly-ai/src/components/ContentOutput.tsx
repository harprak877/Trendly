'use client'

import { useState } from 'react'
import { ContentGenerationResponse } from '@/lib/openai'
import { copyToClipboard } from '@/lib/utils'

interface ContentOutputProps {
  content: ContentGenerationResponse
  onRegenerate: () => void
  showWatermark: boolean
}

export function ContentOutput({ content, onRegenerate, showWatermark }: ContentOutputProps) {
  const [activeTab, setActiveTab] = useState<'ideas' | 'captions' | 'hashtags'>('ideas')
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const handleCopy = async (text: string, itemId: string) => {
    try {
      await copyToClipboard(text)
      setCopiedItem(itemId)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleCopyAll = async (items: string[], type: string) => {
    try {
      const text = items.join('\n\n')
      await copyToClipboard(text)
      setCopiedItem(`all-${type}`)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const tabs = [
    { id: 'ideas' as const, label: 'Ideas', icon: '💡', count: content.ideas.length },
    { id: 'captions' as const, label: 'Captions', icon: '✍️', count: content.captions.length },
    { id: 'hashtags' as const, label: 'Hashtags', icon: '🏷️', count: content.hashtags.length },
  ].filter(tab => {
    const items = content[tab.id]
    return items && items.length > 0
  })

  const renderContent = (items: string[], type: string) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center text-secondary-500 py-8">
          No {type} generated
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Copy All Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-secondary-900 capitalize">
            {type} ({items.length})
          </h3>
          <button
            onClick={() => handleCopyAll(items, type)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg transition-colors"
          >
            {copiedItem === `all-${type}` ? (
              <>
                <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-success-700">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy All</span>
              </>
            )}
          </button>
        </div>

        {/* Content Items */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const itemId = `${type}-${index}`
            return (
              <div
                key={index}
                className="bg-secondary-50 rounded-lg p-4 border border-secondary-200 hover:border-secondary-300 transition-colors group"
              >
                <div className="flex justify-between items-start space-x-3">
                  <div className="flex-1">
                    {type === 'hashtags' ? (
                      <div className="flex flex-wrap gap-2">
                        {item.split(' ').map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary-800 whitespace-pre-wrap">{item}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(item, itemId)}
                    className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 px-2 py-1 text-xs bg-white hover:bg-secondary-100 text-secondary-600 rounded border transition-all"
                  >
                    {copiedItem === itemId ? (
                      <>
                        <svg className="w-3 h-3 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-success-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
      {/* Header */}
      <div className="border-b border-secondary-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-secondary-900">
            Generated Content
          </h2>
          <button
            onClick={onRegenerate}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Regenerate</span>
          </button>
        </div>

        {/* Watermark Notice */}
        {showWatermark && (
          <div className="mt-4 bg-warning-50 border border-warning-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-warning-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-warning-700">
                Watermark included in free plan. Upgrade to Premium to remove watermarks.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {renderContent(content[activeTab], activeTab)}
      </div>
    </div>
  )
}
