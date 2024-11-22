import { NextResponse } from "next/server"
import { runMonitoringJobs } from "@/lib/jobs"

export async function GET() {
  try {
    await runMonitoringJobs()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to run monitoring jobs" },
      { status: 500 }
    )
  }
}
