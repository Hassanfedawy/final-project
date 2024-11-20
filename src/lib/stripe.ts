import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    monitors: 5,
    interval: 300, // 5 minutes
    features: [
      "5 monitors",
      "5-minute check interval",
      "Email notifications",
      "24-hour data retention",
    ],
  },
  PRO: {
    name: "Pro",
    price: 29,
    monitors: 50,
    interval: 60, // 1 minute
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "50 monitors",
      "1-minute check interval",
      "Email & SMS notifications",
      "Slack integration",
      "30-day data retention",
      "Custom alerts",
      "API access",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 99,
    monitors: 999,
    interval: 30, // 30 seconds
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Unlimited monitors",
      "30-second check interval",
      "All Pro features",
      "Custom webhook",
      "90-day data retention",
      "Priority support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
}

export async function createCheckoutSession({
  userId,
  plan,
  priceId,
}: {
  userId: string
  plan: keyof typeof PLANS
  priceId: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: \`\${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.NEXTAUTH_URL}/pricing\`,
    metadata: {
      userId,
      plan,
      priceId,
    },
  })

  return session
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: \`\${process.env.NEXTAUTH_URL}/dashboard\`,
  })

  return session
}
