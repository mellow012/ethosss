import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendNotificationEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}) => {
  // If credentials are missing, log and skip (prevents crash)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('--- EMAIL NOTIFICATION (MOCK) ---')
    console.log(`To: ${to}\nSubject: ${subject}\nText: ${text}`)
    console.warn('Set SMTP_USER and SMTP_PASS in .env to enable real emails.')
    return
  }

  try {
    await transporter.sendMail({
      from: `"Ethosss Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  await sendNotificationEmail({
    to: email,
    subject: 'Reset Your Password - Ethosss',
    text: `You requested a password reset. Click the link to proceed: ${resetUrl}. This link expires in 1 hour.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #065f46;">Reset Your Password</h2>
        <p>We received a request to reset your password for your Ethosss account.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #065f46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Ethosss Movement - Empowering Sustainable Travel</p>
      </div>
    `
  })
}
