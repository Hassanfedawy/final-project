import { NextResponse } from "next/server"
import { checkAllMonitors } from "@/lib/monitoring"
import { headers } from "next/headers"

export async function GET() {
  try {
    const headersList = headers()
    const cronSecret = headersList.get("x-cron-secret")

    // Verify cron secret
    if (cronSecret !== process.env.CRON_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await checkAllMonitors()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in cron monitor:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
