'use client'

import { motion } from 'framer-motion'
import { Rocket, HandCoins, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EcoBusinessBoost() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with rich gradient and subtle texture */}
      <div className="absolute inset-0 bg-[#0a2a1a] z-0">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-moss/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-16 lg:p-20 shadow-2xl overflow-hidden relative">
          {/* Decorative Elements */}
          <motion.div 
            className="absolute top-10 right-10 opacity-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Rocket className="h-32 w-32 text-white" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-sunlight/20 text-sunlight px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                <TrendingUp className="h-4 w-4" />
                Empowering Green Entrepreneurs
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Eco-Business <br />
                <span className="text-sunlight">Capital Boost</span>
              </h2>
              
              <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                Fuel your environmental innovation. We provide the resources, mentorship, and 
                strategic capital needed to scale your youth-led eco-business across Southern Africa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-sunlight hover:bg-gold text-bark font-bold h-14 px-8 rounded-2xl group">
                  Apply for Support
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-8 rounded-2xl">
                  View Eligibility
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { 
                  icon: HandCoins, 
                  title: 'Seed Funding', 
                  desc: 'Direct grants for early-stage green startups.',
                  color: 'bg-emerald-500/10 text-emerald-400'
                },
                { 
                  icon: ShieldCheck, 
                  title: 'Business Mentorship', 
                  desc: 'Guidance from industry leaders in sustainability.',
                  color: 'bg-blue-500/10 text-blue-400'
                },
                { 
                  icon: TrendingUp, 
                  title: 'Market Access', 
                  desc: 'Connect with a regional network of eco-partners.',
                  color: 'bg-amber-500/10 text-amber-400'
                },
                { 
                  icon: Rocket, 
                  title: 'Scaling Support', 
                  desc: 'Tools to grow your impact from local to regional.',
                  color: 'bg-purple-500/10 text-purple-400'
                }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className={`h-12 w-12 rounded-2xl ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-white font-bold mb-2">{item.title}</h4>
                  <p className="text-white/50 text-sm leading-snug">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
