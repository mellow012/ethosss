'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  CheckCircle2, 
  Send, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Wrench,
  Loader2,
  ArrowRight,
  Rocket,
  Globe,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export type InvolvementType = 'volunteer' | 'activist' | 'team' | 'partner' | 'funding' | 'story'

interface JoinMovementModalProps {
  isOpen: boolean
  onClose: () => void
  type: InvolvementType
}

const TYPE_CONFIG = {
  volunteer: {
    title: 'Become a Volunteer',
    description: 'Join our local teams for clean-ups, tree planting, and community events.',
    icon: <User className="h-6 w-6" />,
    fields: ['name', 'email', 'phone', 'skills', 'message'],
  },
  activist: {
    title: 'Become an Activist',
    description: 'Use your voice to spread awareness about climate change and social equity.',
    icon: <Send className="h-6 w-6" />,
    fields: ['name', 'email', 'social', 'message'],
  },
  team: {
    title: 'Join the Team',
    description: 'Explore career opportunities and internships at Ethosss hubs.',
    icon: <Wrench className="h-6 w-6" />,
    fields: ['name', 'email', 'phone', 'resume', 'message'],
  },
  partner: {
    title: 'Partner With Ethosss',
    description: 'Collaborate with us to drive sustainable impact and innovation across Africa.',
    icon: <Globe className="h-6 w-6" />,
    fields: ['name', 'email', 'phone', 'social', 'message'],
  },
  funding: {
    title: 'Apply for Funding',
    description: 'Submit your green business proposal for the Capital Boost program.',
    icon: <Rocket className="h-6 w-6" />,
    fields: ['name', 'email', 'phone', 'skills', 'message'],
  },
  story: {
    title: 'Share Your Story',
    description: 'Tell us how Ethosss or your eco-business has made an impact in your community.',
    icon: <BookOpen className="h-6 w-6" />,
    fields: ['name', 'email', 'phone', 'message'],
  },
}

const MESSAGE_CONFIG: Record<InvolvementType, { label: string; placeholder: string }> = {
  volunteer: { label: 'Why do you want to join?', placeholder: 'Tell us about your motivation...' },
  activist:  { label: 'Why do you want to join?', placeholder: 'Tell us about your motivation...' },
  team:      { label: 'Why do you want to join?', placeholder: 'Tell us about your motivation...' },
  partner:   { label: 'Partnership Details',       placeholder: 'Describe your organization and how you would like to collaborate...' },
  funding:   { label: 'Your Business Proposal',    placeholder: 'Briefly describe your eco-business idea and the problem it solves...' },
  story:     { label: 'Your Story',                placeholder: 'Share your impact story — what happened, who was involved, and what changed...' },
}

export function JoinMovementModal({ isOpen, onClose, type }: JoinMovementModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const config = TYPE_CONFIG[type]
  const msgConfig = MESSAGE_CONFIG[type]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      type,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      skills: formData.get('skills') || formData.get('social') || formData.get('resume'),
    }

    try {
      const res = await fetch('/api/join-movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setSubmitted(true)
        toast.success('Your application has been submitted successfully!')
      } else {
        throw new Error('Failed to submit application')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-white dark:bg-bark">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8"
            >
              <DialogHeader className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center mb-4 border border-forest/20">
                  {config.icon}
                </div>
                <DialogTitle className="text-2xl font-black text-foreground tracking-tight">{config.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {config.description}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="name" name="name" required className="pl-10 h-11 bg-muted/50 border-muted-foreground/20 rounded-xl focus-visible:ring-forest" placeholder="John Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" required className="pl-10 h-11 bg-muted/50 border-muted-foreground/20 rounded-xl focus-visible:ring-forest" placeholder="john@example.com" />
                  </div>
                </div>

                {config.fields.includes('phone') && (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" name="phone" className="pl-10 h-11 bg-muted/50 border-muted-foreground/20 rounded-xl focus-visible:ring-forest" placeholder="+254 ..." />
                    </div>
                  </div>
                )}

                {config.fields.includes('social') && (
                  <div className="space-y-2">
                    <Label htmlFor="social" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Social Media / Website</Label>
                    <Input id="social" name="social" className="h-11 bg-muted/50 border-muted-foreground/20 rounded-xl focus-visible:ring-forest" placeholder="@username or link" />
                  </div>
                )}

                {config.fields.includes('skills') && (
                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key Skills</Label>
                    <Input id="skills" name="skills" className="h-11 bg-muted/50 border-muted-foreground/20 rounded-xl focus-visible:ring-forest" placeholder="e.g. Tree planting, Teaching, Marketing" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{msgConfig.label}</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea id="message" name="message" required className="pl-10 min-h-[120px] bg-muted/50 border-muted-foreground/20 rounded-xl focus-visible:ring-forest" placeholder={msgConfig.placeholder} />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-forest hover:bg-forest-dark text-white font-black uppercase tracking-widest text-xs rounded-xl mt-4 shadow-lg shadow-forest/20"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Submit Application <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-black mb-4 text-foreground">Application Received!</h2>
              <p className="text-muted-foreground mb-8">
                Thank you for your interest in joining the Ethosss movement. Our team will review your application and get back to you shortly.
              </p>
              <Button onClick={onClose} className="bg-forest hover:bg-forest-dark text-white px-8 h-12 rounded-xl font-bold">
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
