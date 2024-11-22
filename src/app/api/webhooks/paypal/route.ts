import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

async function verifyPayPalWebhook(
  webhookId: string,
  eventBody: any,
  headers: Headers
) {
  try {
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          webhook_id: webhookId,
          webhook_event: eventBody,
          transmission_id: headers.get("paypal-transmission-id"),
          transmission_time: headers.get("paypal-transmission-time"),
          cert_url: headers.get("paypal-cert-url"),
          auth_algo: headers.get("paypal-auth-algo"),
          transmission_sig: headers.get("paypal-transmission-sig"),
        }),
      }
    )

    const verification = await response.json()
    return verification.verification_status === "SUCCESS"
  } catch (error) {
    console.error("PayPal webhook verification failed:", error)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const headersList = headers()
    const body = await req.json()

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(
      process.env.PAYPAL_WEBHOOK_ID!,
      body,
      headersList
    )

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 400 }
      )
    }

    const {
      resource_type,
      event_type,
      resource: { id: subscriptionId, status },
    } = body

    if (resource_type !== "subscription") {
      return NextResponse.json({ message: "Processed" })
    }

    // Handle different subscription events
    switch (event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: "ACTIVE" },
        })
        break

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: "CANCELLED" },
        })
        break

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: "SUSPENDED" },
        })
        break

      case "BILLING.SUBSCRIPTION.EXPIRED":
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: "EXPIRED" },
        })
        break
    }

    return NextResponse.json({ message: "Processed" })
  } catch (error) {
    console.error("Error processing PayPal webhook:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
