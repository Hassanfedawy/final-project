import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { MonitorTable } from "@/components/monitors/monitor-table"
import { MonitorChart } from "@/components/monitors/monitor-chart"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Monitor your websites and services",
}

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user's monitors
  const monitors = await prisma.monitor.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Mock data for the chart
  const mockChartData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    responseTime: Math.floor(Math.random() * 500) + 100,
  })).reverse()

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
          data={mockChartData}
          title="Response Times"
          description="Average response times over the last 24 hours"
        />
        <MonitorChart
          data={mockChartData.map(d => ({
            ...d,
            responseTime: Math.floor(Math.random() * 100),
          }))}
          title="Uptime"
          description="Uptime percentage over the last 24 hours"
        />
        <MonitorChart
          data={mockChartData.map(d => ({
            ...d,
            responseTime: Math.floor(Math.random() * 1000) + 500,
          }))}
          title="Incidents"
          description="Number of incidents over the last 24 hours"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium">Your Monitors</h3>
        <div className="mt-4">
          <MonitorTable
            data={monitors.map((monitor) => ({
              id: monitor.id,
              name: monitor.name,
              url: monitor.url,
              status: monitor.status,
              uptime: monitor.uptime,
              responseTime: monitor.lastResponseTime || 0,
              lastChecked: monitor.lastCheckedAt || new Date(),
            }))}
          />
        </div>
      </div>
    </div>
  )
}
