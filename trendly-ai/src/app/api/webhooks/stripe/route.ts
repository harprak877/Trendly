import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { StripeService, stripe, PAYMENTS_ENABLED } from '@/lib/stripe'
import { DatabaseService } from '@/lib/database'
import { createClerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    if (!PAYMENTS_ENABLED) {
      return NextResponse.json({ ok: true, message: 'Payments disabled' })
    }
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    // Construct the event
    const event = StripeService.constructWebhookEvent(body, signature)
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId
    if (!userId) {
      console.error('No userId in session metadata')
      return
    }

    // Update user subscription tier in database
    await DatabaseService.updateUser(userId, {
      subscription_tier: 'premium'
    })

    // Update Clerk user metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscriptionTier: 'premium',
        stripeCustomerId: session.customer
      }
    })

    console.log(`User ${userId} upgraded to premium`)
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    if (!customer || customer.deleted) {
      console.error('Customer not found')
      return
    }

    // Find user by email
    const userResponse = await clerkClient.users.getUserList({
      emailAddress: [(customer as Stripe.Customer).email || '']
    })

    if (!userResponse.data || userResponse.data.length === 0) {
      console.error('User not found for email:', (customer as Stripe.Customer).email)
      return
    }

    const user = userResponse.data[0]
    const isActive = subscription.status === 'active' || subscription.status === 'trialing'
    const newTier = isActive ? 'premium' : 'free'

    // Update database
    await DatabaseService.updateUser(user.id, {
      subscription_tier: newTier
    })

    // Update Clerk metadata
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        subscriptionTier: newTier,
        stripeCustomerId: customer.id,
        subscriptionStatus: subscription.status
      }
    })

    console.log(`User ${user.id} subscription updated to ${newTier}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    if (!customer || customer.deleted) {
      console.error('Customer not found')
      return
    }

    // Find user by email
    const userResponse = await clerkClient.users.getUserList({
      emailAddress: [(customer as Stripe.Customer).email || '']
    })

    if (!userResponse.data || userResponse.data.length === 0) {
      console.error('User not found for email:', (customer as Stripe.Customer).email)
      return
    }

    const user = userResponse.data[0]

    // Downgrade to free tier
    await DatabaseService.updateUser(user.id, {
      subscription_tier: 'free'
    })

    // Update Clerk metadata
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        subscriptionTier: 'free',
        stripeCustomerId: customer.id,
        subscriptionStatus: 'canceled'
      }
    })

    console.log(`User ${user.id} subscription canceled, downgraded to free`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Payment succeeded for invoice ${invoice.id}`)
    // Additional payment success logic can be added here
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Payment failed for invoice ${invoice.id}`)
    // Additional payment failure logic can be added here
    // e.g., send notification email, suspend account temporarily
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}
