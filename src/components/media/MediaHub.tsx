'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image as ImageIcon, 
  Video, 
  Filter,
  Search, 
  Maximize2, 
  Download,
  Share2,
  Calendar,
  Layers,
  Camera,
  Globe,
  Leaf,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaPreview } from '@/components/ui/media-preview'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface MediaItem {
  id: string
  title: string
  description: string | null
  url: string
  type: string
  category: string | null
  createdAt: string
}

const categories = [
  { id: 'all', label: 'All Media', icon: Layers },
  { id: 'conservation', label: 'Conservation', icon: Leaf },
  { id: 'community', label: 'Community', icon: Globe },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'hotels', label: 'Eco Hotels', icon: ImageIcon },
]

export default function MediaHub() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState('all')

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/media?category=${activeCategory}&type=${activeType}`)
        const data = await res.json()
        setItems(data.media || [])
      } catch (err) {
        toast.error('Failed to load media gallery')
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [activeCategory, activeType])

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section - Minimized */}
      <section className="relative py-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.05),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-forest/10 text-forest border-forest/20 mb-3 px-3 py-1 rounded-full font-bold uppercase tracking-[0.2em] text-[9px]">
                Archive
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter"
            >
              Media <span className="text-forest">Hub</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-base max-w-xl mx-auto mb-8 leading-relaxed"
            >
              Immersive visuals capturing sustainability across Africa.
            </motion.p>

            {/* Premium Search Component - Slightly smaller */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full max-w-2xl"
            >
              <div className="relative group p-1 bg-gradient-to-r from-forest/20 via-gold/20 to-forest/20 rounded-2xl shadow-xl backdrop-blur-sm border border-white/10">
                <div className="flex flex-col md:flex-row items-center gap-2 bg-background/95 rounded-xl p-1">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/40 group-focus-within:text-forest transition-colors" />
                    <Input 
                      placeholder="Search archive..." 
                      className="pl-12 h-10 border-none bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="h-8 w-px bg-border hidden md:block" />
                  
                  <Tabs 
                    value={activeType} 
                    onValueChange={setActiveType}
                    className="w-full md:w-auto"
                  >
                    <TabsList className="bg-muted/30 h-10 p-1 rounded-lg w-full">
                      <TabsTrigger value="all" className="rounded-md px-4 text-xs data-[state=active]:bg-forest data-[state=active]:text-white font-bold transition-all">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="image" className="rounded-md px-4 text-xs data-[state=active]:bg-forest data-[state=active]:text-white font-bold transition-all">
                        Images
                      </TabsTrigger>
                      <TabsTrigger value="video" className="rounded-md px-4 text-xs data-[state=active]:bg-forest data-[state=active]:text-white font-bold transition-all">
                        Videos
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky Filters Section */}
      <section className="sticky top-[64px] z-40 bg-background/60 backdrop-blur-xl border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide no-scrollbar py-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-4 flex items-center gap-2">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <Button
                  key={cat.id}
                  variant="ghost"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full px-5 py-2 h-10 flex items-center gap-2 whitespace-nowrap transition-all border font-bold text-xs ${
                    isActive 
                    ? 'bg-forest text-white border-forest shadow-lg shadow-forest/20' 
                    : 'text-muted-foreground hover:bg-forest/5 hover:text-forest border-transparent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Masonry-style Media Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
                <div className="flex gap-2">
                   <Skeleton className="h-4 w-16" />
                   <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-forest/5 rounded-[3rem] border-2 border-dashed border-forest/20"
          >
            <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="h-10 w-10 text-forest/40" />
            </div>
            <h3 className="text-3xl font-black text-foreground mb-3">Archive is quiet</h3>
            <p className="text-muted-foreground text-lg max-w-sm mx-auto">Try broadening your search criteria or explore a different category.</p>
            <Button 
              variant="outline" 
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-8 rounded-full border-forest text-forest hover:bg-forest hover:text-white px-8"
            >
              Reset Filters
            </Button>
          </motion.div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className="break-inside-avoid"
                >
                  <Card className="group overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-700 rounded-[2rem] bg-card h-full flex flex-col hover:-translate-y-2">
                    <div className="relative overflow-hidden cursor-pointer aspect-square">
                      <MediaPreview 
                        src={item.url} 
                        alt={item.title}
                        type={item.type}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      >
                        <div className="absolute inset-0 bg-forest/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="rounded-full bg-white/90 shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-75 hover:bg-forest hover:text-white"
                          >
                            <Maximize2 className="h-5 w-5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (navigator.share) {
                                navigator.share({
                                  title: item.title,
                                  text: item.description || '',
                                  url: item.url,
                                }).catch(() => {});
                              } else {
                                navigator.clipboard.writeText(item.url);
                                toast.success('Link copied to clipboard');
                              }
                            }}
                            className="rounded-full bg-white/90 shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-150 hover:bg-forest hover:text-white"
                          >
                            <Share2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </MediaPreview>
                      
                      <div className="absolute top-5 left-5 flex gap-2">
                        <Badge className="bg-black/60 backdrop-blur-md border-none text-[8px] font-black uppercase tracking-widest px-3">
                          {item.type.includes('video') ? <Video className="h-3 w-3 mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                          {item.type.replace('-upload', '')}
                        </Badge>
                        <Badge className="bg-forest/80 backdrop-blur-md border-none text-[8px] font-black uppercase tracking-widest px-3">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-4">
                        <Calendar className="h-3 w-3 text-forest" />
                        {format(new Date(item.createdAt), 'MMMM yyyy')}
                      </div>
                      
                      <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-forest transition-colors tracking-tight">
                        {item.title}
                      </h3>
                      
                      {item.description && (
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed mb-6 text-sm font-medium">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                        <button className="text-[10px] font-black uppercase tracking-widest text-forest flex items-center gap-1 group/btn">
                          View Details
                          <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-muted-foreground hover:text-forest hover:bg-forest/5">
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  )
}
