'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X, Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { RichTextEditor } from '@/components/ui/editor'
import { ImageUpload } from '@/components/ui/image-upload'

export function PostEditor() {
  const { data: session } = useSession()
  const { setView, selectedId } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [gallery, setGallery] = useState('') // Comma separated URLs
  const [videoUrl, setVideoUrl] = useState('')
  const [readingTime, setReadingTime] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/tags').then((r) => r.json()),
    ])
      .then(([catData, tagData]) => {
        setCategories(catData.categories || [])
        setAllTags(tagData.tags || [])
      })
      .catch(() => {})

    if (selectedId) {
      setInitialLoading(true)
      fetch(`/api/posts/${selectedId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.post) {
            const p = data.post
            setTitle(p.title || '')
            setContent(p.content || '')
            setExcerpt(p.excerpt || '')
            setCoverImage(p.coverImage || '')
            setVideoUrl(p.videoUrl || '')
            setReadingTime(p.readingTime?.toString() || '')
            setCategoryId(p.categoryId || '')
            setPublished(p.published || false)
            setFeatured(p.featured || false)
            setSelectedTagIds(p.tags?.map((t: any) => t.id) || [])
            
            if (p.gallery) {
              try {
                const g = JSON.parse(p.gallery)
                if (Array.isArray(g)) setGallery(g.join(', '))
              } catch {
                setGallery('')
              }
            }
          }
        })
        .catch(() => toast.error('Failed to load post'))
        .finally(() => setInitialLoading(false))
    }
  }, [selectedId])

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setLoading(true)
    try {
      // Process gallery URLs
      const galleryArray = gallery.split(',').map(s => s.trim()).filter(s => s !== '')
      
      const url = selectedId ? `/api/posts/${selectedId}` : '/api/posts'
      const method = selectedId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: generateSlug(title),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          coverImage: coverImage.trim() || null,
          gallery: galleryArray.length > 0 ? JSON.stringify(galleryArray) : null,
          videoUrl: videoUrl.trim() || null,
          readingTime: readingTime ? parseInt(readingTime) : null,
          categoryId: categoryId || null,
          tagIds: selectedTagIds,
          published,
          featured,
        }),
      })

      if (res.ok) {
        toast.success(selectedId ? 'Post updated successfully!' : 'Post created successfully!')
        setView('admin')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save post')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          onClick={() => setView('admin')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {selectedId ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedId ? 'Update your story and publish changes.' : 'Draft and publish your environmental stories.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading || initialLoading}
              className="bg-forest hover:bg-forest-dark text-primary-foreground min-w-[120px]"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : selectedId ? 'Update Post' : 'Save & Publish'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-bold">Post Title</Label>
              <Input
                id="title"
                placeholder="The Future of Eco-Tourism in the UK"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl h-14 font-bold border-none bg-muted/30 focus-visible:ring-forest shadow-sm"
                required
              />
            </div>

            {/* Editor */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg font-bold">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Start typing your story..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-none bg-muted/20">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-bold text-lg border-b pb-2">Post Settings</h3>
                
                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="published">Published</Label>
                    <Switch checked={published} onCheckedChange={setPublished} id="published" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Post</Label>
                    <Switch checked={featured} onCheckedChange={setFeatured} id="featured" />
                  </div>
                </div>

                <Separator />

                {/* Meta Data */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readingTime">Reading Time (min)</Label>
                    <Input
                      id="readingTime"
                      type="number"
                      placeholder="5"
                      value={readingTime}
                      onChange={(e) => setReadingTime(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>

                <Separator />

                {/* Media */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <ImageUpload
                      value={coverImage}
                      onChange={setCoverImage}
                      onRemove={() => setCoverImage('')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gallery">Gallery (URLs, separated by comma)</Label>
                    <Textarea
                      id="gallery"
                      placeholder="url1, url2, url3"
                      value={gallery}
                      onChange={(e) => setGallery(e.target.value)}
                      className="bg-background resize-none text-xs"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL (YouTube)</Label>
                    <Input
                      id="videoUrl"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>

                <Separator />

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Short Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Write a brief summary..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="bg-background resize-none"
                    rows={4}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${
                          selectedTagIds.includes(tag.id) ? 'bg-forest text-primary-foreground' : 'hover:border-forest'
                        }`}
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
