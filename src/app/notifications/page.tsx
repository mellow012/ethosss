'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Inbox, 
  Check, 
  CheckCheck, 
  ExternalLink, 
  Trash2, 
  Search,
  Filter,
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const fetchNotifications = async () => {
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (err) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [session])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        )
      }
    } catch (err) {
      toast.error('Failed to update notification')
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        toast.success('All notifications marked as read')
      }
    } catch (err) {
      toast.error('Failed to update notifications')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-forest" />
    }
  }

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || 
                          (filter === 'unread' && !n.isRead) || 
                          (filter === 'read' && n.isRead)
    return matchesSearch && matchesFilter
  })

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Please sign in</h2>
        <p className="text-muted-foreground mt-2">You need to be logged in to view your notifications.</p>
        <Button onClick={() => router.push('/login')} className="mt-6 bg-forest text-white">
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-forest/10 text-forest">
                <Inbox className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Your <span className="text-forest">Notifications</span></h1>
            </div>
            <p className="text-muted-foreground font-medium">Stay updated with your latest environmental impact and activities.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              disabled={loading || notifications.every(n => n.isRead)}
              className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 border-border/50 bg-background shadow-sm hover:bg-forest/5 hover:text-forest"
            >
              <CheckCheck className="h-3 w-3 mr-2" /> Mark All as Read
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchNotifications}
              className="h-10 w-10 rounded-xl hover:bg-forest/5"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-xl rounded-3xl mb-8 overflow-hidden">
          <CardContent className="p-4 bg-background">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search notifications..." 
                  className="pl-10 h-11 bg-muted/50 border-none rounded-2xl focus-visible:ring-forest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-2xl">
                {(['all', 'unread', 'read'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f 
                        ? 'bg-background text-forest shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-6 flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 text-center bg-background rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-10 w-10 text-muted-foreground/20" />
              </div>
              <h3 className="text-xl font-bold">No notifications found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`group border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden relative ${!n.isRead ? 'bg-forest/[0.03]' : 'bg-background'}`}>
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-forest" />
                    )}
                    <CardContent className="p-6 flex gap-4 md:gap-6">
                      <div className={`shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center bg-background border border-border/50 shadow-sm transition-transform group-hover:scale-110`}>
                        {getIcon(n.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                          <h3 className={`text-lg font-bold ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {n.title}
                          </h3>
                          <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-full whitespace-nowrap">
                            {format(new Date(n.createdAt), 'MMMM d, yyyy • HH:mm')}
                          </span>
                        </div>
                        
                        <p className={`text-sm leading-relaxed mb-4 ${!n.isRead ? 'text-foreground/80' : 'text-muted-foreground/70'}`}>
                          {n.message}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          {n.link && (
                            <Button 
                              onClick={() => {
                                if (!n.isRead) markAsRead(n.id)
                                router.push(n.link!)
                              }}
                              className="h-9 px-5 rounded-xl bg-forest hover:bg-forest-dark text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-forest/20"
                            >
                              Take Action <ArrowRight className="h-3 w-3 ml-2" />
                            </Button>
                          )}
                          {!n.isRead && (
                            <Button 
                              variant="outline" 
                              onClick={() => markAsRead(n.id)}
                              className="h-9 px-5 rounded-xl border-forest/20 text-forest hover:bg-forest/5 font-black uppercase tracking-widest text-[10px]"
                            >
                              <Check className="h-3 w-3 mr-2" /> Mark as Read
                            </Button>
                          )}
                          {n.isRead && (
                            <Badge variant="secondary" className="h-9 px-4 rounded-xl border-none bg-muted text-muted-foreground font-bold uppercase tracking-widest text-[9px]">
                              Already Read
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )
          }
        </div>
      </div>
    </div>
  )
}
