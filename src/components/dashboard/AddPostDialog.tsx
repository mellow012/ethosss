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

interface AddPostDialogProps {
  onSuccess: () => void
  editingPost?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddPostDialog({ onSuccess, editingPost, open: externalOpen, onOpenChange }: AddPostDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

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
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title || '',
        slug: editingPost.slug || '',
        excerpt: editingPost.excerpt || '',
        content: editingPost.content || '',
        coverImage: editingPost.coverImage || '',
        published: editingPost.published || false,
        featured: editingPost.featured || false,
        categoryId: editingPost.categoryId || '',
        readingTime: editingPost.readingTime?.toString() || '',
      })
    }
  }, [editingPost])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      console.error('Failed to fetch categories')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/posts', {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPost?.id,
          ...formData,
          readingTime: formData.readingTime ? parseInt(formData.readingTime) : null,
        }),
      })

      if (res.ok) {
        toast.success(editingPost ? 'Post updated successfully' : 'Post created successfully')
        setOpen(false)
        onSuccess()
        if (!editingPost) {
          setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            coverImage: '',
            published: false,
            featured: false,
            categoryId: '',
            readingTime: '',
          })
        }
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
        {!editingPost && <Button size="sm" variant="outline" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          <DialogDescription>
            {editingPost ? 'Update the details of your blog post.' : 'Write and publish a new blog post to your site.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="post-title">Post Title *</Label>
            <Input
              id="post-title"
              placeholder="e.g. 5 Ways to Save the Planet"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-slug">Slug *</Label>
            <Input
              id="post-slug"
              placeholder="5-ways-to-save-the-planet"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="post-content">Content *</Label>
            <Textarea
              id="post-content"
              placeholder="Write your post content here..."
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
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-dark text-primary-foreground">
              {loading ? (editingPost ? 'Updating...' : 'Creating...') : (editingPost ? 'Update Post' : 'Create Post')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
