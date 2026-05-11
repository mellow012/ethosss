'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        toast.success(data.message)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold">Invalid Link</h3>
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or missing a token.
        </p>
        <Button onClick={() => router.push('/forgot-password')} className="mt-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">
          Request new link
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto text-green-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold">Password Reset!</h3>
        <p className="text-sm text-muted-foreground">
          Your password has been updated. Redirecting you to login...
        </p>
        <Button onClick={() => router.push('/login')} className="mt-4 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-forest text-white">
          Login Now
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" title="At least 8 characters" className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-forest"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-forest"
            />
          </div>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-forest hover:bg-forest-dark text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-forest/20">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Reset Password'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-2 bg-forest" />
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Set New <span className="text-forest">Password</span></CardTitle>
          <CardDescription>
            Create a strong password to secure your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-forest" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
