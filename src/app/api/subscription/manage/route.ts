import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createBillingPortalSession } from "@/lib/paypal"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const portalSession = await createBillingPortalSession(session.user.id)
    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json(
      { message: "Failed to create billing portal session" },
      { status: 500 }
    )
  }
}
