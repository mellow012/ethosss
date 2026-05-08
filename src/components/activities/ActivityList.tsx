'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Calendar as CalendarIcon,
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
  LayoutGrid,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles
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
import { 
  format, 
  isAfter, 
  isBefore, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns'

interface Activity {
  id: string
  title: string
  description: string
  type: 'challenge' | 'event'
  date: string 
  endDate?: string 
  location?: string
  image?: string | null
  coverImage?: string | null
  prize?: string
  entryType?: string
  recap?: string
  winnerName?: string
  isActive: boolean
  price?: number
}

export function ActivityList() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'challenge' | 'event'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

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
        <Card className="group overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500 h-full bg-card flex flex-col hover:-translate-y-2 rounded-3xl">
          <div className="relative h-48 sm:h-56 overflow-hidden">
            {(activity.image || activity.coverImage) ? (
              <Image
                src={activity.image || activity.coverImage || ''}
                alt={activity.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isChallenge ? 'bg-forest/10' : 'bg-gold/10'}`}>
                {isChallenge ? <Trophy className="h-16 w-16 text-forest/40" /> : <CalendarIcon className="h-16 w-16 text-gold/40" />}
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={`border-none font-bold uppercase tracking-widest text-[8px] px-3 py-1 ${
                status === 'active' ? 'bg-green-500 text-white' :
                status === 'upcoming' ? 'bg-gold text-forest-dark' :
                'bg-muted text-muted-foreground'
              }`}>
                {status}
              </Badge>
              <Badge className="bg-white/90 backdrop-blur-md text-forest border-none shadow-sm text-[8px] font-bold uppercase tracking-widest px-3">
                {activity.type}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-4">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-forest" />
                {format(new Date(activity.date), 'dd MMM yyyy')}
              </span>
              {activity.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-forest" />
                  <span className="line-clamp-1">{activity.location}</span>
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-foreground mb-3 line-clamp-2 group-hover:text-forest transition-colors tracking-tight">
              {activity.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 font-medium leading-relaxed">
              {activity.description}
            </p>

            <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-widest">
                {isChallenge ? (
                  <span className="text-gold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    {activity.prize}
                  </span>
                ) : (
                  <span className="text-forest">
                    {activity.price ? `$${activity.price}` : 'Free Entry'}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {isChallenge && status === 'active' && (
                  <Button
                    onClick={() => router.push(detailUrl + '#entry-form')}
                    className="bg-forest hover:bg-forest-dark text-white rounded-full px-4 h-8 font-black text-[9px] uppercase tracking-widest shadow-lg shadow-forest/20"
                  >
                    Enter Now
                  </Button>
                )}
                <Button
                  onClick={() => router.push(detailUrl)}
                  variant="ghost"
                  size="sm"
                  className="text-forest hover:text-forest-dark hover:bg-forest/5 p-0 h-auto font-black text-[10px] uppercase tracking-widest group/btn"
                >
                  {status === 'past' ? 'Recap' : 'Details'}
                  <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // --- Calendar Logic ---
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentMonth])

  const activitiesByDay = useMemo(() => {
    const map: Record<string, Activity[]> = {}
    activities.forEach(a => {
      const dateKey = format(new Date(a.date), 'yyyy-MM-dd')
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(a)
    })
    return map
  }, [activities])

  const selectedDayActivities = selectedDay ? activitiesByDay[format(selectedDay, 'yyyy-MM-dd')] || [] : []

  return (
    <div className="space-y-8">
      {/* Refactored Title and Navigation */}
      <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 border-b border-forest/10 pb-6">
        <div className="w-full">
          <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Activity <span className="text-forest">Hub</span></h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-70">Upcoming Challenges & Community Events</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            className={`rounded-full gap-2 px-6 h-10 font-bold text-xs uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-forest shadow-lg shadow-forest/20' : 'border-forest/20 text-forest'}`}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
            className={`rounded-full gap-2 px-6 h-10 font-bold text-xs uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-forest shadow-lg shadow-forest/20' : 'border-forest/20 text-forest'}`}
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Filters (Reduced size) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/40" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-10 rounded-full bg-muted/30 border-none focus-visible:ring-forest text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="w-full md:w-[130px] h-10 rounded-full bg-muted/30 border-none font-bold text-xs uppercase tracking-widest">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="challenge">Challenges</SelectItem>
              <SelectItem value="event">Events</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)} className="w-full md:w-auto">
            <TabsList className="bg-muted/30 h-10 p-1 rounded-full w-full md:w-auto">
              <TabsTrigger value="all" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-forest data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="active" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-forest data-[state=active]:text-white">Active</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-forest data-[state=active]:text-white">Upcoming</TabsTrigger>
              <TabsTrigger value="past" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-forest data-[state=active]:text-white">Past</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-56 w-full rounded-[2rem]" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        filteredActivities.length === 0 ? (
          <div className="text-center py-20 bg-forest/5 rounded-[3rem] border-2 border-dashed border-forest/20">
            <Filter className="h-16 w-16 text-forest/20 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tighter">No activities found</h3>
            <p className="text-muted-foreground mt-2 font-medium">Try broadening your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredActivities.map(renderCard)}
            </AnimatePresence>
          </div>
        )
      ) : (
        /* --- CALENDAR VIEW --- */
        <div className="space-y-12">
          <Card className="rounded-[3rem] border border-border/50 overflow-hidden bg-card shadow-xl">
            {/* Calendar Header */}
            <div className="p-8 bg-forest text-white flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="rounded-full hover:bg-white/20 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="rounded-full hover:bg-white/20 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 sm:p-8">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-4 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-4">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-px bg-border/50 border border-border/50 rounded-2xl overflow-hidden shadow-inner">
                {calendarDays.map((day, i) => {
                  const dayActivities = activitiesByDay[format(day, 'yyyy-MM-dd')] || []
                  const isSelected = selectedDay && isSameDay(day, selectedDay)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = isSameMonth(day, currentMonth)

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[100px] p-2 sm:p-4 bg-card transition-all cursor-pointer hover:bg-muted/50 relative group ${
                        !isCurrentMonth ? 'opacity-30' : ''
                      } ${isSelected ? 'ring-2 ring-forest ring-inset bg-forest/5' : ''}`}
                    >
                      <span className={`text-xs font-black mb-2 block ${isToday ? 'text-forest w-6 h-6 bg-forest/10 rounded-full flex items-center justify-center' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      
                      <div className="space-y-1">
                        {dayActivities.slice(0, 3).map(a => (
                          <div 
                            key={a.id} 
                            className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md truncate ${
                              a.type === 'challenge' ? 'bg-forest/10 text-forest' : 'bg-gold/10 text-gold-dark'
                            }`}
                          >
                            {a.title}
                          </div>
                        ))}
                        {dayActivities.length > 3 && (
                          <div className="text-[8px] font-black text-muted-foreground pl-1">
                            + {dayActivities.length - 3} more
                          </div>
                        )}
                      </div>

                      {dayActivities.length > 0 && (
                        <div className="absolute top-2 right-2 flex gap-0.5">
                          <div className={`w-1 h-1 rounded-full ${dayActivities.some(a => a.type === 'challenge') ? 'bg-forest' : 'bg-gold'}`} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Details Below Grid */}
          <AnimatePresence mode="wait">
            {selectedDay && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-forest rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-forest/20">
                    <span className="text-[10px] font-black uppercase">{format(selectedDay, 'MMM')}</span>
                    <span className="text-xl font-black leading-none">{format(selectedDay, 'dd')}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter">Activities for {format(selectedDay, 'MMMM do, yyyy')}</h4>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                      {selectedDayActivities.length} {selectedDayActivities.length === 1 ? 'activity' : 'activities'} scheduled
                    </p>
                  </div>
                </div>

                {selectedDayActivities.length === 0 ? (
                  <Card className="p-12 text-center rounded-[2.5rem] bg-muted/20 border-dashed border-2">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No activities scheduled for this day.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedDayActivities.map(renderCard)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
