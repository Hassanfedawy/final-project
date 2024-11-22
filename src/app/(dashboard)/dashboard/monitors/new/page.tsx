import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { MonitorForm } from "@/components/monitors/monitor-form"
import { authOptions } from "@/lib/auth"  // Add this import

export const metadata: Metadata = {
  title: "Add Monitor",
  description: "Add a new website monitor",
}

export default async function NewMonitorPage() {
  const session = await getServerSession(authOptions)  // Add authOptions

  if (!session?.user?.id) {  // Check specifically for user.id
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Monitor</h2>
        <p className="text-muted-foreground">
          Create a new monitor to track your website&apos;s uptime and performance.
        </p>
      </div>

      <div className="max-w-2xl">
        <MonitorForm userId={session.user.id} />  {/* Pass userId to the form */}
      </div>
    </div>
  )
}