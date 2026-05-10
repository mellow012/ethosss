'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  User,
  Trophy,
  MessageCircle,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  Award,
  Ticket,
  MapPin,
  Leaf,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { startTransition } from 'react'
import { EditProfileDialog } from './EditProfileDialog'

interface Booking {
  id: string
  eventId: string
  status: string
  createdAt: string
  event: {
    id: string
    title: string
    date: string
    location: string
  }
}

interface Entry {
  id: string
  competitionId: string
  content: string
  status: string
  round: number
  submittedAt: string
  competition: {
    id: string
    title: string
    prize: string
  }
}

interface Comment {
  id: string
  content: string
  approved: boolean
  createdAt: string
  post: {
    id: string
    title: string
  }
}

export function UserDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [fullUser, setFullUser] = useState<any>(null)

  const userId = (session?.user as any)?.id

  const fetchData = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    try {
      const [entriesRes, bookingsRes, profileRes] = await Promise.all([
        fetch(`/api/entries?userId=${userId}`),
        fetch('/api/events/register'),
        fetch('/api/profile')
      ])

      const entriesData = await entriesRes.json()
      const bookingsData = await bookingsRes.json()
      const profileData = await profileRes.json()

      setEntries(entriesData.entries || [])
      setBookings(bookingsData.bookings || [])
      setFullUser(profileData.user || null)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const statusColors: Record<string, string> = {
    pending: 'bg-sunlight/10 text-earth dark:text-sunlight',
    approved: 'bg-green-500/10 text-green-600 dark:text-green-400',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
    winner: 'bg-sunlight/20 text-earth dark:text-sunlight font-semibold',
    advanced: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    eliminated: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  }

  const statusIcons: Record<string, React.ElementType> = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
    winner: Award,
    advanced: TrendingUp,
    eliminated: XCircle,
  }

  const wins = entries.filter((e) => e.status === 'winner').length
  const upcomingEvents = bookings.filter(b => b.event && new Date(b.event.date) > new Date()).length

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Please log in</h2>
          <p className="text-muted-foreground mt-2">
            You need to be logged in to view your dashboard.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="mt-6 bg-forest hover:bg-forest-dark text-primary-foreground"
          >
            Log in
          </Button>
        </div>
      </div>
    )
  }

  const userName = session.user?.name || 'User'
  const userEmail = session.user?.email || ''
  const userImage = session.user?.image
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Header */}
        <Card className="mb-8 border-none shadow-xl bg-gradient-to-r from-forest to-moss text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Leaf className="h-32 w-32 rotate-12" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={userImage || ''} />
                <AvatarFallback className="bg-white text-forest text-3xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <Badge className="bg-sunlight text-earth font-black mb-3 border-none shadow-sm uppercase tracking-wider px-3 py-1">
                  Community Member
                </Badge>
                <h1 className="text-4xl font-black mb-2 tracking-tight">
                  Welcome, {userName}!
                </h1>
                <p className="text-white/80 text-lg font-medium">{userEmail}</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" 
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Competition Entries', value: entries.length, icon: FileText, color: 'bg-forest/10 text-forest' },
            { label: 'Upcoming Events', value: upcomingEvents, icon: Ticket, color: 'bg-moss/10 text-moss' },
            { label: 'Eco-Challenges Won', value: wins, icon: Award, color: 'bg-sunlight/10 text-earth' },
            { label: 'Trees Impacted', value: '150+', icon: Star, color: 'bg-blue-500/10 text-blue-600' },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-md hover:shadow-lg transition-all group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Entries */}
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <Trophy className="h-6 w-6 text-sunlight" />
                Challenge Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border">
                  <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No challenge entries yet</p>
                  <Button variant="link" onClick={() => router.push('/competitions')} className="text-forest mt-2">
                    Browse Active Challenges
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => {
                    const StatusIcon = statusIcons[entry.status] || Clock
                    return (
                      <div
                        key={entry.id}
                        className="group p-5 rounded-2xl border border-border/50 bg-card hover:bg-muted/30 transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => router.push(`/?view=competition-detail&id=${entry.competition.id}`)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${entry.status === 'winner' ? 'bg-sunlight text-earth' : 'bg-muted'}`}>
                            <StatusIcon className={`h-6 w-6 ${entry.status === 'winner' ? 'text-earth' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-bold text-sm truncate uppercase tracking-tight">{entry.competition.title}</h4>
                              <Badge className={`${statusColors[entry.status]} border-none text-[9px] h-5 font-black uppercase`}>
                                {entry.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{entry.content}</p>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                <Calendar className="h-3 w-3" /> {format(new Date(entry.submittedAt), 'dd MMM yyyy')}
                              </span>
                              <span className="text-[10px] font-black text-forest flex items-center gap-1 uppercase tracking-wider">
                                <Trophy className="h-3 w-3" /> Round {entry.round}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Bookings */}
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <Calendar className="h-6 w-6 text-forest" />
                Event Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border">
                  <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No upcoming events booked</p>
                  <Button variant="link" onClick={() => router.push('/activities')} className="text-forest mt-2">
                    Explore Eco-Activities
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="group p-5 rounded-2xl border border-forest/10 bg-card hover:bg-forest/5 transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => router.push(`/?view=event-detail&id=${booking.eventId}`)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-forest flex items-center justify-center shrink-0 shadow-lg shadow-forest/20 group-hover:scale-105 transition-transform">
                          <Ticket className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="font-black text-sm truncate uppercase tracking-tight">{booking.event?.title || 'Event'}</h4>
                            <Badge className="bg-forest text-white border-none text-[9px] h-5 font-black uppercase">BOOKED</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-forest" /> {booking.event?.date ? format(new Date(booking.event.date), 'dd MMM yyyy') : 'No date'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-forest" /> {booking.event?.date ? format(new Date(booking.event.date), 'HH:mm') : 'No time'}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 text-forest" /> {booking.event?.location || 'TBA'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onUpdate={fetchData}
        user={fullUser || { name: userName, image: userImage }}
      />
    </motion.div>
  )
}
