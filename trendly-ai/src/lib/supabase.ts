import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types
export interface User {
  id: string
  clerk_user_id: string
  email: string
  subscription_tier: 'free' | 'premium'
  created_at: string
}

export interface Usage {
  id: string
  user_id: string
  daily_generations: number
  last_reset_date: string
}

export interface TrendData {
  trend_id: string
  platform: string
  title: string
  description: string
  date_added: string
}