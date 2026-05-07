'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Share2,
  Users,
  CheckCircle2,
  AlertCircle,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format, isAfter, isBefore } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { ImagePreview } from '@/components/ui/image-preview'
import { useSession } from 'next-auth/react'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  image: string | null
  link: string | null
  recap: string | null
  isActive: boolean
  competitionId: string | null
}

export function EventDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/events?all=true&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        const found = (data.events || []).find((e: Event) => e.id === id)
        setEvent(found || null)
        if (found && session) {
          checkRegistration(found.id)
        }
      })
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false))
  }, [id, session])

  const checkRegistration = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/register?eventId=${eventId}`)
      const data = await res.json()
      setIsRegistered(data.registered)
    } catch (err) {
      console.error('Failed to check registration')
    }
  }

  const handleBookSpot = async () => {
    if (!session) {
      toast.error('Please sign in to book your spot')
      router.push('/login')
      return
    }

    setBookingLoading(true)
    try {
      const res = await fetch('/api/events/register', {
        method: isRegistered ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id }),
      })

      if (res.ok) {
        setIsRegistered(!isRegistered)
        toast.success(isRegistered ? 'Booking cancelled' : 'Spot booked successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Action failed')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-80 w-full rounded-2xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Event not found</h2>
        <Button
          variant="outline"
          onClick={() => router.push('/activities')}
          className="mt-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Activities
        </Button>
      </div>
    )
  }

  const now = new Date()
  const eventDate = new Date(event.date)
  const isPast = isBefore(eventDate, new Date(now.getTime() - 6 * 60 * 60 * 1000))
  const isUpcoming = isAfter(eventDate, now)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pb-20"
    >
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          onClick={() => router.push('/activities')}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Activities
        </Button>

        {/* Cover Image */}
        <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden shadow-2xl mb-10 group">
          {event.image ? (
            <ImagePreview 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full gradient-forest flex items-center justify-center">
              <Calendar className="h-32 w-32 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
            <Badge className={isUpcoming ? 'bg-sunlight text-earth border-none' : 'bg-muted/80 backdrop-blur-md border-none'}>
              {isUpcoming ? 'Upcoming Event' : isPast ? 'Past Event' : 'Happening Now'}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 space-y-10">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">About this event</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-lg">
                <ReactMarkdown>{event.description}</ReactMarkdown>
              </div>
            </section>

            {/* Recap Section */}
            {event.recap && (
              <section className="p-8 bg-forest/5 border border-forest/10 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-5">
                  <CheckCircle2 className="h-32 w-32 text-forest" />
                </div>
                <h2 className="text-2xl font-bold text-forest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" /> Event Recap
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
                  <ReactMarkdown>{event.recap}</ReactMarkdown>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-card overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-forest/10 p-2.5 rounded-xl text-forest">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</p>
                    <p className="text-base font-semibold">{format(eventDate, 'EEEE, dd MMM yyyy')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-forest/10 p-2.5 rounded-xl text-forest">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</p>
                    <p className="text-base font-semibold">{format(eventDate, 'HH:mm')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-forest/10 p-2.5 rounded-xl text-forest">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location</p>
                    <p className="text-base font-semibold">{event.location}</p>
                  </div>
                </div>

                {!isPast && (
                  <Button
                    className={`w-full py-6 text-lg font-bold shadow-lg transition-all ${
                      isRegistered 
                        ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' 
                        : 'bg-forest hover:bg-forest-dark shadow-forest/20'
                    } text-primary-foreground`}
                    onClick={handleBookSpot}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      'Processing...'
                    ) : isRegistered ? (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        You're Booked!
                      </>
                    ) : (
                      <>
                        <Ticket className="mr-2 h-5 w-5" />
                        Book My Spot
                      </>
                    )}
                  </Button>
                )}

                {event.competitionId && !isPast && (
                  <Button 
                    variant="outline" 
                    className="w-full py-6 border-sunlight text-sunlight hover:bg-sunlight hover:text-bark font-bold"
                    onClick={() => router.push(`/?view=competition-detail&id=${event.competitionId}`)}
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    Join Challenge
                  </Button>
                )}
                
                <Button variant="outline" className="w-full py-6 border-forest/20 text-muted-foreground hover:text-forest">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Event
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 text-center">
              <AlertCircle className="h-8 w-8 text-forest/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Small acts, when multiplied by millions of people, can transform the world."
              </p>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  )
}
