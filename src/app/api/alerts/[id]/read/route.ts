import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const alert = await prisma.alert.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error("Error marking alert as read:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
