'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Calendar,
  ArrowRight,
  FileText,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
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
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/posts?limit=8')
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    if (posts.length === 0) return
    setDirection(1)
    setCurrent((prev) => (prev + 1) % posts.length)
  }, [posts.length])

  const prev = useCallback(() => {
    if (posts.length === 0) return
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + posts.length) % posts.length)
  }, [posts.length])

  // Auto-advance every 8s
  useEffect(() => {
    if (posts.length <= 1) return
    const timer = setInterval(next, 8000)
    return () => clearInterval(timer)
  }, [next, posts.length])

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
    }),
  }

  if (!loading && posts.length === 0) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No featured posts available yet
            </p>
          </div>
        </div>
      </section>
    )
  }

  const post = posts[current]

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
              Latest <span className="text-gradient-forest">Stories</span>
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Stay informed with our latest articles on environmental
              conservation, sustainable living, and community initiatives.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/blog')}
            className="shrink-0 group"
          >
            View All Posts
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {loading ? (
          <Card className="overflow-hidden">
            <Skeleton className="h-[400px] w-full" />
          </Card>
        ) : (
          <div className="relative h-[450px] sm:h-[400px]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0"
              >
                <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-card">
                  <CardContent className="h-full p-0 flex flex-col md:flex-row">
                    <div className="relative w-full md:w-1/2 h-48 md:h-full overflow-hidden">
                      {post.coverImage ? (
                        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full gradient-forest flex items-center justify-center">
                          <FileText className="h-16 w-16 text-white/30" />
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-forest text-primary-foreground">
                            {post.category.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.createdAt), 'dd MMM yyyy')}
                        </span>
                        {post._count.comments > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post._count.comments} comments
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 group-hover:text-forest transition-colors leading-tight">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm sm:text-base mb-6 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => router.push(`/blog/${post.id}`)}
                        className="p-0 h-auto text-forest hover:text-forest-dark font-semibold group/btn w-fit"
                      >
                        Read Full Story
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {posts.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-sm hover:bg-background transition-all"
                  aria-label="Previous post"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-sm hover:bg-background transition-all"
                  aria-label="Next post"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                  {posts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > current ? 1 : -1)
                        setCurrent(i)
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === current ? 'w-8 bg-forest' : 'w-2 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
