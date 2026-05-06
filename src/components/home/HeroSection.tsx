'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Leaf, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function HeroSection() {
  const { setView } = useAppStore()
  const [settings, setSettings] = useState<any>({})
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings)
      })
      .catch(console.error)
  }, [])

  const getHeroImages = () => {
    try {
      const images = JSON.parse(settings.hero_images || '[]')
      return images.filter((img: string) => img !== '')
    } catch {
      return []
    }
  }

  const heroImages = getHeroImages()
  const displayImages = heroImages.length > 0 ? heroImages : [settings.hero_image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop']

  useEffect(() => {
    if (displayImages.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [displayImages])

  const handleExplore = () => {
    setView('hotels')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleJoin = () => {
    setView('signup')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const content = {
    subtitle: settings.hero_subtitle || 'Sustainable Travel & Green Economy Across Southern Africa',
    eyebrow: settings.hero_eyebrow || 'Purpose-Driven. Youth-Led. Green.',
    title: settings.hero_title || 'Ethosss — Empowering Youth Through Green Innovation',
    description: settings.hero_description || 'We are a purpose-driven social enterprise operating across Southern Africa, committed to empowering young people through the green economy, eco-friendly tourism, and innovation.'
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${displayImages[currentSlide]})`,
            }}
          />
        </AnimatePresence>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-hero z-1" />

      {/* Navigation Arrows */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
            className="absolute left-4 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/20 transition-all hidden sm:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % displayImages.length)}
            className="absolute right-4 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/20 transition-all hidden sm:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 transition-all rounded-full ${
                  currentSlide === i ? 'w-8 bg-forest' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Animated decorative elements */}
      <motion.div
        className="absolute top-20 left-10 text-forest-light/20 z-10"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-16 w-16" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-16 text-forest-light/15 z-10"
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

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl">
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
              Join the Movement
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

