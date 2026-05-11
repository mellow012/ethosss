'use client'

import { useEffect, useState, Fragment } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Award,
  Users,
  FileText,
  Trophy,
  Building2,
  Shield,
  Search,
  RefreshCw,
  MoreHorizontal,
  TreePine,
  Settings,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  Star,
  Leaf,
  Menu,
  Target,
  User,
  Mail,
  Phone,
  Image as ImageIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle,
  SheetHeader
} from '@/components/ui/sheet'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { AddSiteDialog } from './AddSiteDialog'
import { AddHotelDialog } from './AddHotelDialog'
import { AddCompetitionDialog } from './AddCompetitionDialog'
import { AddContentDialog } from './AddPostDialog'
import { AddSuccessStoryDialog } from './AddSuccessStoryDialog'
import { AddMediaDialog } from './AddMediaDialog'
import { SettingsTab } from './SettingsTab'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'



interface Post {
  id: string
  title: string
  published: boolean
  featured: boolean
  createdAt: string
  author: { name: string }
  category: { name: string } | null
  _count: { comments: number }
}

interface Hotel {
  id: string
  name: string
  city: string
  region: string
  ecoRating: number
  featured: boolean
  verified: boolean
  _count: { reviews: number }
}

interface Competition {
  id: string
  title: string
  prize: string
  isActive: boolean
  startDate: string
  endDate: string
  _count: { entries: number }
}

interface Entry {
  id: string
  content: string
  status: string
  submittedAt: string
  user: { name: string; email?: string; image?: string | null }
  competition: { title: string }
}

interface UserItem {
  id: string
  name: string | null
  email: string
  image?: string | null
  role: string
  isVerified: boolean
  createdAt: string
  _count: { posts: number; comments: number; entries: number }
}

interface SuccessStory {
  id: string
  title: string
  businessName: string
  category: string
  impact: string
  description: string
  featured: boolean
  createdAt: string
}

interface MediaItem {
  id: string
  title: string
  url: string
  type: string
  category: string | null
  description: string | null
  createdAt: string
}

interface PlantingSite {
  id: string
  name: string
  region: string
  latitude: number
  longitude: number
  treesPlanted: number
  status: string
  area: string
}


const fuzzyMatch = (text: string | null | undefined, query: string) => {
  if (!query) return true;
  if (!text) return false;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  
  // Simple fuzzy: check if characters appear in sequence
  let i = 0;
  for (const char of q) {
    i = t.indexOf(char, i);
    if (i === -1) return false;
    i++;
  }
  return true;
};

export function AdminDashboard() {
  const { data: session } = useSession()
  const { setSelectedId, setView } = useAppStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Handle deep-linking from notifications
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && ['overview', 'posts', 'hotels', 'competitions', 'entries', 'events', 'users', 'sites', 'success-stories', 'media', 'settings'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  // Data
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [sites, setSites] = useState<PlantingSite[]>([])
  const [stories, setStories] = useState<SuccessStory[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState('')
  const [deleteId, setDeleteId] = useState('')

  // Post editing dialog
  const [postEditOpen, setPostEditOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  // Other editing states
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [editingSite, setEditingSite] = useState<PlantingSite | null>(null)
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null)
  const [storyEditOpen, setStoryEditOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null)
  const [mediaEditOpen, setMediaEditOpen] = useState(false)

  // Entry review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewEntry, setReviewEntry] = useState<Entry | null>(null)
  const [reviewStatus, setReviewStatus] = useState('')

  // User role dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [roleUser, setRoleUser] = useState<UserItem | null>(null)
  const [newRole, setNewRole] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Export List Dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportData, setExportData] = useState<{ title: string; names: string[] } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Helper to prevent 500 errors from crashing the whole dashboard load
      const fetchJson = async (url: string) => {
        const res = await fetch(url);
        return res.ok ? res.json() : { error: true };
      };

      const [postsData, eventsData, hotelsData, compsData, usersData, sitesData, entriesData, eventRegistrationsData, storiesData, mediaData, analyticsData] = await Promise.all([
        fetchJson('/api/posts?all=true&limit=100'),
        fetchJson('/api/events?all=true&limit=100'),
        fetchJson('/api/hotels?limit=100'),
        fetchJson('/api/competitions?limit=100'),
        fetchJson('/api/users?limit=100'),
        fetchJson('/api/planting-sites'),
        fetchJson('/api/entries?limit=500'), // Fetch all entries once
        fetchJson('/api/events/register?all=true'),
        fetchJson('/api/success-stories?limit=100'),
        fetchJson('/api/media?limit=100'),
        fetchJson('/api/admin/analytics')
      ])

      setPosts(postsData.posts || [])
      setEvents(eventsData.events || [])
      setHotels(hotelsData.hotels || [])
      setCompetitions(compsData.competitions || [])
      setUsers(usersData.users || [])
      setSites(sitesData.sites || [])
      setStories(storiesData.stories || [])
      setMedia(mediaData.media || [])
      setEventRegistrations(eventRegistrationsData.bookings || [])
      setAnalytics(analyticsData.error ? null : analyticsData)

      // Optimized: Map competition names to entries locally instead of re-fetching per competition
      const compMap = new Map((compsData.competitions || []).map((c: any) => [c.id, c.title]));
      const mappedEntries = (entriesData.entries || []).map((entry: any) => ({
        ...entry,
        competition: entry.competition || { title: compMap.get(entry.competitionId) || 'Unknown' }
      }));
      setEntries(mappedEntries)

    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if ((session?.user as any)?.role === 'admin') {
      fetchData()
    }
  }, [session])

  const handleDelete = async () => {
    if (!deleteType || !deleteId) return
    setActionLoading('delete')
    try {
      const endpoints: Record<string, string> = {
        post: '/api/posts',
        event: '/api/events',
        hotel: '/api/hotels',
        competition: '/api/competitions',
        site: '/api/planting-sites',
        success_story: '/api/success-stories',
        media: '/api/media',
      }

      const endpoint = endpoints[deleteType]
      if (!endpoint) return

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      })

      if (res.ok) {
        toast.success(`${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} deleted successfully`)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setActionLoading(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleReviewEntry = async () => {
    if (!reviewEntry || !reviewStatus) return
    setActionLoading('review')
    try {
      const res = await fetch('/api/entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewEntry.id, status: reviewStatus }),
      })

      if (res.ok) {
        toast.success(`Entry ${reviewStatus} successfully`)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update entry')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setActionLoading(null)
      setReviewDialogOpen(false)
    }
  }

  const handleRoleChange = async () => {
    if (!roleUser || !newRole) return
    setActionLoading('role')
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roleUser.id, role: newRole }),
      })

      if (res.ok) {
        toast.success(`Role updated to ${newRole}`)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update role')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setActionLoading(null)
      setRoleDialogOpen(false)
    }
  }

  if (!session || (session.user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You need admin privileges to access this page.
          </p>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="mt-6"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-sunlight/10 text-earth dark:text-sunlight',
    approved: 'bg-green-500/10 text-green-600 dark:text-green-400',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
    winner: 'bg-sunlight/20 text-earth dark:text-sunlight font-semibold',
  }
  const allContent = [
    ...posts.map(p => ({ ...p, contentType: 'post' })),
    ...events.map(e => ({ ...e, contentType: 'event' }))
  ].sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt || a.date).getTime()
    const dateB = new Date(b.createdAt || b.date).getTime()
    return dateB - dateA
  })

  const Sidebar = ({ mobile = false, setOpen = (val: boolean) => {} }: { mobile?: boolean, setOpen?: (open: boolean) => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-primary-foreground shadow-lg shadow-forest/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-tight">Admin</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Ethosss Platform</p>
          </div>
        </div>
      </div>

      {mobile && (
        <div className="px-4 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-forest"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'content', label: 'Content', icon: FileText },
          { id: 'hotels', label: 'Eco-Hotels', icon: Building2 },
          { id: 'competitions', label: 'Competitions', icon: Trophy },
          { id: 'entries', label: 'Entries', icon: Edit },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'sites', label: 'Planting Sites', icon: TreePine },
          { id: 'stories', label: 'Success Stories', icon: Target },
          { id: 'media', label: 'Media Hub', icon: ImageIcon },
          { id: 'settings', label: 'Global Settings', icon: Settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); if (mobile) setOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-forest text-primary-foreground shadow-md shadow-forest/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-forest/20 flex items-center justify-center text-forest font-bold text-xs">
            {session?.user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{session?.user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">Administrator</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="w-full mt-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Site
        </Button>
      </div>
    </div>
  )


  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-none">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin Navigation</SheetTitle>
                </SheetHeader>
                <Sidebar mobile setOpen={setIsMobileMenuOpen} />
              </SheetContent>
            </Sheet>

            <h2 className="text-lg font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === 'overview' ? 'activities' : activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-64 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-forest"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            {activeTab === 'content' && (
              <AddContentDialog 
                onSuccess={() => { fetchData(); setPostEditOpen(false); setEditingPost(null); }} 
                editingItem={editingPost}
                open={postEditOpen}
                onOpenChange={setPostEditOpen}
              />
            )}
            {activeTab === 'sites' && (
              <>
                <AddSiteDialog onSuccess={fetchData} />
                {editingSite && (
                  <AddSiteDialog open={!!editingSite} onOpenChange={(open) => !open && setEditingSite(null)} editingSite={editingSite} onSuccess={fetchData} />
                )}
              </>
            )}
            {activeTab === 'hotels' && (
              <>
                <AddHotelDialog onSuccess={fetchData} />
                {editingHotel && (
                  <AddHotelDialog open={!!editingHotel} onOpenChange={(open) => !open && setEditingHotel(null)} editingHotel={editingHotel} onSuccess={fetchData} />
                )}
              </>
            )}
            {activeTab === 'competitions' && (
              <>
                <AddCompetitionDialog onSuccess={fetchData} />
                {editingCompetition && (
                  <AddCompetitionDialog open={!!editingCompetition} onOpenChange={(open) => !open && setEditingCompetition(null)} editingCompetition={editingCompetition} onSuccess={fetchData} />
                )}
              </>
            )}
            {activeTab === 'stories' && (
              <AddSuccessStoryDialog 
                onSuccess={fetchData} 
                editingItem={editingStory}
                open={storyEditOpen}
                onOpenChange={setStoryEditOpen}
              />
            )}
            {activeTab === 'media' && (
              <>
                <AddMediaDialog onSuccess={fetchData} />
                {editingMedia && (
                  <AddMediaDialog 
                    open={mediaEditOpen} 
                    onOpenChange={setMediaEditOpen} 
                    editingItem={editingMedia} 
                    onSuccess={() => { fetchData(); setEditingMedia(null); setMediaEditOpen(false); }} 
                  />
                )}
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8 mt-0">

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Blog Posts', value: posts.length, icon: FileText, color: 'text-forest', bg: 'bg-forest/10', trend: '+12%', sub: 'this month' },
                    { label: 'Eco-Hotels', value: hotels.length, icon: Building2, color: 'text-moss', bg: 'bg-moss/10', trend: '+2', sub: 'new partners' },
                    { label: 'Total Entries', value: entries.length + eventRegistrations.length, icon: Edit, color: 'text-sunlight', bg: 'bg-sunlight/10', trend: '+45', sub: 'submissions' },
                    { label: 'Community Users', value: users.length, icon: Users, color: 'text-bark', bg: 'bg-bark/10', trend: '+128', sub: 'members' },
                  ].map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm bg-card hover:shadow-md transition-all group overflow-hidden relative">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-20`}>
                            <stat.icon className="h-6 w-6" />
                          </div>
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none font-medium text-[10px]">
                            {stat.trend}
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <p className="text-[10px] text-muted-foreground/60">{stat.sub}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activities */}
                  <Card className="lg:col-span-3 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-lg">Recent Activities</CardTitle>
                        <CardDescription>Latest community and content updates</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="text-forest hover:text-forest-dark gap-1">
                        View All <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                        ) : (
                          <>
                            {posts.filter(p => fuzzyMatch(p.title, searchQuery)).slice(0, 2).map(post => (
                              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
                                <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate">{post.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-[10px] h-4 uppercase">{post.category?.name || 'Blog'}</Badge>
                                    <span className="text-[10px] text-muted-foreground">Published {format(new Date(post.createdAt), 'MMM d')}</span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/blog/${post.id}`)}>
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {entries.filter(e => fuzzyMatch(e.user.name, searchQuery) || fuzzyMatch(e.competition.title, searchQuery)).slice(0, 2).map(entry => (
                              <div key={entry.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
                                <div className="h-12 w-12 rounded-xl bg-sunlight/10 flex items-center justify-center text-sunlight shrink-0">
                                  <Trophy className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate">{entry.user.name} submitted an entry</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted-foreground">In {entry.competition.title}</span>
                                    <Badge variant="outline" className={`text-[10px] h-4 ${statusColors[entry.status]}`}>{entry.status}</Badge>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveTab('entries')}>
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-8 mt-0">
                {/* Latest Content Highlight */}
                {allContent.filter(p => fuzzyMatch(p.title, searchQuery)).length > 0 && (
                  <Card className="border-none shadow-sm overflow-hidden bg-forest text-white group cursor-pointer" onClick={() => router.push(allContent[0].contentType === 'post' ? `/blog/${allContent[0].id}` : '#')}>
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="w-full md:w-1/3 aspect-video md:aspect-auto relative overflow-hidden">
                        <img 
                          src={(allContent[0] as any).coverImage || (allContent[0] as any).image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt={allContent[0].title}
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-sunlight text-bark border-none font-bold">LATEST</Badge>
                        </div>
                      </div>
                      <CardContent className="p-8 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="outline" className="text-sunlight border-sunlight/30">
                            {allContent[0].contentType === 'post' ? allContent[0].category?.name || 'Post' : 'Event'}
                          </Badge>
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {format(new Date(allContent[0].createdAt || allContent[0].date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 group-hover:text-sunlight transition-colors leading-tight">
                          {allContent[0].title}
                        </h2>
                        {allContent[0].contentType === 'post' && (
                          <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-xs font-bold">
                                {allContent[0].author?.name?.charAt(0)}
                              </div>
                              <span className="text-sm font-medium">{allContent[0].author?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <MessageSquare className="h-4 w-4" /> {allContent[0]._count?.comments || 0} Comments
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
                  ) : (
                    allContent
                      .filter(item => fuzzyMatch(item.title, searchQuery) || fuzzyMatch(item.category?.name || '', searchQuery))
                      .map((item) => (
                      <Card key={item.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={(item as any).coverImage || (item as any).image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt={item.title}
                          />
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Badge className={`${item.contentType === 'event' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-forest hover:bg-forest'} text-white border-none font-bold uppercase text-[10px]`}>
                              {item.contentType}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                {item.contentType === 'post' && (
                                  <DropdownMenuItem onClick={() => router.push(`/blog/${item.id}`)} className="gap-2">
                                    <Eye className="h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => { setEditingPost(item); setPostEditOpen(true); }} className="gap-2">
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setDeleteType(item.contentType); setDeleteId(item.id); setDeleteDialogOpen(true); }} className="text-destructive gap-2">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary" className="bg-forest/10 text-forest text-[10px] uppercase font-bold tracking-wider">
                              {item.contentType === 'post' ? item.category?.name || 'Uncategorized' : 'Upcoming Event'}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(item.createdAt || item.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-4 line-clamp-2 leading-tight group-hover:text-forest transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            {item.contentType === 'post' ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                  {item.author?.name?.charAt(0) || 'A'}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{item.author?.name || 'Admin'}</span>
                              </div>
                            ) : (
                              <div className="text-xs font-medium text-muted-foreground line-clamp-1 flex-1 pr-2">
                                {item.location}
                              </div>
                            )}
                            <div className="flex items-center gap-3 shrink-0">
                              {item.contentType === 'post' && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <MessageSquare className="h-3 w-3" /> {item._count?.comments || 0}
                                </div>
                              )}
                              {item.published || item.isActive ? (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-[9px] h-4">Live</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[9px] h-4">Draft</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Hotels Tab */}
              <TabsContent value="hotels" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)
                  ) : (
                    hotels
                      .filter(hotel => fuzzyMatch(hotel.name, searchQuery) || fuzzyMatch(hotel.city, searchQuery) || fuzzyMatch(hotel.region, searchQuery))
                      .map((hotel) => (
                      <Card key={hotel.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={(hotel as any).coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt={hotel.name}
                          />
                          <div className="absolute top-3 right-3 flex gap-2">
                            {hotel.verified && (
                              <Badge className="bg-white/90 backdrop-blur-sm text-green-600 border-none shadow-sm font-bold text-[10px]">VERIFIED</Badge>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                <DropdownMenuItem onClick={() => router.push(`/hotels/${hotel.id}`)} className="gap-2">
                                  <Eye className="h-4 w-4" /> View Page
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingHotel(hotel)} className="gap-2">
                                  <Edit className="h-4 w-4" /> Edit Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setDeleteType('hotel'); setDeleteId(hotel.id); setDeleteDialogOpen(true); }} className="text-destructive gap-2">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg group-hover:text-forest transition-colors leading-tight">
                              {hotel.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sunlight font-bold text-sm shrink-0">
                              <Star className="h-3 w-3 fill-current" /> {hotel.ecoRating}.0
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                             {hotel.city}, {hotel.region}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Leaf key={i} className={`h-3 w-3 ${i < hotel.ecoRating ? 'text-forest' : 'text-muted/30'}`} />
                              ))}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                              <span>{hotel._count.reviews} Reviews</span>
                              {hotel.featured && <Badge variant="secondary" className="bg-sunlight/10 text-bark text-[9px] h-4">Featured</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Competitions Tab */}
              <TabsContent value="competitions" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
                  ) : (
                    competitions
                      .filter(comp => fuzzyMatch(comp.title, searchQuery))
                      .map((comp) => (
                        <Card key={comp.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                          <div className="p-6 bg-forest text-white relative overflow-hidden">
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <Badge className={`${comp.isActive ? 'bg-green-500' : 'bg-muted'} text-white border-none font-bold text-[10px]`}>
                                {comp.isActive ? 'ACTIVE' : 'EXPIRED'}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-full">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                  <DropdownMenuItem onClick={() => router.push(`/competitions/${comp.id}`)} className="gap-2">
                                    <Eye className="h-4 w-4" /> Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEditingCompetition(comp)} className="gap-2">
                                    <Edit className="h-4 w-4" /> Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => { setDeleteType('competition'); setDeleteId(comp.id); setDeleteDialogOpen(true); }} className="text-destructive gap-2">
                                    <Trash2 className="h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-sunlight transition-colors line-clamp-1">{comp.title}</h3>
                            <p className="text-sunlight text-2xl font-black">{comp.prize}</p>
                          </div>
                          <Trophy className="absolute -bottom-4 -right-4 h-24 w-24 text-white/5 rotate-12" />
                        </div>
                        <CardContent className="p-5">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total Entries</span>
                              <span className="font-bold">{comp._count.entries}</span>
                            </div>
                            {(comp as any).totalRounds > 1 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Round</span>
                                <span className="font-bold text-forest">{(comp as any).currentRound} / {(comp as any).totalRounds}</span>
                              </div>
                            )}
                            {(comp as any).winnerId && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Winner</span>
                                <Badge className="bg-sunlight/10 text-sunlight border-none text-[10px]">🏆 Selected</Badge>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">End Date</span>
                              <span className="font-medium">{format(new Date(comp.endDate), 'MMM d, yyyy')}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex gap-2">
                              <Button 
                                className="flex-1 bg-forest/10 hover:bg-forest/20 text-forest border-none shadow-none font-bold" 
                                onClick={() => setActiveTab('entries')}
                              >
                                Review Entries
                              </Button>
                              <Button
                                variant="outline"
                                className="border-forest/30 text-forest hover:bg-forest/10 font-bold"
                                onClick={() => {
                                  const compEntries = entries.filter(e => e.competition.title === comp.title);
                                  setExportData({
                                    title: `Participant List: ${comp.title}`,
                                    names: compEntries.map(e => e.user.name || 'Anonymous')
                                  });
                                  setExportDialogOpen(true);
                                }}
                              >
                                Export
                              </Button>
                              {comp.isActive && (comp as any).conditionType === 'rounds' && (comp as any).totalRounds > 1 && (
                                <Button
                                  variant="outline"
                                  className="border-sunlight/30 text-sunlight hover:bg-sunlight/10 font-bold"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/competitions/${comp.id}/advance-round`, { method: 'POST' })
                                      const data = await res.json()
                                      if (res.ok) {
                                        toast.success(data.message)
                                        fetchData()
                                      } else {
                                        toast.error(data.error || 'Failed to advance')
                                      }
                                    } catch { toast.error('Something went wrong') }
                                  }}
                                >
                                  Advance
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="entries" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Competition Entries</h3>
                    <Badge variant="outline">{entries.length} Submissions</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                      Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
                    ) : entries.length === 0 ? (
                      <p className="text-muted-foreground col-span-full py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border">No competition entries yet.</p>
                    ) : (
                      entries
                        .filter(entry => fuzzyMatch(entry.user.name, searchQuery) || fuzzyMatch(entry.competition.title, searchQuery))
                        .map((entry) => (
                        <Card key={entry.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-bark overflow-hidden">
                                  {entry.user.image ? <img src={entry.user.image} className="w-full h-full object-cover" /> : (entry.user.name?.charAt(0) || 'U')}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm leading-tight">{entry.user.name}</h4>
                                  <p className="text-[10px] text-muted-foreground">In {entry.competition.title}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className={`text-[10px] ${statusColors[entry.status]}`}>
                                {entry.status}
                              </Badge>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-xl text-sm italic text-muted-foreground mb-6 line-clamp-3 relative">
                              &ldquo;{entry.content}&rdquo;
                            </div>
                            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-4">
                               <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                 <Calendar className="h-3 w-3" /> {format(new Date(entry.submittedAt), 'MMM d, yyyy')}
                               </span>
                               <div className="flex gap-2">
                                 <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50" onClick={() => { setReviewEntry(entry); setReviewStatus('approved'); setReviewDialogOpen(true); }}>
                                   <CheckCircle2 className="h-4 w-4" />
                                 </Button>
                                 <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" onClick={() => { setReviewEntry(entry); setReviewStatus('rejected'); setReviewDialogOpen(true); }}>
                                   <XCircle className="h-4 w-4" />
                                 </Button>
                                 <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sunlight hover:bg-sunlight/10" onClick={() => { setReviewEntry(entry); setReviewStatus('winner'); setReviewDialogOpen(true); }}>
                                   <Award className="h-4 w-4" />
                                 </Button>
                               </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Event Registrations</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-forest/30 text-forest font-bold h-8"
                        onClick={() => {
                          // Group names by event
                          const events = Array.from(new Set(eventRegistrations.map(r => r.event?.title || 'Unknown Event')));
                          const currentEvent = events[0] || 'Events';
                          const names = eventRegistrations.map(r => r.fullName || r.user?.name || 'Anonymous');
                          setExportData({
                            title: `Event Participants`,
                            names: names
                          });
                          setExportDialogOpen(true);
                        }}
                      >
                        Export All Names
                      </Button>
                      <Badge variant="outline">{eventRegistrations.length} Bookings</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                    ) : eventRegistrations.length === 0 ? (
                      <p className="text-muted-foreground col-span-full py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border">No event registrations yet.</p>
                    ) : (
                      eventRegistrations
                        .filter(reg => fuzzyMatch(reg.user?.name, searchQuery) || fuzzyMatch(reg.event?.title, searchQuery))
                        .map((reg) => (
                        <Card key={reg.id} className="border-none shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center font-bold text-forest text-xs overflow-hidden">
                                {reg.user?.image ? <img src={reg.user.image} className="w-full h-full object-cover" /> : reg.user?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{reg.user?.name || 'Unknown User'}</h4>
                                <p className="text-[10px] text-muted-foreground truncate">{reg.user?.email}</p>
                              </div>
                              <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] h-5">BOOKED</Badge>
                            </div>
                            <div className="flex flex-col gap-3 mb-4">
                              <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl">
                                <Calendar className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">{reg.event?.title || 'Unknown Event'}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {reg.event?.date ? format(new Date(reg.event.date), 'MMM d, yyyy') : 'No date'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2 pl-1">
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <User className="h-3 w-3 text-forest/60" />
                                  <span className="font-bold text-foreground">{reg.fullName || reg.user?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <Mail className="h-3 w-3 text-forest/60" />
                                  <span>{reg.email || reg.user?.email}</span>
                                </div>
                                {reg.phone && (
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                    <Phone className="h-3 w-3 text-forest/60" />
                                    <span>{reg.phone}</span>
                                  </div>
                                )}
                              </div>

                              {reg.notes && (
                                <div className="p-3 bg-sunlight/5 rounded-xl border border-sunlight/10 text-[10px] text-muted-foreground leading-relaxed">
                                  <span className="font-bold text-earth block mb-1">Notes:</span>
                                  {reg.notes}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6 mt-0">
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {loading ? (
                        Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                      ) : (
                        users
                          .filter(user => fuzzyMatch(user.name || '', searchQuery) || fuzzyMatch(user.email, searchQuery))
                          .map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold shrink-0">
                                  {user.image ? <img src={user.image} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" /> : user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-bold text-sm">{user.name || 'Anonymous User'}</h3>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="hidden md:flex gap-4 text-[10px] font-medium text-muted-foreground">
                                  <span className="flex flex-col items-center"><b>{user._count.posts}</b> Posts</span>
                                  <span className="flex flex-col items-center"><b>{user._count.comments}</b> Comments</span>
                                  <span className="flex flex-col items-center"><b>{user._count.entries}</b> Entries</span>
                                </div>
                                <Badge variant="secondary" className={user.role === 'admin' ? 'bg-forest/10 text-forest h-6' : 'text-muted-foreground h-6'}>
                                  {user.role}
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" onClick={() => { setRoleUser(user); setNewRole(user.role); setRoleDialogOpen(true); }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sites Tab */}
              <TabsContent value="sites" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
                  ) : (
                    sites
                      .filter(site => fuzzyMatch(site.name, searchQuery) || fuzzyMatch(site.region, searchQuery))
                      .map((site) => (
                        <Card key={site.id} className="border-none shadow-sm group overflow-hidden hover:shadow-xl transition-all duration-300">
                          <div className="aspect-[2/1] relative overflow-hidden">
                            <img 
                              src={(site as any).image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                              alt={site.name}
                            />
                            <div className="absolute top-3 right-3">
                              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity mr-2" onClick={() => setEditingSite(site)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setDeleteType('site'); setDeleteId(site.id); setDeleteDialogOpen(true); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-forest transition-colors mb-2">{site.name}</h3>
                            <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1">
                              {site.region}
                            </p>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-muted/50 p-3 rounded-xl">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Trees Planted</span>
                                  <span className="text-xl font-black text-forest">{site.treesPlanted.toLocaleString()}</span>
                                </div>
                                <TreePine className="h-8 w-8 text-forest/20" />
                              </div>
                              <div className="flex items-center justify-between pt-2">
                                <Badge className={site.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}>
                                  {site.status.toUpperCase()}
                                </Badge>
                                <span className="text-[10px] font-mono text-muted-foreground">{site.latitude.toFixed(2)}N, {site.longitude.toFixed(2)}E</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </TabsContent>

              {/* Success Stories Tab */}
              <TabsContent value="stories" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)
                  ) : (
                    stories
                      .filter(story => fuzzyMatch(story.businessName, searchQuery) || fuzzyMatch(story.title, searchQuery))
                      .map((story) => (
                      <Card key={story.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={(story as any).image || 'https://images.unsplash.com/photo-1518005020251-58296d8f8d60?w=800'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt={story.businessName}
                          />
                          <div className="absolute top-3 right-3 flex gap-2">
                            {story.featured && (
                              <Badge className="bg-sunlight text-bark border-none shadow-sm font-bold text-[10px]">FEATURED</Badge>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                <DropdownMenuItem onClick={() => { setEditingStory(story); setStoryEditOpen(true); }} className="gap-2">
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setDeleteType('success_story'); setDeleteId(story.id); setDeleteDialogOpen(true); }} className="text-destructive gap-2">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="bg-forest/10 text-forest text-[10px] font-bold">
                              {story.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(story.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-1 leading-tight">{story.businessName}</h3>
                          <p className="text-xs text-muted-foreground font-medium mb-3">{story.title}</p>
                          <div className="flex items-center gap-2 text-forest font-bold text-xs pt-3 border-t border-border/50">
                            <Target className="h-3 w-3" />
                            {story.impact}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Media Hub Tab */}
              <TabsContent value="media" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-2xl" />)
                  ) : (
                    media
                      .filter(m => fuzzyMatch(m.title, searchQuery) || fuzzyMatch(m.description, searchQuery))
                      .map((m) => (
                        <Card key={m.id} className="border-none shadow-sm group overflow-hidden bg-card">
                          <div className="aspect-square relative">
                            <img 
                              src={m.url} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                              alt={m.title}
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm"
                                onClick={() => { setEditingMedia(m); setMediaEditOpen(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => { setDeleteType('media'); setDeleteId(m.id); setDeleteDialogOpen(true); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md border-none text-[8px] uppercase font-bold">
                              {m.type}
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="text-[8px] border-forest/20 text-forest font-bold uppercase">
                                {m.category}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-xs truncate">{m.title}</h4>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
  </main>

  {/* Dialogs */}
  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this {deleteType}? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
        <Button variant="destructive" onClick={handleDelete} disabled={actionLoading === 'delete'}>
          {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Review Competition Entry</DialogTitle>
      </DialogHeader>
      {reviewEntry && (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">User</p><p className="font-bold">{reviewEntry.user.name}</p></div>
            <div><p className="text-muted-foreground">Competition</p><p className="font-bold">{reviewEntry.competition.title}</p></div>
          </div>
          <Separator />
          <div><p className="text-muted-foreground text-sm mb-2">Content</p><div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">{reviewEntry.content}</div></div>
          <div className="space-y-2">
            <Label>Update Status</Label>
            <Select value={reviewStatus} onValueChange={setReviewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="winner">Winner 🏆</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Close</Button>
        <Button onClick={handleReviewEntry} disabled={actionLoading === 'review'} className="bg-forest text-primary-foreground">Save Changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
    <DialogContent>
      <DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
      {roleUser && (
        <div className="space-y-4 py-4">
          <p className="text-sm">Change role for <span className="font-bold">{roleUser.email}</span></p>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleRoleChange} disabled={actionLoading === 'role'} className="bg-forest text-primary-foreground">Update Role</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  {/* Export Dialog */}
  <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Export Participant List</DialogTitle>
        <DialogDescription>
          Generate a PDF or image of the participants for announcements or records.
        </DialogDescription>
      </DialogHeader>
      
      {exportData && (
        <div className="space-y-6">
          <div 
            id="export-container" 
            className="p-8 bg-white rounded-2xl"
            style={{ 
              minHeight: '300px',
              border: '4px solid hsl(145, 45%, 35%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              color: 'hsl(50, 10%, 30%)'
            }}
          >
            <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '2px solid rgba(22, 163, 74, 0.2)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'hsl(145, 45%, 35%)' }}>
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: 'hsl(145, 45%, 35%)' }}>{exportData.title}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ethosss Movement Participation</p>
              </div>
            </div>

            <div className="space-y-2">
              {exportData.names.length > 0 ? (
                exportData.names.sort().map((name, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)', color: 'hsl(145, 45%, 35%)' }}>{i + 1}</span>
                    <span className="text-sm font-bold">{name}</span>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-muted-foreground font-medium italic">No participants yet.</p>
              )}
            </div>

            <div className="mt-10 pt-4 text-center" style={{ borderTop: '2px solid rgba(22, 163, 74, 0.2)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'hsl(145, 45%, 35%)' }}>www.ethosss.africa</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              className="bg-forest text-white font-bold gap-2"
              onClick={async () => {
                if (!exportData) return;
                try {
                  const element = document.getElementById('export-container');
                  if (!element) {
                    toast.error('Export container not found');
                    return;
                  }
                  const canvas = await html2canvas(element, { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                  });
                  const imgData = canvas.toDataURL('image/png');
                  const link = document.createElement('a');
                  link.href = imgData;
                  link.download = `${exportData.title.replace(/\s+/g, '_')}.png`;
                  link.click();
                  toast.success('Image downloaded!');
                } catch (err) {
                  console.error('Export error:', err);
                  toast.error('Failed to generate image');
                }
              }}
            >
              Download Image
            </Button>
            <Button
              variant="outline"
              className="border-forest text-forest font-bold gap-2"
              onClick={async () => {
                if (!exportData) return;
                try {
                  const element = document.getElementById('export-container');
                  if (!element) {
                    toast.error('Export container not found');
                    return;
                  }
                  const canvas = await html2canvas(element, { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                  });
                  const imgData = canvas.toDataURL('image/png');
                  
                  // Handle different jsPDF import styles
                  const doc = new jsPDF('p', 'mm', 'a4');
                  const imgProps = doc.getImageProperties(imgData);
                  const pdfWidth = doc.internal.pageSize.getWidth();
                  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                  
                  doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                  doc.save(`${exportData.title.replace(/\s+/g, '_')}.pdf`);
                  toast.success('PDF downloaded!');
                } catch (err) {
                  console.error('PDF Export error:', err);
                  toast.error('Failed to generate PDF');
                }
              }}
            >
              Download PDF
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
</div>
)
}
