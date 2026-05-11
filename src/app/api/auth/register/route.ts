import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { createNotification, notifyAdmins } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const { data: user, error } = await supabaseAdmin
      .from('User')
      .insert({
        id: uuidv4(),
        email,
        name: name || null,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select('id, email, name, role, createdAt')
      .single()

    if (error) throw error

    // Create Welcome Notification
    try {
      await createNotification({
        userId: user.id,
        title: 'Welcome to Ethosss!',
        message: `Hi ${user.name || 'there'}! We're thrilled to have you join our movement for a sustainable future.`,
        type: 'success',
        link: '/dashboard'
      });

      // Notify Admins
      await notifyAdmins({
        title: 'New User Joined',
        message: `${user.name || user.email} just created an account.`,
        type: 'info',
        link: `/admin?tab=users`
      });
    } catch (notifErr) {
      console.error("Failed to send signup notifications:", notifErr);
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Failed to create account', details: error.message },
      { status: 500 }
    )
  }
}
