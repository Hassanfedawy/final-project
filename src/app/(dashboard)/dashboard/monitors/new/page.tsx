import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { MonitorForm } from "@/components/monitors/monitor-form"

export const metadata: Metadata = {
  title: "Add Monitor",
  description: "Add a new website monitor",
}

export default async function NewMonitorPage() {
  const session = await getServerSession()

  if (!session) {
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
        <MonitorForm
          onSubmit={async (data) => {
            "use server"
            
            const response = await fetch("/api/monitors", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...data,
                userId: session.user.id,
              }),
            })

            if (!response.ok) {
              throw new Error("Failed to create monitor")
            }

            redirect("/dashboard/monitors")
          }}
        />
      </div>
    </div>
  )
}
