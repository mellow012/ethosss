'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Calendar,
  MessageCircle,
  ArrowRight,
  FileText,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { startTransition } from 'react'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  featured: boolean
  createdAt: string
  author: { id: string; name: string; email: string; image: string | null }
  category: { id: string; name: string; slug: string } | null
  tags: { tag: { id: string; name: string; slug: string } }[]
  _count: { comments: number }
}

interface Category {
  id: string
  name: string
  slug: string
}

export function BlogList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    startTransition(() => setLoading(true))
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '9')
    if (search) params.set('search', search)
    if (selectedCategory && selectedCategory !== 'all')
      params.set('categoryId', selectedCategory)

    fetch(`/api/posts?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setPosts(data.posts || [])
          setTotalPages(data.pagination?.totalPages || 1)
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load posts')
          setPosts([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [search, selectedCategory, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
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
              Our <span className="text-gradient-forest">Blog</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Explore stories, guides, and insights on environmental
              conservation, sustainable living, and community action.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </form>
          <Select
            value={selectedCategory}
            onValueChange={(v) => {
              setSelectedCategory(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground">
              No posts found
            </h3>
            <p className="text-muted-foreground mt-2">
              {search || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'We\'re working on inspiring new content'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link href={`/blog/${post.id}`} className="block h-full">
                    <Card className="overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)] transition-all duration-500 h-full flex flex-col cursor-pointer border-none bg-background/50 backdrop-blur-sm">
                      <div
                        className="relative overflow-hidden aspect-video"
                      >
                      {post.coverImage ? (
                        <div
                          className="h-full w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
                          style={{
                            backgroundImage: `url(${post.coverImage})`,
                          }}
                        />
                      ) : (
                        <div className="h-full w-full gradient-forest flex items-center justify-center">
                          <FileText className="h-12 w-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                      
                      {post.category && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-white/90 dark:bg-black/90 text-forest backdrop-blur-md border-none shadow-sm">
                            {post.category.name}
                          </Badge>
                        </div>
                      )}
                      {post.featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-sunlight text-forest-dark border-none shadow-sm">
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent
                      className="p-6 flex flex-col flex-1"
                    >
                      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        <span className="text-forest">{post.author.name}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.createdAt), 'dd MMM yyyy')}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl text-foreground line-clamp-2 group-hover:text-forest transition-colors duration-300 leading-tight">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2 flex-1 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <div className="flex gap-2 flex-wrap">
                          {post.tags.slice(0, 2).map((t) => (
                            <span
                              key={t.tag.id}
                              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                            >
                              #{t.tag.name}
                            </span>
                          ))}
                        </div>
                        {post._count.comments > 0 && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            <MessageCircle className="h-3.5 w-3.5 text-forest" />
                            {post._count.comments}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                </motion.div>
              ))}
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
                <div className="flex gap-1">
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
                </div>
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
