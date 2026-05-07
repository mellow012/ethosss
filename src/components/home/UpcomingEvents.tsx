'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { format, isValid } from 'date-fns'

interface Event {
  id: string
  title: string
  description: string
  date: string // Fixed from startDate
  location: string
  image: string | null
  capacity: number | null
  price: number | null
  category: { id: string; name: string } | null
  _count: { registrations: number }
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/events?upcoming=true&limit=8')
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    if (events.length === 0) return
    setDirection(1)
    setCurrent((prev) => (prev + 1) % events.length)
  }, [events.length])

  const prev = useCallback(() => {
    if (events.length === 0) return
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + events.length) % events.length)
  }, [events.length])

  // Auto-advance every 9s
  useEffect(() => {
    if (events.length <= 1) return
    const timer = setInterval(next, 9000)
    return () => clearInterval(timer)
  }, [next, events.length])

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
    }),
  }

  if (!loading && events.length === 0) {
    return (
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">No Upcoming Events</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10">
            We don't have any events scheduled right now, but we're planning something exciting! 
            Check back soon or view our past activities.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/activities')}
            className="group px-8 py-6 text-lg"
          >
            View Full Calendar
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    )
  }

  const event = events[current]
  
  // Safe date parsing
  const eventDate = event ? new Date(event.date) : null
  const isDateValid = eventDate && isValid(eventDate)

  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <Badge className="mb-2 bg-forest/10 text-forest hover:bg-forest/20 border-none px-3">
              Don't Miss Out
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Upcoming <span className="text-gradient-forest">Events</span>
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Join our community-driven activities, workshops, and tree-planting
              sessions across the region.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/events')}
            className="shrink-0 group"
          >
            View Calendar
            <Calendar className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
          </Button>
        </motion.div>

        {loading ? (
          <Card className="overflow-hidden">
            <Skeleton className="h-[400px] w-full" />
          </Card>
        ) : (
          <div className="relative h-[480px] sm:h-[400px]">
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
                <Card className="h-full overflow-hidden border-none shadow-lg bg-card">
                  <CardContent className="h-full p-0 flex flex-col md:flex-row">
                    <div className="relative w-full md:w-[45%] h-48 md:h-full overflow-hidden">
                      {event.image ? (
                        <div className="absolute inset-0">
                          <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 45vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full gradient-forest flex items-center justify-center">
                          <Ticket className="h-20 w-20 text-white/20" />
                        </div>
                      )}
                      {isDateValid && (
                        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-center min-w-[60px] shadow-sm">
                          <span className="block text-xl font-bold text-forest leading-none">
                            {format(eventDate, 'dd')}
                          </span>
                          <span className="block text-[10px] uppercase font-bold text-muted-foreground mt-1">
                            {format(eventDate, 'MMM')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        {isDateValid && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-forest" />
                            {format(eventDate, 'HH:mm')}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-forest" />
                          <span className="line-clamp-1">{event.location}</span>
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
                        {event.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm sm:text-base mb-6 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                        <div className="text-sm font-medium">
                          {event.price === 0 || !event.price ? (
                            <span className="text-forest">Free Entry</span>
                          ) : (
                            <span className="text-foreground">
                              From ${event.price}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => router.push(`/events/${event.id}`)}
                          className="bg-forest hover:bg-forest-dark text-primary-foreground group px-6"
                        >
                          Book Your Spot
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {events.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background border border-border shadow-md hover:bg-accent transition-all hidden lg:block"
                  aria-label="Previous event"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background border border-border shadow-md hover:bg-accent transition-all hidden lg:block"
                  aria-label="Next event"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Mobile indicators & dots */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                  {events.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > current ? 1 : -1)
                        setCurrent(i)
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === current ? 'w-8 bg-forest' : 'w-2 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
