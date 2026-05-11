'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Users, 
  Briefcase, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  ShieldCheck,
  Zap,
  Gift
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DonationModal } from '@/components/home/DonationModal'
import { MembershipModal } from '@/components/home/MembershipModal'
import { JoinMovementModal, InvolvementType } from '@/components/home/JoinMovementModal'

const MEMBERSHIPS = [
  {
    id: 'supporter',
    name: 'Supporter',
    price: 10,
    period: 'mo',
    description: 'Perfect for individuals who want to stay connected and support our basic missions.',
    features: ['Monthly Impact Newsletter', 'Digital Membership Badge', 'Early access to news'],
    color: 'forest'
  },
  {
    id: 'advocate',
    name: 'Eco-Advocate',
    price: 45,
    period: 'mo',
    description: 'For those deeply committed to environmental change and community growth.',
    features: ['All Supporter benefits', 'Exclusive Webinars', '10% Discount on Eco-Hotels', 'Tree planted in your name'],
    featured: true,
    color: 'gold'
  },
  {
    id: 'champion',
    name: 'Champion',
    price: 450,
    period: 'yr',
    description: 'Our most impactful tier for leaders and organizations driving major change.',
    features: ['All Advocate benefits', 'VIP Event Invitations', 'Annual Impact Report (Print)', 'Direct meeting with founders'],
    color: 'bark'
  }
]

const WAYS_TO_HELP: { title: string; icon: React.ReactNode; description: string; action: string; type: InvolvementType }[] = [
  {
    title: 'Become an Activist',
    icon: <Zap className="h-6 w-6" />,
    description: 'Use your voice to spread awareness about climate change and social equity across Africa.',
    action: 'Join the Movement',
    type: 'activist'
  },
  {
    title: 'Volunteer',
    icon: <Users className="h-6 w-6" />,
    description: 'Join our local teams for clean-ups, tree planting, and community teaching events.',
    action: 'Sign Up to Help',
    type: 'volunteer'
  },
  {
    title: 'Join the Team',
    icon: <Briefcase className="h-6 w-6" />,
    description: 'Explore career opportunities and internships at Ethosss across our various hubs.',
    action: 'View Openings',
    type: 'team'
  }
]

export default function GetInvolvedPage() {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false)
  const [involvementType, setInvolvementType] = useState<InvolvementType | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleInvolvementClick = (type: InvolvementType) => {
    setInvolvementType(type)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Simplified Hero Section */}
      <section className="relative py-20 border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-[10px] font-black uppercase tracking-widest">
              <Heart className="h-3 w-3 fill-current" />
              Join the Mission
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight">
              Small Actions, <span className="text-forest">Massive Impact.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Whether you give your time, your voice, or your resources, you are a vital part of the ethical transformation of Africa.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button 
                onClick={() => setIsDonationModalOpen(true)}
                className="bg-gold hover:bg-gold-dark text-bark font-bold rounded-xl px-8 h-12"
              >
                Donate Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsMembershipModalOpen(true)}
                className="border-forest/20 text-forest hover:bg-forest/5 font-bold rounded-xl px-8 h-12"
              >
                Membership Plans
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ways to Help Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How You Can Help</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the various ways you can contribute to the mission and join the movement for a sustainable Africa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {WAYS_TO_HELP.map((way, i) => (
              <div key={i} className="space-y-6 group">
                <div className="w-16 h-16 rounded-2xl bg-forest/10 text-forest flex items-center justify-center transition-transform group-hover:scale-110">
                  {way.icon}
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{way.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {way.description}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 text-forest font-bold group"
                  onClick={() => handleInvolvementClick(way.type)}
                >
                  {way.action} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ))}
          </div>

          {/* Membership Teaser */}
          <div className="mt-24 p-10 bg-forest/5 border border-forest/10 rounded-3xl text-center">
            <Star className="h-8 w-8 text-gold mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Official Membership</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Unlock exclusive benefits, eco-travel discounts, and direct impact reports by becoming an official Ethosss Member.
            </p>
            <Button 
              onClick={() => setIsMembershipModalOpen(true)}
              className="bg-forest hover:bg-forest-dark text-white font-bold px-8 h-12 rounded-xl"
            >
              View Membership Tiers
            </Button>
          </div>
        </div>
      </section>

      <MembershipModal 
        isOpen={isMembershipModalOpen} 
        onClose={() => setIsMembershipModalOpen(false)} 
      />
      <DonationModal 
        isOpen={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
      />
      {involvementType && (
        <JoinMovementModal
          isOpen={!!involvementType}
          onClose={() => setInvolvementType(null)}
          type={involvementType}
        />
      )}
    </main>
  )
}
