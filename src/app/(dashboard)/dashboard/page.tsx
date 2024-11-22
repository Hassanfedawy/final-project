import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { RealTimeMonitor } from "@/components/monitors/real-time-monitor"
import { MonitorChart } from "@/components/monitors/monitor-chart"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { SubscriptionCard } from "@/components/subscription/subscription-card"


export const metadata: Metadata = {
  title: "Dashboard",
  description: "Monitor your websites and services",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const { data: subscription } = await getSubscriptionDetails(userId)

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch user's monitors with their latest checks
  const monitors = await prisma.monitor.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      checks: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  })

  // Get all checks for the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const allChecks = await prisma.check.findMany({
    where: {
      monitor: {
        userId: session.user.id,
      },
      timestamp: {
        gte: twentyFourHoursAgo,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
    include: {
      monitor: {
        select: {
          name: true,
          url: true,
        },
      },
    },
  })

  // Group checks by hour for the response time chart
  const hourlyChecks = allChecks.reduce((acc, check) => {
    const hour = new Date(check.timestamp).getHours()
    if (!acc[hour]) {
      acc[hour] = {
        count: 0,
        totalResponseTime: 0,
        upCount: 0,
      }
    }
    acc[hour].count++
    acc[hour].totalResponseTime += check.responseTime
    if (check.status === 'UP') acc[hour].upCount++
    return acc
  }, {} as Record<number, { count: number; totalResponseTime: number; upCount: number }>)

  // Create chart data arrays
  const responseTimeData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = hourlyChecks[hour] || { count: 0, totalResponseTime: 0 }
    return {
      timestamp: new Date(twentyFourHoursAgo.getTime() + hour * 3600000).toISOString(),
      responseTime: hourData.count ? Math.round(hourData.totalResponseTime / hourData.count) : 0,
    }
  })

  const uptimeData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = hourlyChecks[hour] || { count: 0, upCount: 0 }
    return {
      timestamp: new Date(twentyFourHoursAgo.getTime() + hour * 3600000).toISOString(),
      responseTime: hourData.count ? (hourData.upCount / hourData.count) * 100 : 100,
    }
  })

  // Calculate incidents (response time > 1000ms or status DOWN)
  const incidentData = Array.from({ length: 24 }, (_, hour) => {
    const hourChecks = allChecks.filter(check => 
      new Date(check.timestamp).getHours() === hour &&
      (check.status === 'DOWN' || check.responseTime > 1000)
    )
    return {
      timestamp: new Date(twentyFourHoursAgo.getTime() + hour * 3600000).toISOString(),
      responseTime: hourChecks.length,
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage your websites and services.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/monitors/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Monitor
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MonitorChart
          data={responseTimeData}
          title="Response Times"
          description="Average response times by hour"
        />
        <MonitorChart
          data={uptimeData}
          title="Uptime"
          description="Hourly uptime percentage"
        />
        <MonitorChart
          data={incidentData}
          title="Incidents"
          description="Number of incidents per hour"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium">Your Monitors</h3>
        <div className="mt-4">
          <RealTimeMonitor initialData={monitors} />
        </div>
      </div>
      <SubscriptionCard
    plan={subscription.plan}
    status={subscription.status}
    monitors={subscription.monitors}
    features={subscription.features}
    stripeCustomerId={subscription.stripeCustomerId}
    cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
  />
    </div>
  )
}
