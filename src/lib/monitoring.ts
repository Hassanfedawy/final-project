import { prisma } from "./db"
import { Monitor, Status, AlertType } from "@prisma/client"
import { createAlert } from "./notification"

const MAX_RESPONSE_TIME = 5000 // 5 seconds

export async function checkUrl(url: string): Promise<{ status: Status; responseTime: number }> {
  const startTime = Date.now()
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    const responseTime = Date.now() - startTime
    return {
      status: response.ok ? Status.UP : Status.DOWN,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: Status.DOWN,
      responseTime,
    }
  }
}

export async function updateMonitorStatus(monitor: Monitor) {
  try {
    const { status, responseTime } = await checkUrl(monitor.url)
    
    // Create a check record
    await prisma.check.create({
      data: {
        monitorId: monitor.id,
        status,
        responseTime,
      },
    })

    // Get recent checks to determine if we need to alert
    const recentChecks = await prisma.check.findMany({
      where: {
        monitorId: monitor.id,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: monitor.alertThreshold,
    })

    const consecutiveFailures = recentChecks.filter(
      check => check.status === Status.DOWN
    ).length

    // Calculate uptime based on the last 100 checks
    const last100Checks = await prisma.check.findMany({
      where: {
        monitorId: monitor.id,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 100,
    })

    const upChecks = last100Checks.filter(check => check.status === Status.UP).length
    const uptime = (upChecks / last100Checks.length) * 100

    // Update monitor status
    await prisma.monitor.update({
      where: { id: monitor.id },
      data: {
        status,
        lastChecked: new Date(),
        lastResponseTime: responseTime,
        uptime,
      },
    })

    // Handle alerts
    if (consecutiveFailures >= monitor.alertThreshold) {
      // Create DOWN alert
      await createAlert(
        monitor,
        AlertType.DOWN,
        `Monitor ${monitor.name} is down. ${consecutiveFailures} consecutive failures.`
      )
    } else if (status === Status.UP && monitor.status === Status.DOWN) {
      // Create UP alert when monitor recovers
      await createAlert(
        monitor,
        AlertType.UP,
        `Monitor ${monitor.name} is back up.`
      )
    } else if (responseTime > MAX_RESPONSE_TIME) {
      // Create slow response alert
      await createAlert(
        monitor,
        AlertType.SLOW_RESPONSE,
        `Monitor ${monitor.name} response time (${responseTime}ms) exceeds threshold (${MAX_RESPONSE_TIME}ms).`
      )
    }

    return { status, responseTime }
  } catch (error) {
    console.error(`Error updating monitor status for ${monitor.name}:`, error)
    // Create error alert
    await createAlert(
      monitor,
      AlertType.ERROR,
      `Error monitoring ${monitor.name}: ${error.message}`
    )
    throw error
  }
}

export async function checkAllMonitors() {
  try {
    const monitors = await prisma.monitor.findMany()
    return await Promise.all(
      monitors.map(monitor => updateMonitorStatus(monitor))
    )
  } catch (error) {
    console.error("Error checking all monitors:", error)
    throw error
  }
}