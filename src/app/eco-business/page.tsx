'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, HandCoins, ArrowRight, TrendingUp, ShieldCheck, Target, Users, Leaf, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EcoBusinessSuccess } from '@/components/home/EcoBusinessSuccess'
import { JoinMovementModal, InvolvementType } from '@/components/home/JoinMovementModal'
import { DonationModal } from '@/components/home/DonationModal'

export default function EcoBusinessPage() {
  const [involvementType, setInvolvementType] = useState<InvolvementType | null>(null)
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a2a1a] z-0">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-forest/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-moss/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-8">
              Eco-Business <br />
              <span className="text-gold">Capital Boost</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-12 max-w-3xl mx-auto">
              Fueling environmental innovation with the strategic capital, expert mentorship, 
              and regional networks needed to scale impact across Africa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                onClick={() => setInvolvementType('funding')}
                size="lg" 
                className="bg-gold hover:bg-gold-dark text-bark font-bold h-16 px-10 rounded-2xl group text-lg"
              >
                Apply for Funding
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => setInvolvementType('partner')}
                size="lg" 
                className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 h-16 px-10 rounded-2xl text-lg font-bold transition-all"
              >
                Partner With Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Program Pillars */}
      <section className="py-24 bg-white dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Boost Your Business</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive support system is designed to take your green startup from concept to regional scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: HandCoins,
                title: 'Strategic Capital',
                desc: 'Direct seed funding and grants ranging from $1,000 to $10,000 to fuel early-stage growth and infrastructure.',
                color: 'bg-emerald-500/10 text-emerald-600'
              },
              {
                icon: ShieldCheck,
                title: 'Expert Mentorship',
                desc: 'Weekly sessions with industry veterans in sustainability, supply chain, and business development.',
                color: 'bg-blue-500/10 text-blue-600'
              },
              {
                icon: Globe,
                title: 'Regional Networking',
                desc: 'Access to cross-border markets and partnerships across Africa, from Kenya to Malawi.',
                color: 'bg-amber-500/10 text-amber-600'
              }
            ].map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-muted/30 border border-border/50 rounded-[2.5rem] p-10 text-center group hover:bg-white dark:hover:bg-muted/50 hover:shadow-xl transition-all"
              >
                <div className={`h-16 w-16 rounded-2xl ${pillar.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <pillar.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <EcoBusinessSuccess />

      {/* Contribution Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-forest rounded-[3rem] p-8 md:p-16 lg:p-20 text-white flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Target className="h-4 w-4" />
                Impact Through Contribution
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Support the Green Economy</h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl">
                Your contributions directly fuel our grant pool, allowing us to support more youth-led
                startups and plant more trees. Join us in building a sustainable future.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-gold/20 rounded-full flex items-center justify-center text-gold">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <span className="font-medium">100% Goes to Projects</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-gold/20 rounded-full flex items-center justify-center text-gold">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Empowers Local Youth</span>
                </div>
              </div>
              <Button 
                onClick={() => setIsDonationModalOpen(true)}
                size="lg" 
                className="bg-gold hover:bg-gold-dark text-bark font-bold h-14 px-10 rounded-2xl w-full sm:w-auto"
              >
                Make a Contribution
              </Button>
            </div>
            <div className="lg:w-1/3 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 blur-[80px] rounded-full" />
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-10 relative z-10"
                >
                  <HandCoins className="h-32 w-32 text-gold" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
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
