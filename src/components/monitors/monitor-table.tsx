"use client"

import { Monitor } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'

interface MonitorTableProps {
  data: Monitor[]
}

export function MonitorTable({ data }: MonitorTableProps) {
  const columns: ColumnDef<Monitor>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {row.original.url}
        </a>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge
            variant={
              status === "UP"
                ? "success"
                : status === "DOWN"
                ? "destructive"
                : "secondary"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "uptime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Uptime
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const uptime = parseFloat(row.original.uptime.toString())
        return (
          <div className="text-right font-medium">
            {uptime.toFixed(2)}%
          </div>
        )
      },
    },
    {
      accessorKey: "lastResponseTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Response Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const responseTime = row.original.lastResponseTime || 0
        return (
          <div className="text-right font-medium">
            {responseTime}ms
          </div>
        )
      },
    },
    {
      accessorKey: "lastChecked",
      header: "Last Checked",
      cell: ({ row }) => {
        const lastChecked = row.original.lastChecked
        return lastChecked ? (
          <div className="text-right font-medium">
            {formatDistanceToNow(new Date(lastChecked), { addSuffix: true })}
          </div>
        ) : (
          <div className="text-right text-gray-500">Never</div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const monitor = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(monitor.url)}
              >
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Implement delete functionality
                }}
              >
                Delete Monitor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return <DataTable columns={columns} data={data} />
}
