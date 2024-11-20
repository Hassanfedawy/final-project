"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "@prisma/client"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface MonitorChartProps {
  checks?: Check[]
}

export function MonitorChart({ checks = [] }: MonitorChartProps) {
  const data = checks.map((check) => ({
    timestamp: new Date(check.timestamp).toLocaleTimeString(),
    responseTime: check.responseTime,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
              tickFormatter={(value) => `${value}ms`}
            />
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <Tooltip />
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
