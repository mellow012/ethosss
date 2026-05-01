'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  Send,
  Camera,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Competition {
  id: string
  title: string
  slug: string
  description: string
  rules: string | null
  coverImage: string | null
  prize: string
  entryType: string
  startDate: string
  endDate: string
  isActive: boolean
  maxEntries: number | null
  _count: { entries: number }
}

interface Entry {
  id: string
  content: string
  imageUrl: string | null
  status: string
  submittedAt: string
  user: { id: string; name: string; email: string; image: string | null }
}

import { useRouter } from 'next/navigation'

export function CompetitionDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Entry form
  const [entryContent, setEntryContent] = useState('')
  const [entryImageUrl, setEntryImageUrl] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch(`/api/competitions?limit=100`).then((r) => r.json()),
      fetch(`/api/entries?competitionId=${id}`).then((r) => r.json()),
    ])
      .then(([compData, entryData]) => {
        const found = (compData.competitions || []).find(
          (c: Competition) => c.id === id
        )
        setCompetition(found || null)
        setEntries(entryData.entries || [])
      })
      .catch(() => {
        toast.error('Failed to load competition')
      })
      .finally(() => setLoading(false))
  }, [id])

  const getStatus = (comp: Competition) => {
    const now = new Date()
    const start = new Date(comp.startDate)
    const end = new Date(comp.endDate)
    if (now < start) return 'upcoming'
    if (now > end) return 'ended'
    return 'active'
  }

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !entryContent.trim()) {
      if (!session) toast.error('Please log in to enter')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: id,
          content: entryContent.trim(),
          imageUrl: entryImageUrl.trim() || null,
        }),
      })

      if (res.ok) {
        toast.success('Entry submitted! It will be reviewed shortly.')
        setEntryContent('')
        setEntryImageUrl('')
        // Refresh entries
        const entryData = await fetch(
          `/api/entries?competitionId=${id}`
        ).then((r) => r.json())
        setEntries(entryData.entries || [])
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit entry')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">
          Competition not found
        </h2>
        <Button
          variant="outline"
          onClick={() => router.push('/competitions')}
          className="mt-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Competitions
        </Button>
      </div>
    )
  }

  const status = getStatus(competition)
  const isActive = status === 'active'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          onClick={() => router.push('/competitions')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Competitions
        </Button>

        {/* Cover Image */}
        {competition.coverImage && (
          <div
            className="w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-cover bg-center mb-8"
            style={{ backgroundImage: `url(${competition.coverImage})` }}
          />
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Badge
              className={
                status === 'active'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : status === 'upcoming'
                  ? 'bg-sunlight/10 text-earth dark:text-sunlight'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {status === 'active'
                ? 'Open Now'
                : status === 'upcoming'
                ? 'Coming Soon'
                : 'Ended'}
            </Badge>
            <Badge
              className={
                competition.entryType === 'photo'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : competition.entryType === 'story'
                  ? 'bg-forest/10 text-forest dark:text-forest-light'
                  : 'bg-sunlight/10 text-earth dark:text-sunlight'
              }
            >
              {competition.entryType === 'photo' && (
                <Camera className="h-3 w-3 mr-1" />
              )}
              {competition.entryType === 'story' && (
                <FileText className="h-3 w-3 mr-1" />
              )}
              {competition.entryType}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {competition.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-sunlight font-medium">
              <Trophy className="h-4 w-4" />
              {competition.prize}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(competition.startDate), 'dd MMM yyyy')} -{' '}
              {format(new Date(competition.endDate), 'dd MMM yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {competition._count.entries} entries
            </span>
          </div>
        </header>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-forest [&_blockquote]:pl-4 [&_blockquote]:italic">
            <ReactMarkdown>{competition.description}</ReactMarkdown>
          </div>
        </div>

        {/* Rules */}
        {competition.rules && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Rules</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1">
              <ReactMarkdown>{competition.rules}</ReactMarkdown>
            </div>
          </div>
        )}

        <Separator className="my-10" />

        {/* Entry Form */}
        {isActive ? (
          session ? (
            <Card className="mb-10">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Send className="h-5 w-5 text-forest" />
                  Submit Your Entry
                </h2>
                <form onSubmit={handleSubmitEntry} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Your Entry *{' '}
                      <span className="text-muted-foreground font-normal">
                        ({competition.entryType})
                      </span>
                    </label>
                    <Textarea
                      placeholder={
                        competition.entryType === 'story'
                          ? 'Write your environmental story...'
                          : competition.entryType === 'photo'
                          ? 'Describe your photo entry...'
                          : 'Enter your response...'
                      }
                      value={entryContent}
                      onChange={(e) => setEntryContent(e.target.value)}
                      rows={6}
                      required
                    />
                  </div>
                  {(competition.entryType === 'photo' ||
                    competition.entryType === 'other') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Image URL (optional)
                      </label>
                      <Input
                        placeholder="https://example.com/your-image.jpg"
                        value={entryImageUrl}
                        onChange={(e) => setEntryImageUrl(e.target.value)}
                      />
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={submitting || !entryContent.trim()}
                    className="bg-forest hover:bg-forest-dark text-primary-foreground"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit Entry'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-10">
              <CardContent className="p-6 text-center">
                <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold">Log in to Enter</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You need an account to submit your competition entry.
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  className="mt-4 bg-forest hover:bg-forest-dark text-primary-foreground"
                >
                  Log in
                </Button>
              </CardContent>
            </Card>
          )
        ) : null}

        {/* Previous Entries */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Entries ({entries.length})
          </h2>
          {entries.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No entries yet. Be the first to enter!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={entry.user.image || ''} />
                        <AvatarFallback className="bg-sage text-foreground text-xs">
                          {entry.user.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {entry.user.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              entry.status === 'winner'
                                ? 'bg-sunlight/20 text-earth'
                                : entry.status === 'approved'
                                ? 'bg-green-500/10 text-green-600'
                                : entry.status === 'rejected'
                                ? 'bg-red-500/10 text-red-600'
                                : ''
                            }`}
                          >
                            {entry.status === 'winner' && 'Winner'}
                            {entry.status === 'approved' && 'Approved'}
                            {entry.status === 'pending' && 'Pending'}
                            {entry.status === 'rejected' && 'Rejected'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {entry.content}
                        </p>
                        {entry.imageUrl && (
                          <div
                            className="mt-3 w-full h-48 rounded-lg overflow-hidden bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${entry.imageUrl})`,
                            }}
                          />
                        )}
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(
                            new Date(entry.submittedAt),
                            'dd MMM yyyy HH:mm'
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </article>
    </motion.div>
  )
}
