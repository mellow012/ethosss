'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Target, Users, Quote, Calendar, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ShareButtons } from '@/components/blog/ShareButtons'

interface Story {
  id: string
  name: string
  businessName: string
  category: string
  impact: string
  description: string
  content: string | null
  image: string
  createdAt: string
}

export default function StoryDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/success-stories?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.story) {
          setStory(data.story)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-4xl mx-auto px-4">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-[2rem] mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-32 px-4">
        <h2 className="text-2xl font-bold mb-4">Story not found</h2>
        <Button onClick={() => router.push('/eco-business')} variant="outline">
          Back to Eco-Business
        </Button>
      </div>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-forest transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Success Stories
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/50">
            <img 
              src={story.image || 'https://images.unsplash.com/photo-1518005020251-58296d8f8d60?w=800'} 
              alt={story.businessName} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 right-6">
              <Badge className="bg-gold text-forest-dark border-none font-black px-5 py-2.5 text-sm shadow-xl uppercase tracking-wider">
                {story.category}
              </Badge>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-forest font-bold text-lg">
                <Target className="h-6 w-6" />
                {story.impact}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(story.createdAt).toLocaleDateString()}
                </span>
                <ShareButtons url={shareUrl} title={story.businessName} />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight tracking-tight">
              {story.businessName}
            </h1>
            
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border border-border/50">
              <div className="h-10 w-10 bg-forest/10 rounded-full flex items-center justify-center text-forest">
                <Users className="h-5 w-5" />
              </div>
              <p className="font-medium">Founded by <span className="text-forest font-bold">{story.name || 'Local Visionary'}</span></p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="relative">
                <Quote className="absolute -top-4 -left-8 h-16 w-16 text-forest/5 -z-10" />
                <p className="text-xl text-muted-foreground leading-relaxed italic mb-10 border-l-4 border-gold/30 pl-6 py-2">
                  "{story.description}"
                </p>
              </div>
              
              {story.content ? (
                <div 
                  className="text-foreground/90 leading-relaxed space-y-6 whitespace-pre-wrap text-lg"
                  dangerouslySetInnerHTML={{ __html: story.content }}
                />
              ) : (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground">Our Journey & Impact</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    This business was founded with a clear vision to address environmental challenges in Africa. 
                    Through innovation and dedication, they have managed to create a sustainable model that benefits both the community and the planet.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Since its inception, {story.businessName} has seen significant growth. Their impact extends beyond just environmental protection, 
                    as they also provide employment opportunities and promote eco-friendly practices in the region.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
