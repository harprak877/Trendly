import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

export const STRIPE_CONFIG = {
  premiumPriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export interface CreateCheckoutSessionParams {
  priceId: string
  userId: string
  userEmail: string
  successUrl?: string
  cancelUrl?: string
}

export class StripeService {
  static async createCheckoutSession({
    priceId,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session | null> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer_email: userEmail,
        metadata: {
          userId,
        },
        success_url: successUrl || `${STRIPE_CONFIG.appUrl}/dashboard?success=true`,
        cancel_url: cancelUrl || `${STRIPE_CONFIG.appUrl}/dashboard?canceled=true`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      })

      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return null
    }
  }

  static async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      return session
    } catch (error) {
      console.error('Error retrieving session:', error)
      return null
    }
  }

  static async createCustomerPortalSession(customerId: string): Promise<Stripe.BillingPortal.Session | null> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${STRIPE_CONFIG.appUrl}/dashboard`,
      })

      return session
    } catch (error) {
      console.error('Error creating customer portal session:', error)
      return null
    }
  }

  static async getSubscriptionStatus(customerId: string): Promise<{
    isActive: boolean
    status: string | null
    subscription: Stripe.Subscription | null
  }> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 1,
      })

      if (subscriptions.data.length === 0) {
        return { isActive: false, status: null, subscription: null }
      }

      const subscription = subscriptions.data[0]
      const isActive = subscription.status === 'active' || subscription.status === 'trialing'

      return {
        isActive,
        status: subscription.status,
        subscription,
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return { isActive: false, status: null, subscription: null }
    }
  }

  static constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event | null {
    try {
      return stripe.webhooks.constructEvent(payload, signature, STRIPE_CONFIG.webhookSecret)
    } catch (error) {
      console.error('Error constructing webhook event:', error)
      return null
    }
  }
}