'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Calendar,
  Users,
  ArrowRight,
  Camera,
  FileText,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

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

export function ActiveCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/competitions?active=true&limit=3')
      .then((res) => res.json())
      .then((data) => setCompetitions(data.competitions || []))
      .catch(() => setCompetitions([]))
      .finally(() => setLoading(false))
  }, [])

  const getStatus = (comp: Competition) => {
    const now = new Date()
    const start = new Date(comp.startDate)
    const end = new Date(comp.endDate)
    if (now < start) return 'upcoming'
    if (now > end) return 'ended'
    return 'active'
  }

  return (
    <section className="py-20 bg-leaf-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Active{' '}
              <span className="text-gradient-forest">Competitions</span>
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Showcase your environmental passion and win amazing eco-friendly
              prizes in our community competitions.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/competitions')}
            className="shrink-0 group"
          >
            View All Competitions
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
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
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No active competitions at the moment
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Stay tuned for exciting new challenges
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      {comp.coverImage ? (
                        <div
                          className="h-40 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style={{ backgroundImage: `url(${comp.coverImage})` }}
                        />
                      ) : (
                        <div className="h-40 w-full gradient-earth flex items-center justify-center">
                          <Trophy className="h-12 w-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={statusColor}>{statusLabel}</Badge>
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
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(comp.endDate), 'dd MMM yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {comp._count.entries} entries
                        </span>
                      </div>
                      {status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/competitions/${comp.id}`)}
                          className="mt-4 w-full bg-forest hover:bg-forest-dark text-primary-foreground group/btn"
                        >
                          Enter Now
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      )}
                      {status !== 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/competitions/${comp.id}`)}
                          className="mt-4 w-full"
                        >
                          View Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
