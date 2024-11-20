import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { MonitorTable } from "@/components/monitors/monitor-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Monitors",
  description: "Manage your website monitors",
}

export default async function MonitorsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  const monitors = await prisma.monitor.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monitors</h2>
          <p className="text-muted-foreground">
            View and manage your website monitors.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/monitors/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Monitor
          </Link>
        </Button>
      </div>

      <div>
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
  )
}
