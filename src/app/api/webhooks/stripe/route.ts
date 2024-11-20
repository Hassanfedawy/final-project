import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      return NextResponse.json(
        { message: "Webhook signature verification failed" },
        { status: 400 }
      )
    }

    const session = event.data.object as Stripe.Checkout.Session

    switch (event.type) {
      case "checkout.session.completed":
        // Create or update subscription
        await prisma.subscription.update({
          where: {
            userId: session.metadata?.userId,
          },
          data: {
            status: "ACTIVE",
            plan: session.metadata?.plan as "FREE" | "PRO" | "ENTERPRISE",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: session.metadata?.priceId,
          },
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            userId: session.metadata?.userId!,
            amount: session.amount_total! / 100,
            currency: session.currency!,
            status: "SUCCEEDED",
            stripePaymentId: session.payment_intent as string,
          },
        })
        break

      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: "CANCELLED",
            endDate: new Date(subscription.ended_at! * 1000),
          },
        })
        break

      case "invoice.payment_failed":
        const invoice = event.data.object as Stripe.Invoice
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: invoice.subscription as string,
          },
          data: {
            status: "EXPIRED",
          },
        })
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json(
      { message: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
