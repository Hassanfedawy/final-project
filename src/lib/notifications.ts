import nodemailer from "nodemailer"
import twilio from "twilio"
import { prisma } from "./db"

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendNotification(
  userId: string,
  type: "DOWN" | "UP" | "ALERT",
  monitorName: string,
  message: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        NotificationPreference: true,
      },
    })

    if (!user || !user.NotificationPreference) return

    const { email, sms, slack, webhook, phoneNumber, slackWebhook, customWebhook } =
      user.NotificationPreference

    // Send email notification
    if (email && user.email) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: `[${type}] Monitor Alert: ${monitorName}`,
        text: message,
        html: `
          <h1>Monitor Alert</h1>
          <p><strong>Status:</strong> ${type}</p>
          <p><strong>Monitor:</strong> ${monitorName}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      })
    }

    // Send SMS notification
    if (sms && phoneNumber) {
      await twilioClient.messages.create({
        body: `[${type}] ${monitorName}: ${message}`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      })
    }

    // Send Slack notification
    if (slack && slackWebhook) {
      await fetch(slackWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `[${type}] ${monitorName}: ${message}`,
        }),
      })
    }

    // Send webhook notification
    if (webhook && customWebhook) {
      await fetch(customWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          monitor: monitorName,
          message,
          timestamp: new Date().toISOString(),
        }),
      })
    }

    // Log the notification
    await prisma.alert.create({
      data: {
        type: "EMAIL",
        userId,
        monitorId: "", // Add monitor ID here
        config: {
          type,
          message,
          channels: {
            email,
            sms,
            slack,
            webhook,
          },
        },
      },
    })
  } catch (error) {
    console.error("Failed to send notification:", error)
    throw error
  }
}
