import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const [notifications, alerts] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      }),
      prisma.alert.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        include: {
          monitor: {
            select: {
              name: true,
              url: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({ notifications, alerts })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
