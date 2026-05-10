'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  causeName?: string
}

const AMOUNTS = [10, 25, 50, 100]

export function DonationModal({ isOpen, onClose, causeName }: DonationModalProps) {
  const [amount, setAmount] = useState<number | string>(25)
  const [method, setMethod] = useState<'card' | 'mobile' | 'bank'>('card')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleDonate = async () => {
    setLoading(true)
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      toast.success('Thank you for your generous support!')
      onClose()
      setStep(1)
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none bg-bark-dark/95 backdrop-blur-xl">
        <div className="relative">
          {/* Header Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent pointer-events-none" />
          
          <div className="p-8 relative">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sunlight/10 text-sunlight mb-2">
                      <Heart className="h-6 w-6 fill-current" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white">Support {causeName || 'Our Mission'}</DialogTitle>
                    <DialogDescription className="text-sunlight/60">
                      Your contribution directly funds environmental conservation and community development across Africa.
                    </DialogDescription>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAmount(a)}
                        className={`py-3 rounded-xl border-2 transition-all font-bold ${
                          amount === a 
                            ? 'border-sunlight bg-sunlight/10 text-sunlight' 
                            : 'border-white/5 bg-white/5 text-white/60 hover:border-white/20'
                        }`}
                      >
                        ${a}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                    <Input
                      type="number"
                      placeholder="Other Amount"
                      className="pl-8 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-sunlight"
                      value={amount === 10 || amount === 25 || amount === 50 || amount === 100 ? '' : amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Payment Method</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setMethod('card')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          method === 'card' ? 'border-sunlight bg-sunlight/10 text-sunlight' : 'border-white/5 bg-white/5 text-white/40'
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="text-[10px] font-bold">CARD</span>
                      </button>
                      <button
                        onClick={() => setMethod('mobile')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          method === 'mobile' ? 'border-sunlight bg-sunlight/10 text-sunlight' : 'border-white/5 bg-white/5 text-white/40'
                        }`}
                      >
                        <Smartphone className="h-5 w-5" />
                        <span className="text-[10px] font-bold">MOBILE</span>
                      </button>
                      <button
                        onClick={() => setMethod('bank')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          method === 'bank' ? 'border-sunlight bg-sunlight/10 text-sunlight' : 'border-white/5 bg-white/5 text-white/40'
                        }`}
                      >
                        <Building2 className="h-5 w-5" />
                        <span className="text-[10px] font-bold">BANK</span>
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setStep(2)}
                    className="w-full h-14 bg-sunlight hover:bg-sunlight-light text-bark font-bold rounded-2xl text-lg shadow-xl shadow-sunlight/20"
                  >
                    Continue to Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Secure SSL</span>
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Global Support</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-sunlight/20 flex items-center justify-center text-sunlight">
                      {method === 'card' && <CreditCard className="h-6 w-6" />}
                      {method === 'mobile' && <Smartphone className="h-6 w-6" />}
                      {method === 'bank' && <Building2 className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Donation Total</p>
                      <p className="text-white text-2xl font-black">${amount}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="ml-auto text-sunlight hover:text-sunlight hover:bg-sunlight/10">
                      Edit
                    </Button>
                  </div>

                  {method === 'mobile' && (
                    <div className="space-y-4">
                      <p className="text-sm text-white/60 leading-relaxed">
                        Enter your M-Pesa or Airtel Money number below. You will receive a prompt on your phone to authorize the donation.
                      </p>
                      <Input 
                        placeholder="e.g. +254 700 000 000" 
                        className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
                      />
                    </div>
                  )}

                  {method === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/60">Card Information</Label>
                        <Input placeholder="Card Number" className="h-12 bg-white/5 border-white/10 text-white rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="MM/YY" className="h-12 bg-white/5 border-white/10 text-white rounded-xl" />
                        <Input placeholder="CVC" className="h-12 bg-white/5 border-white/10 text-white rounded-xl" />
                      </div>
                    </div>
                  )}

                  {method === 'bank' && (
                    <div className="p-4 bg-sunlight/5 rounded-xl border border-sunlight/10 space-y-2 text-sm">
                      <p className="font-bold text-sunlight">Bank Transfer Details:</p>
                      <p className="text-white/80">Account Name: Ethosss Conservation</p>
                      <p className="text-white/80">Bank: Standard Chartered</p>
                      <p className="text-white/80">Acc Number: 01234567890</p>
                      <p className="text-white/80">Swift: SCBLKENA</p>
                    </div>
                  )}

                  <Button 
                    onClick={handleDonate}
                    disabled={loading}
                    className="w-full h-14 bg-sunlight hover:bg-sunlight-light text-bark font-bold rounded-2xl text-lg"
                  >
                    {loading ? 'Processing...' : `Confirm $${amount} Donation`}
                  </Button>

                  <p className="text-center text-[10px] text-white/30 leading-relaxed">
                    By confirming, you agree to our terms of service. Your donation may be tax-deductible depending on your local laws.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
}
