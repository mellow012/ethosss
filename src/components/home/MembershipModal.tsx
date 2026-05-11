'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  CheckCircle2, 
  Star, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const MEMBERSHIPS = [
  {
    id: 'supporter',
    name: 'Supporter',
    price: 10,
    description: 'Perfect for individuals who want to stay connected.',
    features: ['Impact Newsletter', 'Digital Badge', 'Early News Access'],
    color: 'forest'
  },
  {
    id: 'advocate',
    name: 'Eco-Advocate',
    price: 45,
    description: 'For those deeply committed to change.',
    features: ['Exclusive Webinars', '10% Hotel Discount', 'Tree Planting'],
    featured: true,
    color: 'gold'
  },
  {
    id: 'champion',
    name: 'Champion',
    price: 450,
    period: 'yr',
    description: 'Driving major change across Africa.',
    features: ['VIP Invitations', 'Print Impact Report', 'Founder Access'],
    color: 'bark'
  }
]

interface MembershipModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)

  const handleJoin = async (planId: string, planName: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (res.ok) {
        toast.success(`Welcome to the mission as a ${planName}!`)
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to join membership')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden border-none bg-white dark:bg-bark max-h-[90vh] flex flex-col">
        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-10 space-y-4">
            <DialogTitle className="text-3xl md:text-4xl font-black text-foreground">Choose Your Impact</DialogTitle>
            <DialogDescription className="text-muted-foreground text-lg">
              Join our community of supporters and help fund sustainable growth across Africa.
            </DialogDescription>
            
            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-xs font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-forest' : 'text-muted-foreground'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-7 rounded-full bg-muted border-2 border-muted-foreground/20 relative p-1 transition-colors"
              >
                <motion.div 
                  animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                  className="w-5 h-5 rounded-full bg-forest shadow-md"
                />
              </button>
              <span className={`text-xs font-black uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-forest' : 'text-muted-foreground'}`}>
                Yearly <span className="text-[10px] bg-gold/20 text-earth font-black px-2 py-0.5 rounded-full ml-1">SAVE 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MEMBERSHIPS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-[2rem] border-2 transition-all flex flex-col ${
                  plan.featured 
                    ? 'border-gold bg-bark text-white shadow-xl shadow-gold/5' 
                    : 'border-muted bg-muted/30'
                }`}
              >
                <div className="flex-grow space-y-6">
                  <div>
                    <h3 className={`text-lg font-black uppercase tracking-wider mb-2 ${plan.featured ? 'text-gold' : 'text-forest'}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">${billingCycle === 'yearly' ? (plan.period === 'yr' ? plan.price : Math.round(plan.price * 10 * 0.8)) : plan.price}</span>
                      <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">/{plan.period || (billingCycle === 'yearly' ? 'yr' : 'mo')}</span>
                    </div>
                  </div>

                  <div className={`space-y-3 pt-6 border-t ${plan.featured ? 'border-white/10' : 'border-muted'}`}>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.featured ? 'text-gold' : 'text-forest'}`} />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => handleJoin(plan.id, plan.name)}
                  disabled={loading}
                  className={`w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] mt-8 transition-all ${
                    plan.featured 
                      ? 'bg-gold hover:bg-gold-dark text-bark' 
                      : 'bg-forest hover:bg-forest-dark text-white'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Join Now'
                  )}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest border-t pt-8">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-gold" /> Secure Payment</span>
            <span className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-gold" /> Global Membership</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-gold" /> Instant Access</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
