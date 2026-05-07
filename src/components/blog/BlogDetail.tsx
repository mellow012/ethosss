'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  MessageCircle,
  Send,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { ImagePreview } from '@/components/ui/image-preview'
import { ShareButtons } from './ShareButtons'
import { MediaGallery } from './MediaGallery'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  gallery: string | null
  videoUrl: string | null
  readingTime: number | null
  published: boolean
  featured: boolean
  createdAt: string
  author: { id: string; name: string; email: string; image: string | null }
  category: { id: string; name: string; slug: string } | null
  tags: { tag: { id: string; name: string; slug: string } }[]
  _count: { comments: number }
}

interface Comment {
  id: string
  content: string
  approved: boolean
  createdAt: string
  author: { id: string; name: string; email: string; image: string | null }
}

import { useRouter } from 'next/navigation'

export function BlogDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    
    const fetchPostData = async () => {
      try {
        const [postsRes, commentsRes] = await Promise.all([
          fetch(`/api/posts?limit=100`),
          fetch(`/api/comments?postId=${id}`),
        ])
        const postsData = await postsRes.json()
        const commentsData = await commentsRes.json()
        
        const found = (postsData.posts || []).find((p: Post) => p.id === id)
        if (found) {
          setPost(found)
          setComments(commentsData.comments || [])
          
          if (found.category) {
            const relatedRes = await fetch(`/api/posts?categoryId=${found.category.id}&limit=4`)
            const relatedData = await relatedRes.json()
            setRelatedPosts((relatedData.posts || []).filter((p: Post) => p.id !== id).slice(0, 3))
          }
        }
      } catch (err) {
        toast.error('Failed to load post data')
      } finally {
        setLoading(false)
      }
    }

    fetchPostData()
  }, [id])

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !commentText.trim()) return

    setSubmittingComment(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          postId: id,
        }),
      })
      if (res.ok) {
        toast.success(
          'Comment submitted! It will appear after being approved.'
        )
        setCommentText('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit comment')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Post not found
        </h2>
        <p className="text-muted-foreground mt-2">
          The post you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/blog')}
          className="mt-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </div>
    )
  }

  const galleryImages = post.gallery ? JSON.parse(post.gallery) : []
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?view=blog-detail&id=${post.id}` : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/blog')}
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
          
          <ShareButtons url={shareUrl} title={post.title} />
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl mb-8 relative group"
          >
            <ImagePreview 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </motion.div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <Badge className="bg-forest text-primary-foreground">
                {post.category.name}
              </Badge>
            )}
            {post.featured && (
              <Badge className="bg-sunlight text-forest-dark border-none">
                Featured Article
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground pb-6 border-b">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-forest/20">
                <AvatarImage src={post.author.image || ''} />
                <AvatarFallback className="bg-forest text-primary-foreground text-xs font-bold">
                  {post.author.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {post.author.name}
                </p>
                <p className="text-xs">Author</p>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            
            <div className="flex flex-col">
              <span className="flex items-center gap-1 text-foreground font-medium">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(post.createdAt), 'dd MMMM yyyy')}
              </span>
              <span className="text-xs">Published On</span>
            </div>

            <div className="flex flex-col">
              <span className="flex items-center gap-1 text-foreground font-medium">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime || calculateReadingTime(post.content)} min read
              </span>
              <span className="text-xs">Reading Time</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((t) => (
                <Badge key={t.tag.id} variant="secondary" className="px-3 py-1 rounded-full text-xs font-medium bg-sage/30 text-forest-dark border-none hover:bg-sage/50 transition-colors cursor-pointer">
                  <Tag className="h-3 w-3 mr-1.5" />
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none mb-12 [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h2]:font-bold [&_h3]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:leading-relaxed [&_p]:mb-6 [&_p]:text-lg [&_p]:text-muted-foreground/90 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-forest [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-xl [&_blockquote]:text-foreground/80 [&_blockquote]:my-10 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_a]:text-forest [&_a]:font-medium [&_a]:underline [&_img]:rounded-2xl [&_img]:shadow-lg">
          {post.content.trim().startsWith('<') ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <ReactMarkdown>{post.content}</ReactMarkdown>
          )}
        </div>

        {/* Video Support */}
        {post.videoUrl && (
          <div className="my-12">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Featured Video</h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
              {getYouTubeId(post.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(post.videoUrl)}`}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : post.videoUrl.includes('vimeo.com') ? (
                <iframe
                  src={`https://player.vimeo.com/video/${post.videoUrl.split('/').pop()}`}
                  className="w-full h-full border-none"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={post.videoUrl} 
                  controls 
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        )}

        {/* Media Gallery */}
        <MediaGallery images={galleryImages} />

        <Separator className="my-12" />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Card 
                  key={rp.id} 
                  className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-none bg-sage/5"
                  onClick={() => router.push(`/blog/${rp.id}`)}
                >
                  <div className="aspect-video overflow-hidden">
                    <div 
                      className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${rp.coverImage || ''})` }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm line-clamp-2 group-hover:text-forest transition-colors">
                      {rp.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(rp.createdAt), 'dd MMM yyyy')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="bg-muted/30 rounded-3xl p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Comments ({comments.length})
            </h2>
            <MessageCircle className="h-6 w-6 text-forest" />
          </div>

          {/* Comment Form */}
          {session ? (
            <Card className="mb-10 border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <form onSubmit={handleSubmitComment}>
                  <div className="p-5 flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-forest text-primary-foreground text-xs font-bold">
                        {(session.user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{session.user?.name}</span>
                        <span className="text-xs text-muted-foreground">Posting as Member</span>
                      </div>
                      <Textarea
                        placeholder="Join the conservation... Share your thoughts."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={4}
                        className="resize-none bg-background border-none focus-visible:ring-1 focus-visible:ring-forest p-0 h-auto min-h-[100px] text-lg"
                      />
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 flex justify-end px-5">
                    <Button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="bg-forest hover:bg-forest-dark text-primary-foreground rounded-full px-6"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submittingComment ? 'Submitting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-10 border-dashed border-2 bg-transparent">
              <CardContent className="p-8 text-center">
                <div className="bg-forest/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-6 w-6 text-forest" />
                </div>
                <h4 className="font-bold text-foreground">Join the conversation</h4>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  Log in to share your thoughts and connect with our environmental community.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="mt-6 rounded-full px-8 border-forest text-forest hover:bg-forest hover:text-white"
                >
                  Log in to Comment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <p className="text-lg font-medium">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 shrink-0 border-2 border-background shadow-sm">
                          <AvatarImage src={comment.author.image || ''} />
                          <AvatarFallback className="bg-sage text-forest-dark font-bold text-xs">
                            {comment.author.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-background rounded-2xl rounded-tl-none p-4 shadow-sm border border-black/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-foreground">
                              {comment.author.name}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {format(new Date(comment.createdAt), 'dd MMM yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </article>
    </motion.div>
  )
}
