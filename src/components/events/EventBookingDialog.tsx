'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface EventBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
  onSuccess: () => void
  userEmail?: string
  userName?: string
}

export function EventBookingDialog({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onSuccess,
  userEmail,
  userName,
}: EventBookingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: userName || '',
    email: userEmail || '',
    phone: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          ...formData,
        }),
      })

      if (res.ok) {
        toast.success('Successfully booked your spot!')
        onSuccess()
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to book spot')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2rem]">
        <div className="bg-forest p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CheckCircle2 className="h-24 w-24" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black mb-2">Book Your Spot</DialogTitle>
            <DialogDescription className="text-white/80 text-lg">
              {eventTitle}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-forest" /> Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-forest"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold flex items-center gap-2">
                <Mail className="h-4 w-4 text-forest" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-forest"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-bold flex items-center gap-2">
                <Phone className="h-4 w-4 text-forest" /> Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+263 ..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-forest"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-forest" /> Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements or questions?"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-forest resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-forest hover:bg-forest-dark text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-forest/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
