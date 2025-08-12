import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-secondary-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Trendly.ai
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/dashboard"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
            Generate Trending
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent block">
              TikTok Content
            </span>
            in Seconds
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
            AI-powered content generator that uses current TikTok trends to create engaging 
            content ideas, captions, and hashtags. Perfect for creators, influencers, and social media managers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-lg">
                  Start Creating for Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-lg inline-block"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <button className="border-2 border-secondary-300 text-secondary-700 px-8 py-4 rounded-lg text-lg font-medium hover:border-secondary-400 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Everything you need to go viral
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Our AI analyzes current TikTok trends and generates content tailored to your niche
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Content Ideas</h3>
              <p className="text-secondary-600">
                Get specific, actionable video ideas based on trending formats and your topic
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Engaging Captions</h3>
              <p className="text-secondary-600">
                Craft compelling captions with hooks and calls-to-action that drive engagement
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Trending Hashtags</h3>
              <p className="text-secondary-600">
                Strategic hashtag combinations mixing viral, niche, and descriptive tags
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-secondary-600">
              Start free, upgrade when you need more
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">Free</h3>
              <p className="text-secondary-600 mb-6">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-secondary-900">$0</span>
                <span className="text-secondary-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5 generations per day
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All content types
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  TikTok trends integration
                </li>
                <li className="flex items-center text-secondary-500">
                  <svg className="w-5 h-5 text-secondary-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Watermark included
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="w-full bg-secondary-100 text-secondary-900 py-3 px-4 rounded-lg font-medium hover:bg-secondary-200 transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/dashboard"
                  className="w-full bg-secondary-100 text-secondary-900 py-3 px-4 rounded-lg font-medium hover:bg-secondary-200 transition-colors inline-block text-center"
                >
                  Current Plan
                </Link>
              </SignedIn>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl shadow-lg p-8 text-white relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-primary-100 mb-6">For serious creators</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-primary-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited generations
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No watermark
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Early access to new features
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="w-full bg-white text-primary-600 py-3 px-4 rounded-lg font-medium hover:bg-primary-50 transition-colors">
                    Start Premium
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/dashboard"
                  className="w-full bg-white text-primary-600 py-3 px-4 rounded-lg font-medium hover:bg-primary-50 transition-colors inline-block text-center"
                >
                  Upgrade Now
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4 md:mb-0">
              Trendly.ai
            </div>
            <div className="text-secondary-400">
              © 2024 Trendly.ai. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
