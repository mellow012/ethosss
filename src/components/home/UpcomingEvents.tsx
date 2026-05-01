'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, ArrowRight, TreePine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  image: string | null
  link: string | null
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events?upcoming=true&limit=3')
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && events.length === 0) return null

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <Badge className="bg-forest/10 text-forest border-forest/20 mb-3 px-3 py-1">
              Community Events
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Upcoming <span className="text-gradient-forest">Gatherings</span>
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Join our community in making a real-world impact. From local tree planting to sustainability workshops.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 group">
            View All Events
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-background h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    {event.image ? (
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${event.image})` }}
                      />
                    ) : (
                      <div className="w-full h-full gradient-forest flex items-center justify-center">
                        <TreePine className="h-12 w-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm dark:bg-black/80 rounded-lg p-2 text-center shadow-lg min-w-[50px]">
                        <p className="text-xs font-bold text-forest uppercase tracking-tighter">
                          {format(new Date(event.date), 'MMM')}
                        </p>
                        <p className="text-xl font-black text-foreground leading-none">
                          {format(new Date(event.date), 'dd')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-forest font-medium text-xs mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-forest transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                      {event.description}
                    </p>
                    <Button className="w-full bg-forest hover:bg-forest-dark text-white rounded-full">
                      Join Event
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
