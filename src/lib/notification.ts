import { prisma } from "./db"
import { Monitor, AlertType, NotificationType } from "@prisma/client"
import { sendNotificationEmail } from "./email"

export async function createAlert(
  monitor: Monitor,
  type: AlertType,
  message: string
) {
  try {
    // Create the alert
    const alert = await prisma.alert.create({
      data: {
        monitorId: monitor.id,
        userId: monitor.userId,
        type,
        message,
      },
    })

    // Create a corresponding notification
    await createNotification({
      userId: monitor.userId,
      type: NotificationType.ALERT,
      title: `Monitor Alert: ${monitor.name}`,
      message,
    })

    // Get user's email for critical alerts
    if (type === AlertType.DOWN || type === AlertType.ERROR) {
      const user = await prisma.user.findUnique({
        where: { id: monitor.userId },
        select: { email: true },
      })

      if (user?.email) {
        await sendNotificationEmail({
          to: user.email,
          subject: `Alert: ${monitor.name} - ${type}`,
          message,
        })
      }
    }

    return alert
  } catch (error) {
    console.error("Error creating alert:", error)
    throw error
  }
}

export async function createNotification({
  userId,
  type,
  title,
  message,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function markAlertAsRead(alertId: string) {
  try {
    return await prisma.alert.update({
      where: { id: alertId },
      data: { read: true },
    })
  } catch (error) {
    console.error("Error marking alert as read:", error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    return await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Error getting unread notifications:", error)
    throw error
  }
}

export async function getUnreadAlerts(userId: string) {
  try {
    return await prisma.alert.findMany({
      where: {
        userId,
        read: false,
      },
      include: {
        monitor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Error getting unread alerts:", error)
    throw error
  }
}

// Cleanup old notifications (older than 30 days)
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    await Promise.all([
      prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
          read: true,
        },
      }),
      prisma.alert.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
          read: true,
        },
      }),
    ])
  } catch (error) {
    console.error("Error cleaning up old notifications:", error)
  }
}
