import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { cleanupOldNotifications } from "@/lib/notification"

export async function GET() {
  try {
    const headersList = headers()
    const cronSecret = headersList.get("x-cron-secret")

    // Verify cron secret
    if (cronSecret !== process.env.CRON_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await cleanupOldNotifications()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in cleanup cron:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
