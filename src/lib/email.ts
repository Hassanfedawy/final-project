import nodemailer from 'nodemailer'

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    // Use an App Password, not your regular Gmail password
    // Generate one at: https://myaccount.google.com/apppasswords
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendNotificationEmail({
  to,
  subject,
  message,
}: {
  to: string
  subject: string
  message: string
}) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <p style="color: #666; line-height: 1.5;">${message}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;"/>
          <p style="color: #888; font-size: 0.9em;">
            You received this email because you have notifications enabled for your Uptime Monitor.
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
