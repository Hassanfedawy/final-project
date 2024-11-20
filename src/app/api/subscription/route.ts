import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { createCheckoutSession, createPortalSession, PLANS } from "@/lib/stripe"

const subscriptionSchema = z.object({
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { plan } = subscriptionSchema.parse(body)

    // Get user's current subscription
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    // If user wants free plan, update subscription directly
    if (plan === "FREE") {
      await prisma.subscription.upsert({
        where: {
          userId: session.user.id,
        },
        create: {
          userId: session.user.id,
          plan: "FREE",
          status: "ACTIVE",
        },
        update: {
          plan: "FREE",
          status: "ACTIVE",
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCustomerId: null,
        },
      })

      return NextResponse.json({ message: "Subscription updated" })
    }

    // For paid plans, create Stripe checkout session
    const priceId = PLANS[plan].stripePriceId

    if (!priceId) {
      return NextResponse.json(
        { message: "Invalid plan selected" },
        { status: 400 }
      )
    }

    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      plan,
      priceId,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Subscription error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { message: "No subscription found" },
        { status: 404 }
      )
    }

    const portalSession = await createPortalSession(subscription.stripeCustomerId)

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Portal session error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
