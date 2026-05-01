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
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { AddSiteDialog } from './AddSiteDialog'
import { AddHotelDialog } from './AddHotelDialog'
import { AddCompetitionDialog } from './AddCompetitionDialog'
import { SettingsTab } from './SettingsTab'



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
  user: { name: string }
  competition: { title: string }
}

interface UserItem {
  id: string
  name: string | null
  email: string
  role: string
  isVerified: boolean
  createdAt: string
  _count: { posts: number; comments: number; entries: number }
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


export function AdminDashboard() {
  const { data: session } = useSession()
  const { setView, setSelectedId } = useAppStore()
  const [activeTab, setActiveTab] = useState('posts')

  // Data
  const [posts, setPosts] = useState<Post[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [sites, setSites] = useState<PlantingSite[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [actionLoading, setActionLoading] = useState<string | null>(null)


  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState('')
  const [deleteId, setDeleteId] = useState('')

  // Entry review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewEntry, setReviewEntry] = useState<Entry | null>(null)
  const [reviewStatus, setReviewStatus] = useState('')

  // User role dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [roleUser, setRoleUser] = useState<UserItem | null>(null)
  const [newRole, setNewRole] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [postsData, hotelsData, compsData, usersData, sitesData, entriesData, analyticsData] = await Promise.all([
        fetch('/api/posts?all=true&limit=100').then((r) => r.json()),
        fetch('/api/hotels?limit=100').then((r) => r.json()),
        fetch('/api/competitions?limit=100').then((r) => r.json()),
        fetch('/api/users?limit=100').then((r) => r.json()),
        fetch('/api/planting-sites').then((r) => r.json()),
        fetch('/api/entries').then((r) => r.json()),
        fetch('/api/admin/analytics').then((r) => r.json())
      ])
      setPosts(postsData.posts || [])
      setHotels(hotelsData.hotels || [])
      setCompetitions(compsData.competitions || [])
      setUsers(usersData.users || [])
      setSites(sitesData.sites || [])
      setEntries(entriesData.entries || [])
      setAnalytics(analyticsData)


      // Fetch entries from each competition
      const allEntries: Entry[] = []
      for (const comp of compsData.competitions || []) {
        try {
          const entryData = await fetch(
            `/api/entries?competitionId=${comp.id}`
          ).then((r) => r.json())
          for (const entry of entryData.entries || []) {
            allEntries.push({
              ...entry,
              competition: { title: comp.title },
            })
          }
        } catch {
          // skip
        }
      }
      setEntries(allEntries)
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
        hotel: '/api/hotels',
        competition: '/api/competitions',
        site: '/api/planting-sites',
      }

      const endpoint = endpoints[deleteType]
      if (!endpoint) return

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      })

      if (res.ok || res.status === 405) {
        toast.success('Item deleted (if supported)')
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
            onClick={() => setView('home')}
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

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-primary-foreground shadow-lg shadow-forest/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-foreground leading-tight">Admin</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Ethoss Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'posts', label: 'Blog Posts', icon: FileText },
            { id: 'hotels', label: 'Eco-Hotels', icon: Building2 },
            { id: 'competitions', label: 'Competitions', icon: Trophy },
            { id: 'entries', label: 'Entries', icon: Edit },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'sites', label: 'Planting Sites', icon: TreePine },
            { id: 'settings', label: 'Global Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
            onClick={() => setView('home')}
            className="w-full mt-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
            
            {activeTab === 'posts' && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedId(null)
                  setView('post-editor')
                }}
                className="bg-forest hover:bg-forest-dark text-primary-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            )}
            {activeTab === 'sites' && <AddSiteDialog onSuccess={fetchData} />}
            {activeTab === 'hotels' && <AddHotelDialog onSuccess={fetchData} />}
            {activeTab === 'competitions' && <AddCompetitionDialog onSuccess={fetchData} />}
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Blog Posts', value: posts.length, icon: FileText, color: 'text-forest', bg: 'bg-forest/10' },
                { label: 'Active Hotels', value: hotels.length, icon: Building2, color: 'text-moss', bg: 'bg-moss/10' },
                { label: 'Total Entries', value: entries.length, icon: Edit, color: 'text-sunlight', bg: 'bg-sunlight/10' },
                { label: 'Community Users', value: users.length, icon: Users, color: 'text-bark', bg: 'bg-bark/10' },
              ].map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm bg-card">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <h3 className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Growth Chart */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {loading || !analytics ? (
                      <Skeleton className="h-full w-full rounded-lg" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.growth}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="hsl(var(--forest))" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: 'hsl(var(--forest))', strokeWidth: 2, stroke: 'white' }} 
                            activeDot={{ r: 6 }} 
                            name="New Users"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="posts" 
                            stroke="hsl(var(--moss))" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: 'hsl(var(--moss))', strokeWidth: 2, stroke: 'white' }} 
                            activeDot={{ r: 6 }} 
                            name="Blog Posts"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Competition Chart */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Competition Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {loading || !analytics ? (
                      <Skeleton className="h-full w-full rounded-lg" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.competitions} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                            width={100}
                          />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px'
                            }} 
                          />
                          <Bar 
                            dataKey="value" 
                            fill="hsl(var(--forest))" 
                            radius={[0, 4, 4, 0]} 
                            barSize={30}
                            name="Total Entries"
                          >
                            {analytics.competitions.map((entry: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index % 2 === 0 ? 'hsl(var(--forest))' : 'hsl(var(--moss))'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} className="w-full">



          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Category
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {post.title}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {post.category?.name || '—'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex gap-1">
                              {post.published ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-500/10 text-green-600"
                                >
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                              {post.featured && (
                                <Badge variant="secondary">Featured</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {format(new Date(post.createdAt), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() =>
                                  navigateTo('blog-detail', post.id)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-forest"
                                onClick={() => {
                                  setSelectedId(post.id)
                                  setView('post-editor')
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  setDeleteType('post')
                                  setDeleteId(post.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {posts.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No posts found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels">
            <div className="flex justify-end mb-4">
              <AddHotelDialog onSuccess={fetchData} />
            </div>
            <Card>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Eco Rating
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hotels.map((hotel) => (
                        <TableRow key={hotel.id}>
                          <TableCell className="font-medium">
                            {hotel.name}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {hotel.city}, {hotel.region}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < hotel.ecoRating
                                    ? 'text-forest'
                                    : 'text-muted/30'
                                }
                              >
                                ★
                              </span>
                            ))}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex gap-1">
                              {hotel.verified && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-500/10 text-green-600"
                                >
                                  Verified
                                </Badge>
                              )}
                              {hotel.featured && (
                                <Badge variant="secondary">Featured</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() =>
                                  navigateTo('hotel-detail', hotel.id)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  setDeleteType('hotel')
                                  setDeleteId(hotel.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {hotels.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No hotels found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitions Tab */}
          <TabsContent value="competitions">
            <div className="flex justify-end mb-4">
              <AddCompetitionDialog onSuccess={fetchData} />
            </div>
            <Card>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Prize
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Entries
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitions.map((comp) => (
                        <TableRow key={comp.id}>
                          <TableCell className="font-medium">
                            {comp.title}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sunlight">
                            {comp.prize}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {comp._count.entries}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge
                              variant="secondary"
                              className={
                                comp.isActive
                                  ? 'bg-green-500/10 text-green-600'
                                  : ''
                              }
                            >
                              {comp.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() =>
                                  navigateTo('competition-detail', comp.id)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  setDeleteType('competition')
                                  setDeleteId(comp.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {competitions.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No competitions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entries Tab */}
          <TabsContent value="entries">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Competition
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Content
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.user.name}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {entry.competition.title}
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm">
                            {entry.content}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={statusColors[entry.status]}
                            >
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {entry.status !== 'approved' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-600"
                                  onClick={() => {
                                    setReviewEntry(entry)
                                    setReviewStatus('approved')
                                    setReviewDialogOpen(true)
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              {entry.status !== 'rejected' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => {
                                    setReviewEntry(entry)
                                    setReviewStatus('rejected')
                                    setReviewDialogOpen(true)
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {entry.status !== 'winner' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-sunlight"
                                  onClick={() => {
                                    setReviewEntry(entry)
                                    setReviewStatus('winner')
                                    setReviewDialogOpen(true)
                                  }}
                                >
                                  <Award className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {entries.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No entries found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Role
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Activity
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant="secondary"
                              className={
                                user.role === 'admin'
                                  ? 'bg-forest/10 text-forest'
                                  : ''
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {user._count.posts}P / {user._count.comments}C /{' '}
                            {user._count.entries}E
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8"
                              onClick={() => {
                                setRoleUser(user)
                                setNewRole(user.role)
                                setRoleDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-1.5 h-3 w-3" />
                              Role
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sites">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Region
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Coordinates
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Trees
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sites.map((site) => (
                        <TableRow key={site.id}>
                          <TableCell className="font-medium">
                            {site.name}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {site.region}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs font-mono">
                            {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {site.treesPlanted.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                site.status === 'active'
                                  ? 'bg-green-500/10 text-green-600'
                                  : site.status === 'completed'
                                  ? 'bg-blue-500/10 text-blue-600'
                                  : ''
                              }
                            >
                              {site.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  setDeleteType('site')
                                  setDeleteId(site.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {sites.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No planting sites found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
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
</div>
)
}
