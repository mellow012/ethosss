'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Clock,
  MapPin,
  Camera,
  FileText,
  HelpCircle,
  Tag as TagIcon,
  ChevronDown,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, isAfter, isBefore } from 'date-fns'

interface Activity {
  id: string
  title: string
  description: string
  type: 'challenge' | 'event'
  date: string // startDate for challenges, date for events
  endDate?: string // Only for challenges
  location?: string
  image?: string | null
  prize?: string
  entryType?: string
  recap?: string
  winnerName?: string
  isActive: boolean
}

export function ActivityList() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'challenge' | 'event'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [compRes, eventRes] = await Promise.all([
        fetch('/api/competitions?limit=100').then((r) => r.json()),
        fetch('/api/events?all=true&limit=100').then((r) => r.json()),
      ])

      const mappedComps: Activity[] = (compRes.competitions || []).map((c: any) => ({
        ...c,
        type: 'challenge',
        date: c.startDate,
      }))

      const mappedEvents: Activity[] = (eventRes.events || []).map((e: any) => ({
        ...e,
        type: 'event',
        date: e.date,
      }))

      setActivities([...mappedComps, ...mappedEvents].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ))
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatus = (activity: Activity) => {
    const now = new Date()
    const start = new Date(activity.date)
    const end = activity.endDate ? new Date(activity.endDate) : start

    if (activity.type === 'challenge') {
      if (isAfter(start, now)) return 'upcoming'
      if (isBefore(end, now)) return 'past'
      return 'active'
    } else {
      if (isAfter(start, now)) return 'upcoming'
      // Events are considered "past" if they happened more than 6 hours ago
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)
      if (isBefore(start, sixHoursAgo)) return 'past'
      return 'active'
    }
  }

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                          a.description.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === 'all' || a.type === typeFilter
      const status = getStatus(a)
      const matchesStatus = statusFilter === 'all' || status === statusFilter
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [activities, search, typeFilter, statusFilter])

  const renderCard = (activity: Activity) => {
    const status = getStatus(activity)
    const isChallenge = activity.type === 'challenge'
    const detailUrl = isChallenge ? `/competitions/${activity.id}` : `/events/${activity.id}`

    return (
      <motion.div
        key={activity.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full bg-card flex flex-col">
          <div className="relative h-48 sm:h-56 overflow-hidden">
            {activity.image || (activity as any).coverImage ? (
              <Image
                src={activity.image || (activity as any).coverImage}
                alt={activity.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isChallenge ? 'bg-forest/20' : 'bg-sunlight/20'}`}>
                {isChallenge ? <Trophy className="h-16 w-16 text-forest/40" /> : <Calendar className="h-16 w-16 text-earth/40" />}
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={
                status === 'active' ? 'bg-green-500/90' :
                status === 'upcoming' ? 'bg-sunlight/90 text-earth' :
                'bg-muted/90 text-muted-foreground'
              }>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-none shadow-sm">
                {isChallenge ? 'Challenge' : 'Event'}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-forest" />
                {format(new Date(activity.date), 'dd MMM yyyy')}
              </span>
              {activity.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-forest" />
                  <span className="line-clamp-1">{activity.location}</span>
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-forest transition-colors">
              {activity.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
              {activity.description}
            </p>

            {status === 'past' && (activity.recap || activity.winnerName) && (
              <div className="mb-6 p-3 bg-sage/10 rounded-lg border border-sage/20">
                <p className="text-xs font-bold text-forest uppercase mb-1 flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Result
                </p>
                {activity.winnerName && (
                  <p className="text-sm font-semibold">Winner: {activity.winnerName}</p>
                )}
                {activity.recap && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{activity.recap}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
              <div className="text-sm font-medium">
                {isChallenge ? (
                  <span className="text-sunlight font-bold flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" />
                    {activity.prize}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {(activity as any).price ? `$${(activity as any).price}` : 'Free Entry'}
                  </span>
                )}
              </div>
              <Button
                onClick={() => router.push(detailUrl)}
                variant="ghost"
                size="sm"
                className="text-forest hover:text-forest-dark hover:bg-forest/10 p-0 h-auto font-bold group/btn"
              >
                {status === 'past' ? 'View Recap' : 'View Details'}
                <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Search and Filters */}
      <div className="bg-background/50 backdrop-blur-md sticky top-16 z-30 py-6 border-b">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search challenges and events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50 border-forest/20 focus-visible:ring-forest"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-full md:w-[140px] bg-background/50">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="challenge">Challenges</SelectItem>
                <SelectItem value="event">Events</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)} className="w-full md:w-auto">
              <TabsList className="bg-muted/50 w-full md:w-auto">
                <TabsTrigger value="all" className="flex-1 md:flex-none">All</TabsTrigger>
                <TabsTrigger value="active" className="flex-1 md:flex-none">Active</TabsTrigger>
                <TabsTrigger value="upcoming" className="flex-1 md:flex-none">Upcoming</TabsTrigger>
                <TabsTrigger value="past" className="flex-1 md:flex-none">Past</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-md bg-card">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed">
          <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-foreground">No activities found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('')
              setTypeFilter('all')
              setStatusFilter('all')
            }}
            className="mt-6 border-forest text-forest hover:bg-forest hover:text-white"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredActivities.map(renderCard)}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
