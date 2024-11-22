import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { checkSubscriptionLimits } from "@/lib/subscription"
import { authOptions } from "@/lib/auth"

const createMonitorSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  alertThreshold: z.number().int().min(1).max(10).default(3),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, url, alertThreshold } = createMonitorSchema.parse(body)

    // Check subscription limits
    const { interval } = await checkSubscriptionLimits(session.user.id)

    const monitor = await prisma.monitor.create({
      data: {
        name,
        url,
        alertThreshold,
        interval,
        userId: session.user.id,
      },
    })

    return NextResponse.json(monitor)
  } catch (error) {
    console.error("Error creating monitor:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes("limit reached")) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { message: "Failed to create monitor" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }

  const monitors = await prisma.monitor.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(monitors)
}
