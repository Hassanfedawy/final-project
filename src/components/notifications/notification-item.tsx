import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertType } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"

interface NotificationItemProps {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
  type: AlertType
  onMarkAsRead: (id: string) => void
}

const getAlertColor = (type: AlertType) => {
  switch (type) {
    case "DOWN":
      return "bg-red-500"
    case "UP":
      return "bg-green-500"
    case "SLOW_RESPONSE":
      return "bg-yellow-500"
    case "ERROR":
      return "bg-orange-500"
    default:
      return "bg-blue-500"
  }
}

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case "DOWN":
      return "🔴"
    case "UP":
      return "🟢"
    case "SLOW_RESPONSE":
      return "🟡"
    case "ERROR":
      return "⚠️"
    default:
      return "ℹ️"
  }
}

export function NotificationItem({
  id,
  title,
  message,
  createdAt,
  read,
  type,
  onMarkAsRead,
}: NotificationItemProps) {
  return (
    <button
      onClick={() => onMarkAsRead(id)}
      className={cn(
        "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors relative group",
        !read && "bg-muted/30"
      )}
    >
      <div className={cn(
        "w-2 h-2 rounded-full mt-2",
        getAlertColor(type)
      )} />
      <div className="flex-1 grid gap-1 min-w-0">
        <div className="grid gap-1">
          <div className="font-medium line-clamp-1">
            {title}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            {message}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getAlertIcon(type)}</span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      {!read && (
        <div className="absolute right-4 top-4">
          <Badge 
            variant="secondary"
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
        </div>
      )}
    </button>
  )
}
