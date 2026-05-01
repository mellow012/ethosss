'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function HeroSection() {
  const { setView } = useAppStore()
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings)
      })
      .catch(console.error)
  }, [])

  const handleExplore = () => {
    setView('hotels')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleJoin = () => {
    setView('signup')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const content = {
    image: settings.hero_image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
    subtitle: settings.hero_subtitle || 'Building a greener tomorrow, today',
    eyebrow: settings.hero_eyebrow || 'See the World, Save the Planet',
    title: settings.hero_title || 'Protecting Nature, Inspiring Change',
    description: settings.hero_description || 'Join Ethoss in building a sustainable future through tree planting, eco-tourism, and community action across the UK'
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: `url(${content.image})`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Animated decorative elements */}
      <motion.div
        className="absolute top-20 left-10 text-forest-light/20"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-16 w-16" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-16 text-forest-light/15"
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-12 w-12" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <Leaf className="h-4 w-4 text-gold" />
            <span className="text-sm text-white/90 font-medium">
              {content.subtitle}
            </span>
          </motion.div>

          <p className="text-sm sm:text-base uppercase tracking-[0.25em] text-gold font-semibold mb-4">
            {content.eyebrow}
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            {content.title.split(',').map((part: string, i: number) => (
              <span key={i}>
                {i > 0 && ', '}
                {i === 1 ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
                    {part}
                  </span>
                ) : part}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={handleExplore}
              className="bg-forest hover:bg-forest-dark text-primary-foreground px-8 py-6 text-base group"
            >
              Explore Eco-Tourism
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleJoin}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white px-8 py-6 text-base"
            >
              Join Our Mission
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-2.5 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

