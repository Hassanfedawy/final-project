import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { createAlert } from "@/lib/notification"
import { AlertType, Status } from "@prisma/client"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Create a test monitor
    const testMonitor = await prisma.monitor.create({
      data: {
        name: "Test Monitor",
        url: "https://example.com",
        userId: session.user.id,
        status: Status.DOWN,
      },
    })

    // Create different types of alerts
    await Promise.all([
      // Down alert
      createAlert(
        testMonitor,
        AlertType.DOWN,
        "Test Monitor is down! This is a test notification."
      ),
      // Slow response alert
      createAlert(
        testMonitor,
        AlertType.SLOW_RESPONSE,
        "Test Monitor response time is high (5000ms). This is a test notification."
      ),
      // Error alert
      createAlert(
        testMonitor,
        AlertType.ERROR,
        "Error monitoring Test Monitor. This is a test notification."
      ),
    ])

    // Clean up test monitor
    await prisma.monitor.delete({
      where: { id: testMonitor.id },
    })

    return NextResponse.json({ 
      success: true,
      message: "Test notifications created successfully. Check your email and notifications panel." 
    })
  } catch (error) {
    console.error("Error in test notifications:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
