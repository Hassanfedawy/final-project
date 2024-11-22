"use client"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, Notification } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"

interface NotificationListProps {
  userId: string
}

export function NotificationList({ userId }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()
      setNotifications(data.notifications)
      setAlerts(data.alerts)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (type: "notification" | "alert", id: string) => {
    try {
      await fetch(`/api/${type}s/${id}/read`, {
        method: "POST",
      })
      fetchNotifications()
    } catch (error) {
      console.error(`Error marking ${type} as read:`, error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Refresh notifications every minute
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length + alerts.filter(a => !a.read).length

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[400px] overflow-auto">
          {alerts.map(alert => (
            <DropdownMenuItem
              key={alert.id}
              className={!alert.read ? "bg-muted/50" : ""}
              onClick={() => markAsRead("alert", alert.id)}
            >
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
          {notifications.map(notification => (
            <DropdownMenuItem
              key={notification.id}
              className={!notification.read ? "bg-muted/50" : ""}
              onClick={() => markAsRead("notification", notification.id)}
            >
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
          {notifications.length === 0 && alerts.length === 0 && (
            <DropdownMenuItem disabled>
              <p className="text-sm text-muted-foreground">No notifications</p>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
