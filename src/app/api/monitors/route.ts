import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/db"

const monitorSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  checkInterval: z.string(),
  alertThreshold: z.string(),
  userId: z.string(),
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
    const validatedData = monitorSchema.parse(body)

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // If user has no subscription, create a free subscription
    if (!user.subscription) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
          status: "ACTIVE",
          startDate: new Date(),
        },
      })
    }

    // Get monitor count
    const monitorCount = await prisma.monitor.count({
      where: {
        userId: validatedData.userId,
      },
    })

    // Get subscription after potential creation
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })

    if (!subscription || subscription.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "No active subscription found. Please contact support." },
        { status: 400 }
      )
    }

    // Check monitor limit based on plan
    const monitorLimit = subscription.plan === "FREE" ? 5 : subscription.plan === "PRO" ? 50 : 999

    if (monitorCount >= monitorLimit) {
      return NextResponse.json(
        { message: `You have reached your monitor limit (${monitorLimit}). Please upgrade your plan to add more monitors.` },
        { status: 400 }
      )
    }

    // Check if URL is already being monitored by this user
    const existingMonitor = await prisma.monitor.findFirst({
      where: {
        userId: validatedData.userId,
        url: validatedData.url,
      },
    })

    if (existingMonitor) {
      return NextResponse.json(
        { message: "You are already monitoring this URL" },
        { status: 400 }
      )
    }

    // Create monitor
    const monitor = await prisma.monitor.create({
      data: {
        name: validatedData.name,
        url: validatedData.url,
        interval: parseInt(validatedData.checkInterval) * 60, // Convert to seconds
        status: "PENDING",
        uptime: 100,
        lastChecked: new Date(),
        userId: validatedData.userId,
      },
    })

    return NextResponse.json(monitor, { status: 201 })
  } catch (error) {
    console.error("Monitor creation error:", error)
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

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      )
    }

    const monitors = await prisma.monitor.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(monitors)
  } catch (error) {
    console.error("Monitor fetch error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const monitorId = searchParams.get("id")

    if (!monitorId) {
      return NextResponse.json(
        { message: "Monitor ID is required" },
        { status: 400 }
      )
    }

    // Check if monitor belongs to user
    const monitor = await prisma.monitor.findFirst({
      where: {
        id: monitorId,
        userId: session.user.id,
      },
    })

    if (!monitor) {
      return NextResponse.json(
        { message: "Monitor not found" },
        { status: 404 }
      )
    }

    await prisma.monitor.delete({
      where: {
        id: monitorId,
      },
    })

    return NextResponse.json(
      { message: "Monitor deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Monitor deletion error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
