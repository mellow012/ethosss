'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, Check, CheckCheck, Inbox, ExternalLink, X, Info, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export function NotificationBell() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    if (!session) return
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length)
      }
    } catch (err) {
      console.error('Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
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
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      }
    } catch (err) {
      toast.error('Failed to update notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  if (!session) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-forest" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group hover:bg-forest/5 rounded-full transition-all">
          <AnimatePresence mode='wait'>
            {unreadCount > 0 ? (
              <motion.div
                key="unread"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.8, rotate: 10 }}
              >
                <BellRing className="h-5 w-5 text-forest group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-forest text-[10px] font-black text-white items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Bell className="h-5 w-5 text-muted-foreground group-hover:text-forest group-hover:scale-110 transition-all" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 rounded-2xl p-0 border-border/50 shadow-2xl overflow-hidden backdrop-blur-xl bg-background/95">
        <div className="p-4 bg-forest/5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-forest/10 text-forest">
              <Inbox className="h-4 w-4" />
            </div>
            <div>
              <DropdownMenuLabel className="p-0 font-black text-foreground">Notifications</DropdownMenuLabel>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Latest Alerts</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-[10px] font-black uppercase tracking-widest text-forest hover:text-forest-dark hover:bg-forest/5"
              onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
              disabled={loading}
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h4 className="font-bold text-foreground">All caught up!</h4>
              <p className="text-xs text-muted-foreground mt-1">No new notifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-forest/5 group relative ${!n.isRead ? 'bg-forest/[0.02]' : ''}`}
                >
                  {!n.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-forest" />
                  )}
                  <div className={`mt-1 shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-background border border-border/50 shadow-sm`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className={`text-sm font-bold truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                        {format(new Date(n.createdAt), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${!n.isRead ? 'text-foreground/80' : 'text-muted-foreground/70'}`}>
                      {n.message}
                    </p>
                    {n.link && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-forest opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ExternalLink className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  {!n.isRead && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-forest/10 rounded-lg transition-all"
                    >
                      <Check className="h-3 w-3 text-forest" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator className="m-0" />
        <div className="p-3 bg-muted/10 text-center">
          <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-forest" onClick={() => router.push('/notifications')}>
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
