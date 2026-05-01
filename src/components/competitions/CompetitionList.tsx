'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Calendar,
  Users,
  ArrowRight,
  Clock,
  FileText,
  Camera,
  HelpCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { startTransition } from 'react'

interface Competition {
  id: string
  title: string
  slug: string
  description: string
  coverImage: string | null
  prize: string
  entryType: string
  startDate: string
  endDate: string
  isActive: boolean
  maxEntries: number | null
  _count: { entries: number }
}

const entryTypeIcons: Record<string, React.ElementType> = {
  photo: Camera,
  story: FileText,
  quiz: HelpCircle,
}

const entryTypeColors: Record<string, string> = {
  photo: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  story: 'bg-forest/10 text-forest dark:text-forest-light',
  quiz: 'bg-sunlight/10 text-earth dark:text-sunlight',
}

export function CompetitionList() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    startTransition(() => setLoading(true))
    fetch(`/api/competitions?page=${page}&limit=9`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setCompetitions(data.competitions || [])
          setTotalPages(data.pagination?.totalPages || 1)
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load competitions')
          setCompetitions([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [page])

  const getStatus = (comp: Competition) => {
    const now = new Date()
    const start = new Date(comp.startDate)
    const end = new Date(comp.endDate)
    if (now < start) return 'upcoming'
    if (now > end) return 'ended'
    return 'active'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Header */}
      <div className="bg-leaf-pattern py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Environmental{' '}
              <span className="text-gradient-forest">Competitions</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Showcase your talent, share your environmental stories, and win
              amazing eco-friendly prizes. Open to all nature enthusiasts!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground">
              No competitions available
            </h3>
            <p className="text-muted-foreground mt-2">
              Check back soon for exciting new competitions
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((comp, index) => {
                const status = getStatus(comp)
                const EntryIcon = entryTypeIcons[comp.entryType] || FileText
                const statusColor =
                  status === 'active'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : status === 'upcoming'
                    ? 'bg-sunlight/10 text-earth dark:text-sunlight'
                    : 'bg-muted text-muted-foreground'
                const statusLabel =
                  status === 'active'
                    ? 'Open Now'
                    : status === 'upcoming'
                    ? 'Coming Soon'
                    : 'Ended'

                return (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link href={`/competitions/${comp.id}`} className="block h-full">
                    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      <div className="relative overflow-hidden">
                        {comp.coverImage ? (
                          <div
                            className="h-48 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                            style={{
                              backgroundImage: `url(${comp.coverImage})`,
                            }}
                          />
                        ) : (
                          <div className="h-48 w-full gradient-earth flex items-center justify-center">
                            <Trophy className="h-12 w-12 text-white/30" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className={statusColor}>{statusLabel}</Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className={entryTypeColors[comp.entryType] || 'bg-muted'}>
                            <EntryIcon className="h-3 w-3 mr-1" />
                            {comp.entryType}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-5 flex flex-col flex-1">
                        <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                          {comp.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-sunlight font-medium mt-2">
                          <Trophy className="h-4 w-4" />
                          {comp.prize}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(comp.startDate), 'dd MMM')} -{' '}
                            {format(new Date(comp.endDate), 'dd MMM yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {comp._count.entries} entries
                          </span>
                        </div>
                        {comp.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
                            {comp.description}
                          </p>
                        )}
                        <div
                          className={`mt-4 w-full group/btn inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 ${
                            status === 'active'
                              ? 'bg-forest hover:bg-forest-dark text-primary-foreground border-transparent'
                              : ''
                          }`}
                        >
                          {status === 'active' ? (
                            <>
                              Enter Now
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                          ) : (
                            'View Details'
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={
                        p === page
                          ? 'bg-forest hover:bg-forest-dark text-primary-foreground'
                          : ''
                      }
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
