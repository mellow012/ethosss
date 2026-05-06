'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function VisionSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest/5 via-transparent to-gold/5" />

      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-forest/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-gold-dark" />
            <span className="text-sm font-semibold text-gold-dark tracking-wide uppercase">
              Our Vision
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Cultivating a generation of{' '}
            <span className="text-gradient-forest">
              environmentally conscious leaders
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            To cultivate a generation of environmentally conscious leaders who
            drive sustainable growth, innovation, and regional integration
            across Africa.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
