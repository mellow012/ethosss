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

interface Booking {
  id: string
  eventId: string
  status: string
  createdAt: string
  Event: {
    id: string
    title: string
    date: string
    location: string
  }
}

interface Entry {
  id: string
  content: string
  status: string
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
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const userId = (session?.user as any)?.id

  useEffect(() => {
    if (!userId) return
    startTransition(() => setLoading(true))

    // Fetch user's entries by getting all competitions' entries
    // This is a simplified approach - in production, you'd have a dedicated endpoint
    fetch(`/api/entries?competitionId=none&userId=${userId}`)
      .catch(() => ({ entries: [] }))
      .finally(() => {
        // Also fetch competitions to get entry data
        Promise.all([
          fetch('/api/competitions?limit=100').then((r) => r.json()),
          fetch(`/api/comments?postId=none`).catch(() => ({ comments: [] })),
        ])
          .then(([compData]) => {
            // Filter entries that belong to this user
            const allEntries: Entry[] = []
            const competitions = compData.competitions || []

            const fetchEntriesForComp = async (compId: string) => {
              try {
                const res = await fetch(
                  `/api/entries?competitionId=${compId}&userId=${userId}`
                )
                const data = await res.json()
                return (data.entries || []).map((e: any) => ({
                  ...e,
                  competition: {
                    id: compId,
                    title:
                      competitions.find((c: any) => c.id === compId)?.title ||
                      'Unknown',
                    prize:
                      competitions.find((c: any) => c.id === compId)?.prize ||
                      '',
                  },
                }))
              } catch {
                return []
              }
            }

            return Promise.all(
              competitions.map((c: any) => fetchEntriesForComp(c.id))
            )
          })
          .then((entryArrays) => {
            setEntries(entryArrays.flat())
          })
          .then(() => fetch('/api/events/register'))
          .then(res => res.json())
          .then(data => setBookings(data.bookings || []))
          .catch(() => setEntries([]))
          .finally(() => setLoading(false))
      })
  }, [userId])

  const statusColors: Record<string, string> = {
    pending: 'bg-sunlight/10 text-earth dark:text-sunlight',
    approved: 'bg-green-500/10 text-green-600 dark:text-green-400',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
    winner: 'bg-sunlight/20 text-earth dark:text-sunlight font-semibold',
  }

  const statusIcons: Record<string, React.ElementType> = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
    winner: Award,
  }

  const wins = entries.filter((e) => e.status === 'winner').length
  const approved = entries.filter((e) => e.status === 'approved').length

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
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userImage || ''} />
                <AvatarFallback className="bg-forest text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome, {userName}!
                </h1>
                <p className="text-muted-foreground">{userEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Entries',
              value: entries.length,
              icon: FileText,
              color: 'text-forest',
            },
            {
              label: 'Approved',
              value: approved,
              icon: CheckCircle2,
              color: 'text-green-500',
            },
            {
              label: 'Wins',
              value: wins,
              icon: Award,
              color: 'text-sunlight',
            },
            {
              label: 'Booked Events',
              value: bookings.length,
              icon: Ticket,
              color: 'text-forest',
            },
            {
              label: 'Member Since',
              value: new Date().toLocaleDateString('en-GB', {
                month: 'short',
                year: 'numeric',
              }),
              icon: Calendar,
              color: 'text-muted-foreground',
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Entries */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-forest" />
              My Competition Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-10">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  You haven&apos;t entered any competitions yet
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/competitions')}
                  className="mt-4"
                >
                  Browse Competitions
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => {
                  const StatusIcon =
                    statusIcons[entry.status] || Clock
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          entry.status === 'winner'
                            ? 'bg-sunlight/20'
                            : 'bg-muted'
                        }`}
                      >
                        <StatusIcon
                          className={`h-4 w-4 ${
                            entry.status === 'winner'
                              ? 'text-sunlight'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {entry.competition.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${statusColors[entry.status]}`}
                          >
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {entry.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(entry.submittedAt),
                            'dd MMM yyyy'
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-forest" />
              My Event Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  You haven&apos;t booked any events yet
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/activities')}
                  className="mt-4"
                >
                  Browse Activities
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-forest/10 bg-forest/5 hover:bg-forest/10 transition-all cursor-pointer"
                    onClick={() => router.push(`/?view=event-detail&id=${booking.eventId}`)}
                  >
                    <div className="h-10 w-10 rounded-full bg-forest flex items-center justify-center shrink-0 shadow-lg shadow-forest/20">
                      <Ticket className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base truncate">{booking.Event.title}</h4>
                        <Badge className="bg-forest text-primary-foreground border-none text-[10px]">BOOKED</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {format(new Date(booking.Event.date), 'dd MMM yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {format(new Date(booking.Event.date), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{booking.Event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
