import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { Status } from "@prisma/client"

// Vercel Cron Job handler
export async function GET(request: Request) {
  try {
    const headersList = headers()
    const authHeader = headersList.get('authorization')
    
    // Verify the request is from Vercel Cron
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get all monitors that need to be checked
    const monitors = await prisma.monitor.findMany({
      where: {
        OR: [
          { lastChecked: null },
          {
            lastChecked: {
              lt: new Date(Date.now() - 60000) // Monitors not checked in last minute
            }
          }
        ]
      },
      include: {
        checks: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
      },
    })

    const results = await Promise.all(
      monitors.map(async (monitor) => {
        try {
          const startTime = Date.now()
          const response = await fetch(monitor.url, {
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
              monitorId: monitor.id,
              status,
              responseTime,
            },
          })

          // Calculate uptime
          const upChecks = monitor.checks.filter(check => check.status === Status.UP).length
          const uptime = monitor.checks.length > 0 
            ? (upChecks / monitor.checks.length) * 100 
            : 100

          // Update monitor status
          await prisma.monitor.update({
            where: { id: monitor.id },
            data: {
              status,
              lastChecked: new Date(),
              uptime,
            },
          })

          // Create alert if needed
          if (status === Status.DOWN) {
            const recentChecks = monitor.checks.slice(0, monitor.alertThreshold)
            const allDown = recentChecks.every(check => check.status === Status.DOWN)

            if (allDown) {
              await prisma.alert.create({
                data: {
                  monitorId: monitor.id,
                  userId: monitor.userId,
                  type: 'EMAIL',
                  config: {
                    message: `Monitor ${monitor.name} is down. Last response time: ${responseTime}ms`,
                    url: monitor.url,
                  },
                  enabled: true,
                },
              })
            }
          }

          return { monitorId: monitor.id, status, responseTime }
        } catch (error) {
          console.error(`Error checking monitor ${monitor.id}:`, error)
          return { monitorId: monitor.id, status: Status.DOWN, responseTime: 0 }
        }
      })
    )

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { success: false, message: "Failed to run monitoring checks" },
      { status: 500 }
    )
  }
}
