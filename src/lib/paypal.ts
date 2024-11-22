import { prisma } from "@/lib/db"

const PAYPAL_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const PLANS = {
  PRO: process.env.PAYPAL_PRO_PLAN_ID,
  ENTERPRISE: process.env.PAYPAL_ENTERPRISE_PLAN_ID,
}

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET_KEY}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const data = await response.json()
  return data.access_token
}

export async function createSubscription(planId: string, userId: string) {
  try {
    const accessToken = await getAccessToken()
    
    const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        },
      }),
    })

    const data = await response.json()
    
    if (data.id) {
      await prisma.subscription.create({
        data: {
          userId,
          paypalSubscriptionId: data.id,
          planId: planId,
          status: 'PENDING',
        },
      })
    }

    return data
  } catch (error) {
    console.error('Error creating PayPal subscription:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const accessToken = await getAccessToken()
    
    const response = await fetch(
      `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason: 'Cancelled by user',
        }),
      }
    )

    if (response.status === 204) {
      await prisma.subscription.update({
        where: { paypalSubscriptionId: subscriptionId },
        data: { status: 'CANCELLED' },
      })
      return true
    }

    return false
  } catch (error) {
    console.error('Error cancelling PayPal subscription:', error)
    throw error
  }
}

export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const accessToken = await getAccessToken()
    
    const response = await fetch(
      `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching PayPal subscription details:', error)
    throw error
  }
}

export async function createBillingPortalSession(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription?.paypalSubscriptionId) {
    throw new Error('No subscription found')
  }

  // Return PayPal subscription management URL
  return {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/manage?subscription_id=${subscription.paypalSubscriptionId}`,
  }
}
