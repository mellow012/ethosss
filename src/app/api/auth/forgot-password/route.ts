import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (error || !user) {
      // For security reasons, don't reveal if user exists or not in the public response
      // But we can return a success message regardless
      return NextResponse.json({ success: true })
    }

    // In a real app, you would:
    // 1. Generate a reset token
    // 2. Store it in the database with an expiration
    // 3. Send an email with the link

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
