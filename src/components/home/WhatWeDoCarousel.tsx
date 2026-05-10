'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Leaf,
  Recycle,
  Handshake,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Slide {
  icon: React.ElementType
  title: string
  description: string
  bullets: string[]
  accentColor: string
  iconBg: string
  imagePlaceholder: string
}

const slides: Slide[] = [
  {
    icon: Globe,
    title: 'Sustainable Youth Travel & Tourism',
    description:
      'We believe travel should be accessible, meaningful, and impactful. Our programs are designed to connect youth and build capacity.',
    bullets: [
      'Make travel affordable and accessible to young people',
      'Promote youth integration, networking, and cultural exchange',
      'Build skills and capacity through immersive travel experiences',
      'Encourage participation in climate action activities during travel',
    ],
    accentColor: 'text-forest',
    iconBg: 'bg-forest/10',
    imagePlaceholder: 'Travel & Tourism',
  },
  {
    icon: Leaf,
    title: 'Climate Action & Environmental Impact',
    description:
      'Sustainability is at the heart of everything we do. We actively invest in initiatives that protect and restore the environment.',
    bullets: [
      'Reforestation Initiative: We plant 10 trees for every traveler',
      'Over 10,000 trees planted to date',
      'Support for youth-led projects in waste management and recycling',
      'Engagement in climate change awareness and action programs',
    ],
    accentColor: 'text-moss',
    iconBg: 'bg-moss/10',
    imagePlaceholder: 'Climate Action',
  },
  {
    icon: Recycle,
    title: 'Green Economy & Youth Innovation',
    description:
      'We empower young innovators to develop and scale solutions that address environmental challenges.',
    bullets: [
      'Investment in youth-led green projects',
      'Support for circular economy initiatives',
      'Skills development in sustainable entrepreneurship',
    ],
    accentColor: 'text-forest-light',
    iconBg: 'bg-forest-light/10',
    imagePlaceholder: 'Green Economy',
  },
  {
    icon: Handshake,
    title: 'Regional Integration & Collaboration',
    description:
      'We foster cross-border collaboration to strengthen innovation and unity across Africa.',
    bullets: [
      'Platforms for youth to share ideas and solutions',
      'Support for regional green-economy investments',
      'Networking opportunities that connect changemakers across countries',
    ],
    accentColor: 'text-sage',
    iconBg: 'bg-sage/10',
    imagePlaceholder: 'Regional Collaboration',
  },
  {
    icon: Building2,
    title: 'Sustainable Construction Innovation',
    description:
      'Recognizing the environmental impact of high-energy industries, we are pioneering eco-friendly alternatives.',
    bullets: [
      'Research and development of Hempcrete and other sustainable materials',
      'Promotion of energy-efficient, durable, and low-impact construction solutions',
      'Supporting youth involvement in green building technologies',
    ],
    accentColor: 'text-gold-dark',
    iconBg: 'bg-gold/10',
    imagePlaceholder: 'Sustainable Construction',
  },
]

export function WhatWeDoCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings && data.settings.what_we_do_images) {
          try {
            setImages(JSON.parse(data.settings.what_we_do_images))
          } catch {
            // Keep empty
          }
        }
      })
      .catch(() => {})
  }, [])

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
    },
    [current]
  )

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  // Auto-advance every 7s
  useEffect(() => {
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]
  const Icon = slide.icon

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            What We{' '}
            <span className="text-gradient-forest">Do</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Our mission is to create opportunities that connect youth, build
            capacity, and inspire sustainable development across Africa.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="relative h-[500px] sm:h-[420px] mb-6">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0"
              >
                <Card className="h-full border shadow-sm overflow-hidden bg-card">
                  <CardContent className="h-full p-0">
                    <div className="h-full flex flex-col lg:flex-row">
                      {/* Content side */}
                      <div className="flex-1 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                        <div
                          className={`inline-flex items-center justify-center h-14 w-14 rounded-xl ${slide.iconBg} mb-5`}
                        >
                          <Icon className={`h-7 w-7 ${slide.accentColor}`} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
                          {slide.title}
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base mb-5 leading-relaxed max-w-lg">
                          {slide.description}
                        </p>
                        <ul className="space-y-2.5">
                          {slide.bullets.map((bullet, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.06 }}
                              className="flex items-start gap-2.5 text-sm text-muted-foreground"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-forest" />
                              {bullet}
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Image side */}
                      <div className="hidden lg:flex lg:w-[40%] items-center justify-center p-8 bg-muted/5">
                        {images[current] ? (
                          <div className="w-full h-full rounded-xl overflow-hidden border border-border/50 shadow-inner min-h-[280px]">
                            <img src={images[current]} alt={slide.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div
                            className={`w-full h-full rounded-xl ${slide.iconBg} border border-border/50 flex items-center justify-center min-h-[280px] shadow-inner`}
                          >
                            <div className="text-center">
                              <Icon
                                className={`h-16 w-16 ${slide.accentColor} opacity-20 mx-auto mb-3`}
                              />
                              <p className="text-muted-foreground text-sm font-medium">
                                {slide.imagePlaceholder}
                              </p>
                              <p className="text-muted-foreground/40 text-xs mt-1">
                                Image Coming Soon
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows (inside relative container) */}
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background/80 backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-background border border-border transition-all shadow-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background/80 backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-background border border-border transition-all shadow-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}: ${s.title}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-8 bg-forest'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
