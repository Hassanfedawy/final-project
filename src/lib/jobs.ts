import { updateMonitorStatus } from './monitoring'
import { prisma } from './db'

export async function runMonitoringJobs() {
  try {
    const monitors = await prisma.monitor.findMany({
      where: {
        OR: [
          { lastChecked: null },
          {
            lastChecked: {
              lt: new Date(Date.now() - 1000) // Checks older than 1 second
            }
          }
        ]
      },
    })

    await Promise.all(
      monitors.map(monitor => updateMonitorStatus(monitor.id))
    )
  } catch (error) {
    console.error('Error running monitoring jobs:', error)
  }
}
