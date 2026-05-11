'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Heart, Users, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function JoinMovement() {
  const router = useRouter()

  const handleJoin = () => {
    router.push('/get-involved')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-forest" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
      <motion.div
        className="absolute top-16 right-20 text-white/10"
        animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-20 w-20" />
      </motion.div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Join the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light to-gold">
              Movement
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you&apos;re a traveler, innovator, or environmental
            advocate, you can be part of this journey. Together, we can build a
            greener, more inclusive future for Africa.
          </motion.p>

          {/* Role badges */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: Users, label: 'Travelers' },
              { icon: Leaf, label: 'Innovators' },
              { icon: Heart, label: 'Advocates' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2"
              >
                <Icon className="h-4 w-4 text-gold" />
                <span className="text-sm text-white/90 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={handleJoin}
              className="bg-gold hover:bg-gold-dark text-forest-dark font-semibold px-8 py-6 text-base group"
            >
              Get Involved
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white px-8 py-6 text-base"
              onClick={() => {
                const el = document.getElementById('what-we-do')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
