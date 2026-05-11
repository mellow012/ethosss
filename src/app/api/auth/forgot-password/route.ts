import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { sendResetPasswordEmail } from '@/lib/nodemailer'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email }
    })

    // We return success even if user not found for security (prevent email enumeration)
    if (!user) {
      return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' })
    }

    const token = uuidv4()
    const expiry = new Date(Date.now() + 3600000) // 1 hour

    await (db.user as any).update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    })

    await sendResetPasswordEmail(email, token)

    return NextResponse.json({ message: 'Reset link sent successfully.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
