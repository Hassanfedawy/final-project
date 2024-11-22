import { Status } from "@prisma/client"

export async function triggerMonitorCheck(monitorId: string): Promise<{
  success: boolean
  status?: Status
  responseTime?: number
  error?: string
}> {
  try {
    const response = await fetch('/api/cron/monitor')
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message)
    }

    const monitorResult = data.results.find(
      (result: any) => result.monitorId === monitorId
    )

    if (!monitorResult) {
      return {
        success: false,
        error: 'Monitor not found in results',
      }
    }

    return {
      success: true,
      status: monitorResult.status,
      responseTime: monitorResult.responseTime,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check monitor',
    }
  }
}
