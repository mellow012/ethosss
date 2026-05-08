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

  // Only use the default image as a fallback when settings are loaded and no images exist
  const [displayImages, setDisplayImages] = useState<string[]>([])

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      const images = getHeroImages()
      if (images.length > 0) {
        setDisplayImages(images)
      } else {
        setDisplayImages([settings.hero_image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop'])
      }
    }
  }, [settings])

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
    subtitle: settings.hero_subtitle || 'Sustainable Travel & Economy Across Southern Africa',
    title: settings.hero_title || 'Ethosss — Empowering Innovation',
    description: settings.hero_description || 'We are a social enterprise operating across Southern Africa, committed to empowering young people through the economy, eco-friendly tourism, and innovation.'
  }

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-20">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {displayImages.length > 0 && (
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
          )}
        </AnimatePresence>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-hero z-1" />

      {/* Navigation Arrows */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
            className="absolute left-6 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/20 transition-all hidden md:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % displayImages.length)}
            className="absolute right-6 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/20 transition-all hidden md:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 transition-all rounded-full ${currentSlide === i ? 'w-10 bg-forest' : 'w-2 bg-white/30'
                  }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Animated decorative elements */}
      <motion.div
        className="absolute top-24 left-12 text-forest-light/20 z-10"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-20 w-20" />
      </motion.div>
      <motion.div
        className="absolute bottom-36 right-20 text-forest-light/15 z-10"
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-16 w-16" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 mb-10"
          >
            <Leaf className="h-4 w-4 text-gold" />
            <span className="text-xs sm:text-sm text-white/90 font-medium uppercase tracking-wider">
              {content.subtitle}
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-2xl mb-8">
            {content.title.split('—').map((part: string, i: number) => (
              <span key={i} className="block">
                {i === 1 ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200 mt-2">
                    {part.trim()}
                  </span>
                ) : part.trim()}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4"
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Button
              size="lg"
              onClick={handleExplore}
              className="bg-forest hover:bg-forest-dark text-primary-foreground px-10 py-7 text-lg font-semibold group rounded-2xl shadow-xl shadow-forest/20"
            >
              Explore Eco-Tourism
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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

