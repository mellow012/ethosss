import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Quote, Target, Users, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  const router = useRouter()

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

  const handleLike = async (storyId: string) => {
    try {
      const res = await fetch(`/api/success-stories/${storyId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' }),
      })
      if (res.ok) {
        toast.success('Interest noted!')
      }
    } catch {
      toast.error('Failed to react')
    }
  }

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
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Empowering the Next Generation of <span className="text-gold">Eco-Leaders</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Beyond business growth, we are dedicated to foundational change. We have been actively 
              supporting local pupils with essential educational materials to foster a new era of environmental consciousness.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button 
              variant="outline"
              onClick={() => router.push('/competitions')} // Placeholder or link to a submission page
              className="rounded-full border-forest text-forest hover:bg-forest hover:text-white font-bold px-6"
            >
              Share Your Story
            </Button>
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
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl group">
                <img 
                  src={stories[current].image || 'https://images.unsplash.com/photo-1518005020251-58296d8f8d60?w=800'} 
                  alt={stories[current].businessName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Badge className="absolute top-6 right-6 bg-gold text-forest-dark border-none font-black px-4 py-2 text-sm shadow-xl z-10 uppercase tracking-wider">
                  {stories[current].category}
                </Badge>
                
                <div className="absolute bottom-6 left-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleLike(stories[current].id); }}
                    className="rounded-full bg-white/90 backdrop-blur-md text-forest font-bold gap-2"
                  >
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                    Support this Story
                  </Button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-forest font-bold text-lg">
                    <Users className="h-6 w-6" />
                    {stories[current].impact}
                    <span className="ml-auto text-sm font-normal text-muted-foreground flex items-center gap-2">
                      <Quote className="h-3 w-3" />
                      Founded by {stories[current].name || 'Local Visionary'}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-foreground leading-tight">
                    {stories[current].businessName}
                  </h3>
                  <p className="text-xl text-muted-foreground leading-relaxed italic">
                    "{stories[current].description}"
                  </p>
                </div>

                <div className="pt-8 border-t border-border/50 flex justify-between items-center">
                  <div className="flex gap-4">
                     {/* Add social proof or quick stats here if needed */}
                  </div>
                  <Button 
                    onClick={() => router.push(`/eco-business/${stories[current].id}`)}
                    className="bg-forest text-white px-8 h-14 rounded-2xl font-bold group shrink-0 shadow-lg shadow-forest/20 hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
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
                  i === current ? 'w-10 bg-gold' : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


