'use client'

import { useState, useEffect } from 'react'
import { Plus, Target, Image as ImageIcon } from 'lucide-react'
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
import { toast } from 'sonner'
import { ImageUpload } from '@/components/ui/image-upload'

interface AddSuccessStoryDialogProps {
  onSuccess: () => void
  editingItem?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddSuccessStoryDialog({ onSuccess, editingItem, open: externalOpen, onOpenChange }: AddSuccessStoryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    businessName: '',
    category: '',
    impact: '',
    description: '',
    image: '',
    content: '',
    featured: false,
  })

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        businessName: editingItem.businessName || '',
        category: editingItem.category || '',
        impact: editingItem.impact || '',
        description: editingItem.description || '',
        image: editingItem.image || '',
        content: editingItem.content || '',
        featured: editingItem.featured ?? false,
      })
    } else {
      resetForm()
    }
  }, [editingItem, open])

  const resetForm = () => {
    setFormData({
      title: '', businessName: '', category: '', impact: '',
      description: '', image: '', content: '', featured: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/success-stories', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem?.id,
          ...formData,
        }),
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!editingItem && <Button size="sm" variant="outline" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Add Story
        </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Success Story' : 'New Success Story'}</DialogTitle>
          <DialogDescription>
            Share how Ethoss helped an eco-business or startup grow.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="e.g. GreenBrick Malawi"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g. Sustainable Construction"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Short Tagline *</Label>
            <Input
              id="title"
              placeholder="e.g. Pioneering Eco-Friendly Bricks"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact">Impact Metric *</Label>
            <Input
              id="impact"
              placeholder="e.g. 500+ Houses Built"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description (for card) *</Label>
            <Textarea
              id="description"
              placeholder="Brief summary of the success story..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Cover Image</Label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              onRemove={() => setFormData({ ...formData, image: '' })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Full Story (Markdown supported)</Label>
            <Textarea
              id="content"
              placeholder="Details about the collaboration, challenges, and results..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
            />
          </div>

          <div className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="featured" className="cursor-pointer">Feature on Homepage</Label>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-dark text-primary-foreground">
              {loading ? (editingItem ? 'Updating...' : 'Creating...') : (editingItem ? 'Save Story' : 'Publish Story')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
