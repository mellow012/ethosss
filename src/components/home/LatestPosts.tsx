'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  ArrowRight,
  FileText,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import { format } from 'date-fns'

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

export function LatestPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { navigateTo } = useAppStore()

  useEffect(() => {
    fetch('/api/posts?limit=3')
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-20">
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
              Latest{' '}
              <span className="text-gradient-forest">Stories</span>
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Stay informed with our latest articles on environmental
              conservation, sustainable living, and community initiatives.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigateTo('blog')}
            className="shrink-0 group"
          >
            View All Posts
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
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
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No featured posts available yet
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              We&apos;re working on inspiring new content
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden">
                    {post.coverImage ? (
                      <div
                        className="h-48 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url(${post.coverImage})` }}
                      />
                    ) : (
                      <div className="h-48 w-full gradient-forest flex items-center justify-center">
                        <FileText className="h-12 w-12 text-white/30" />
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-forest text-primary-foreground text-xs">
                          {post.category.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.createdAt), 'dd MMM yyyy')}
                      </span>
                      {post._count.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post._count.comments}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-forest transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateTo('blog-detail', post.id)}
                      className="mt-4 text-forest hover:text-forest-dark p-0 h-auto group/btn"
                    >
                      Read More
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
