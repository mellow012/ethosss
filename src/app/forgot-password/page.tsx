'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-2 bg-forest" />
        <CardHeader className="space-y-1 pb-4">
          <Link href="/login" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-forest transition-colors mb-4">
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Forgot <span className="text-forest">Password</span></CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 bg-forest/10 rounded-2xl flex items-center justify-center mx-auto text-forest">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <span className="font-bold text-foreground">{email}</span>.
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                Try another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-forest"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-forest hover:bg-forest-dark text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-forest/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
