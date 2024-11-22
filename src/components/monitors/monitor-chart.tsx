"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartData {
  timestamp: string
  responseTime: number
  monitorName?: string
}

interface MonitorChartProps {
  data: ChartData[]
  title: string
  description: string
}

export function MonitorChart({ data, title, description }: MonitorChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${title.includes("Uptime") ? "%" : "ms"}`}
            />
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <Tooltip 
              formatter={(value: number) => [`${value}${title.includes("Uptime") ? "%" : "ms"}`, title]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorResponseTime)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
