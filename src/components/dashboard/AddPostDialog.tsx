'use client'

import { useState, useEffect } from 'react'
import { Plus, FileText, Image as ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/ui/image-upload'
import { VideoUpload } from '@/components/ui/video-upload'

interface AddContentDialogProps {
  onSuccess: () => void
  editingItem?: any
  type?: 'post' | 'event'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddContentDialog({ onSuccess, editingItem, type = 'post', open: externalOpen, onOpenChange }: AddContentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [contentType, setContentType] = useState<'post' | 'event'>(type)

  useEffect(() => {
    if (!editingItem) setContentType(type)
  }, [type, editingItem, open])

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    published: false,
    featured: false,
    categoryId: '',
    readingTime: '',
    // Event specific fields
    date: '',
    location: '',
    link: '',
    isActive: true,
    videoUrl: '',
    recap: '',
    competitionId: '',
  })

  useEffect(() => {
    fetchCategories()
    fetchCompetitions()
  }, [])

  useEffect(() => {
    if (editingItem) {
      setContentType(editingItem.date ? 'event' : 'post')
      setFormData({
        title: editingItem.title || '',
        slug: editingItem.slug || '',
        excerpt: editingItem.excerpt || '',
        content: editingItem.content || editingItem.description || '', // Description maps to content for events
        coverImage: editingItem.coverImage || editingItem.image || '', // Image maps to coverImage
        published: editingItem.published ?? false,
        featured: editingItem.featured ?? false,
        categoryId: editingItem.categoryId || '',
        readingTime: editingItem.readingTime?.toString() || '',
        date: editingItem.date ? new Date(editingItem.date).toISOString().slice(0, 16) : '',
        location: editingItem.location || '',
        link: editingItem.link || '',
        isActive: editingItem.isActive ?? true,
        videoUrl: editingItem.videoUrl || '',
        recap: editingItem.recap || '',
        competitionId: editingItem.competitionId || '',
      })
    } else {
      resetForm()
    }
  }, [editingItem, open])

  const resetForm = () => {
    setFormData({
      title: '', slug: '', excerpt: '', content: '', coverImage: '',
      published: false, featured: false, categoryId: '', readingTime: '',
      date: '', location: '', link: '', isActive: true, videoUrl: '', recap: '',
      competitionId: '',
    })
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      console.error('Failed to fetch categories')
    }
  }

  const fetchCompetitions = async () => {
    try {
      const res = await fetch('/api/competitions?limit=100')
      const data = await res.json()
      setCompetitions(data.competitions || [])
    } catch {
      console.error('Failed to fetch competitions')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const isEvent = contentType === 'event'
      const endpoint = isEvent ? '/api/events' : '/api/posts'
      
      const payload = isEvent ? {
        id: editingItem?.id,
        title: formData.title,
        description: formData.content,
        date: formData.date,
        location: formData.location,
        image: formData.coverImage,
        link: formData.link,
        isActive: formData.isActive,
        recap: formData.recap,
        competitionId: formData.competitionId || null,
      } : {
        id: editingItem?.id,
        ...formData,
        readingTime: formData.readingTime ? parseInt(formData.readingTime) : null,
      }

      const res = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editingItem ? 'Updated successfully' : 'Created successfully')
        setOpen(false)
        onSuccess()
        if (!editingItem) resetForm()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!editingItem && <Button size="sm" variant="outline" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Content' : 'Create New Content'}</DialogTitle>
          <DialogDescription>
            {editingItem ? 'Update the details.' : 'Write and publish a new blog post or event.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          {!editingItem && (
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(v: any) => setContentType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Blog Post</SelectItem>
                  <SelectItem value="event">Upcoming Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">{contentType === 'post' ? 'Post Title *' : 'Event Title *'}</Label>
            <Input
              id="title"
              placeholder={contentType === 'post' ? "e.g. 5 Ways to Save the Planet" : "e.g. Community Tree Planting"}
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          {contentType === 'post' && (
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="5-ways-to-save-the-planet"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
          )}

          {contentType === 'post' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="post-category">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-reading">Reading Time (min)</Label>
                  <Input
                    id="post-reading"
                    type="number"
                    placeholder="e.g. 5"
                    value={formData.readingTime}
                    onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Featured Video</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] h-6 px-2 border"
                    onClick={() => {
                      // Clear the field when switching or toggling
                      setFormData({ ...formData, videoUrl: '' })
                    }}
                  >
                    {formData.videoUrl?.startsWith('http') && !formData.videoUrl?.includes('supabase') ? 'Switch to Upload' : 'Switch to URL'}
                  </Button>
                </div>
                
                {formData.videoUrl?.startsWith('http') && !formData.videoUrl?.includes('supabase') ? (
                  <div className="space-y-2">
                    <Input
                      id="post-video"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground italic">Paste a YouTube or Vimeo link</p>
                  </div>
                ) : (
                  <VideoUpload
                    value={formData.videoUrl}
                    onChange={(url) => setFormData({ ...formData, videoUrl: url })}
                    onRemove={() => setFormData({ ...formData, videoUrl: '' })}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-excerpt">Excerpt</Label>
                <Textarea
                  id="post-excerpt"
                  placeholder="Brief summary of the post..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          )}

          {contentType === 'event' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date & Time *</Label>
                  <Input
                    id="event-date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-location">Location *</Label>
                  <Input
                    id="event-location"
                    placeholder="e.g. Mulanje Mountain"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-link">Registration/More Info Link</Label>
                <Input
                  id="event-link"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-competition">Link to Competition (Optional)</Label>
                <Select value={formData.competitionId} onValueChange={(v) => setFormData({ ...formData, competitionId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a competition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {competitions.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">Linking allow users to join the challenge directly from the event page.</p>
              </div>

              {editingItem && (
                <div className="space-y-2 pt-4 border-t border-dashed">
                  <Label htmlFor="event-recap">Event Recap / Outcome</Label>
                  <Textarea
                    id="event-recap"
                    placeholder="How did the event go? (Shows once event is over)"
                    value={formData.recap}
                    onChange={(e) => setFormData({ ...formData, recap: e.target.value })}
                    rows={3}
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="post-content">{contentType === 'post' ? 'Content *' : 'Description *'}</Label>
            <Textarea
              id="post-content"
              placeholder={contentType === 'post' ? "Write your post content here..." : "Describe the event details..."}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-image">Cover Image</Label>
            <ImageUpload
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              onRemove={() => setFormData({ ...formData, coverImage: '' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {contentType === 'post' ? (
              <>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Publish</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </>
            ) : (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Active (Visible)</span>
              </label>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-dark text-primary-foreground">
              {loading ? (editingItem ? 'Updating...' : 'Creating...') : (editingItem ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
