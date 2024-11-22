"use client"

import { useEffect, useState } from "react"
import { Monitor } from "@prisma/client"
import { MonitorTable } from "./monitor-table"

interface RealTimeMonitorProps {
  initialData: Monitor[]
}

export function RealTimeMonitor({ initialData }: RealTimeMonitorProps) {
  const [monitors, setMonitors] = useState(initialData)

  useEffect(() => {
    // Update monitors every 10 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/monitors')
        if (response.ok) {
          const data = await response.json()
          setMonitors(data.monitors)
        }
      } catch (error) {
        console.error('Error fetching monitors:', error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <MonitorTable
      data={monitors.map((monitor) => ({
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        status: monitor.status,
        uptime: monitor.uptime,
        interval: monitor.interval,
        responseTime: monitor.lastResponseTime || 0,
        lastChecked: monitor.lastChecked,
      }))}
    />
  )
}
