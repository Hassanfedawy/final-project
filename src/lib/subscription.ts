import { prisma } from "@/lib/db"
import { PLANS } from "./stripe"

export async function checkSubscriptionLimits(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          monitors: true,
        },
      },
    },
  })

  if (!subscription || subscription.status !== "ACTIVE") {
    throw new Error("No active subscription")
  }

  const plan = PLANS[subscription.plan as keyof typeof PLANS]
  const currentMonitors = subscription.user.monitors.length

  if (currentMonitors >= plan.monitors) {
    throw new Error(\`Monitor limit reached for current plan (\${plan.monitors} monitors)\`)
  }

  return {
    ...plan,
    currentMonitors,
    subscription,
  }
}

export async function getSubscriptionDetails(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          monitors: true,
        },
      },
    },
  })

  if (!subscription) {
    return {
      plan: "FREE" as const,
      status: "ACTIVE" as const,
      monitors: {
        current: 0,
        max: PLANS.FREE.monitors,
      },
      features: PLANS.FREE.features,
    }
  }

  const plan = PLANS[subscription.plan as keyof typeof PLANS]
  
  return {
    plan: subscription.plan,
    status: subscription.status,
    monitors: {
      current: subscription.user.monitors.length,
      max: plan.monitors,
    },
    features: plan.features,
    stripeCustomerId: subscription.stripeCustomerId,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  }
}
