import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { Status } from "@prisma/client"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Create a test monitor
    const testMonitor = await prisma.monitor.create({
      data: {
        name: "Test Monitor",
        url: "https://www.google.com", // A reliable URL for testing
        userId: session.user.id,
        interval: 60, // 1 minute
        alertThreshold: 2,
        status: Status.PENDING,
      },
    })

    // Trigger an immediate check
    const startTime = Date.now()
    const response = await fetch(testMonitor.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Monitor Bot'
      },
    })
    const endTime = Date.now()
    const responseTime = endTime - startTime
    const status = response.ok ? Status.UP : Status.DOWN

    // Create check record
    await prisma.check.create({
      data: {
        monitorId: testMonitor.id,
        status,
        responseTime,
      },
    })

    // Update monitor status
    const updatedMonitor = await prisma.monitor.update({
      where: { id: testMonitor.id },
      data: {
        status,
        lastChecked: new Date(),
        uptime: 100, // Initial uptime
      },
    })

    return NextResponse.json({
      success: true,
      monitor: updatedMonitor,
      checkResult: {
        status,
        responseTime,
      },
    })
  } catch (error) {
    console.error('Error in test monitor:', error)
    return NextResponse.json(
      { success: false, message: "Failed to create and test monitor" },
      { status: 500 }
    )
  }
}
