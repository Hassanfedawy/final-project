"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Bell,
  Clock,
  CreditCard,
  Globe,
  LayoutDashboard,
  Settings,
} from "lucide-react"

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Monitors",
    href: "/dashboard/monitors",
    icon: Globe,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Uptime",
    href: "/dashboard/uptime",
    icon: Clock,
  },
  {
    name: "Alerts",
    href: "/dashboard/alerts",
    icon: Bell,
  },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
