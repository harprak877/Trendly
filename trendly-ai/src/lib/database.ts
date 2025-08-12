import { supabaseAdmin } from './supabase'
import { User, Usage, TrendData } from './supabase'

export interface CreateUserData {
  clerk_user_id: string
  email: string
}

export interface UpdateUserData {
  subscription_tier?: 'free' | 'premium'
  email?: string
}

export class DatabaseService {
  // User management
  static async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: userData.clerk_user_id,
          email: userData.email,
          subscription_tier: 'free'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return null
      }

      // Create initial usage record
      await supabaseAdmin
        .from('usage')
        .insert({
          user_id: data.id,
          daily_generations: 0,
          last_reset_date: new Date().toISOString().split('T')[0]
        })

      return data
    } catch (error) {
      console.error('Error in createUser:', error)
      return null
    }
  }

  static async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error)
        return null
      }

      return data || null
    } catch (error) {
      console.error('Error in getUserByClerkId:', error)
      return null
    }
  }

  static async updateUser(clerkUserId: string, updates: UpdateUserData): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateUser:', error)
      return null
    }
  }

  // Usage management
  static async getUserUsage(clerkUserId: string): Promise<Usage | null> {
    try {
      const user = await this.getUserByClerkId(clerkUserId)
      if (!user) return null

      const { data, error } = await supabaseAdmin
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage:', error)
        return null
      }

      return data || null
    } catch (error) {
      console.error('Error in getUserUsage:', error)
      return null
    }
  }

  static async incrementUserGeneration(clerkUserId: string): Promise<boolean> {
    try {
      const user = await this.getUserByClerkId(clerkUserId)
      if (!user) return false

      const { error } = await supabaseAdmin
        .from('usage')
        .update({
          daily_generations: supabaseAdmin.rpc('increment_daily_generations', { user_id: user.id })
        })
        .eq('user_id', user.id)

      if (error) {
        // Fallback: manual increment
        const usage = await this.getUserUsage(clerkUserId)
        if (!usage) return false

        const { error: updateError } = await supabaseAdmin
          .from('usage')
          .update({
            daily_generations: usage.daily_generations + 1
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error incrementing usage:', updateError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error in incrementUserGeneration:', error)
      return false
    }
  }

  static async checkUserCanGenerate(clerkUserId: string): Promise<{ canGenerate: boolean; remainingGenerations: number }> {
    try {
      const user = await this.getUserByClerkId(clerkUserId)
      if (!user) {
        return { canGenerate: false, remainingGenerations: 0 }
      }

      // Premium users have unlimited generations
      if (user.subscription_tier === 'premium') {
        return { canGenerate: true, remainingGenerations: -1 } // -1 indicates unlimited
      }

      const usage = await this.getUserUsage(clerkUserId)
      if (!usage) {
        return { canGenerate: false, remainingGenerations: 0 }
      }

      const MAX_FREE_GENERATIONS = 5
      const remainingGenerations = Math.max(0, MAX_FREE_GENERATIONS - usage.daily_generations)
      const canGenerate = remainingGenerations > 0

      return { canGenerate, remainingGenerations }
    } catch (error) {
      console.error('Error in checkUserCanGenerate:', error)
      return { canGenerate: false, remainingGenerations: 0 }
    }
  }

  // Trend data
  static async getTrendData(): Promise<TrendData[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('trend_data')
        .select('*')
        .order('date_added', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching trend data:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTrendData:', error)
      return []
    }
  }

  // Daily reset (for cron job)
  static async resetDailyGenerations(): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin.rpc('reset_daily_generations')

      if (error) {
        console.error('Error resetting daily generations:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in resetDailyGenerations:', error)
      return false
    }
  }
}