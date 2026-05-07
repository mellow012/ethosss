import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Quote, Target, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Story {
  id: string
  name: string
  businessName: string
  category: string
  impact: string
  description: string
  image: string
  featured: boolean
}

export function EcoBusinessSuccess() {
  const [stories, setStories] = useState<Story[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/success-stories?featured=true')
      .then(res => res.json())
      .then(data => {
        if (data.stories && data.stories.length > 0) {
          setStories(data.stories)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    if (stories.length <= 1) return
    setCurrent((prev) => (prev + 1) % stories.length)
  }, [stories.length])

  const prev = useCallback(() => {
    if (stories.length <= 1) return
    setCurrent((prev) => (prev - 1 + stories.length) % stories.length)
  }, [stories.length])

  useEffect(() => {
    if (stories.length <= 1) return
    const timer = setInterval(next, 8000)
    return () => clearInterval(timer)
  }, [next, stories.length])

  if (loading) return null
  if (stories.length === 0) return null

  return (
    <section className="py-24 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-forest font-bold tracking-wider uppercase text-sm mb-4"
            >
              <Target className="h-4 w-4" />
              Impact Stories
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Empowering the Next Generation of <span className="text-gradient-forest">Eco-Leaders</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prev}
              className="rounded-full h-12 w-12 border-border hover:bg-forest hover:text-white transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={next}
              className="rounded-full h-12 w-12 border-border hover:bg-forest hover:text-white transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                <img 
                  src={stories[current].image || 'https://images.unsplash.com/photo-1518005020251-58296d8f8d60?w=800'} 
                  alt={stories[current].businessName} 
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-foreground border-none font-bold px-4 py-2 text-sm shadow-lg">
                  {stories[current].category}
                </Badge>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-forest font-bold text-lg">
                    <Users className="h-6 w-6" />
                    {stories[current].impact}
                  </div>
                  <h3 className="text-4xl font-black text-foreground leading-tight">
                    {stories[current].businessName}
                  </h3>
                  <p className="text-xl text-muted-foreground leading-relaxed italic">
                    "{stories[current].description}"
                  </p>
                </div>

                <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Our Contribution</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Provided strategic seed funding and mentorship to help scale their eco-friendly production across regional borders.
                    </p>
                  </div>
                  <Button className="bg-forest text-white px-8 h-14 rounded-2xl font-bold group shrink-0">
                    Read Full Story
                    <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center mt-12 gap-2">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 transition-all rounded-full ${
                  i === current ? 'w-10 bg-forest' : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { Button } from '@/components/ui/button'
