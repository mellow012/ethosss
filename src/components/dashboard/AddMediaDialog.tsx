'use client'

import { useState } from 'react'
import { Plus, ImageIcon, Video, Link as LinkIcon, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { MediaUpload } from '@/components/ui/media-upload'

interface AddMediaDialogProps {
  onSuccess?: () => void
}

export function AddMediaDialog({ onSuccess }: AddMediaDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'image',
    category: 'general',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.url) {
      toast.error('Title and Media URL are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Media added to hub successfully')
        setOpen(false)
        setFormData({
          title: '',
          url: '',
          type: 'image',
          category: 'general',
          description: '',
        })
        onSuccess?.()
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Failed to add media')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-forest hover:bg-forest-dark text-white gap-2 rounded-full px-6">
          <Plus className="h-4 w-4" />
          Add Media
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="bg-forest p-8 text-white relative shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <ImageIcon className="h-6 w-6" />
                Add New Media
              </DialogTitle>
              <DialogDescription className="text-forest-light/80">
                Upload images or link videos to the organized Media Hub.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold text-foreground">
                Media Title
              </Label>
              <Input
                id="title"
                placeholder="E.g. Community Tree Planting Day"
                className="rounded-xl border-muted bg-muted/30 focus-visible:ring-forest"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-bold text-foreground">
                  Media Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="rounded-xl border-muted bg-muted/30">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="image">Image Upload</SelectItem>
                    <SelectItem value="video">Video URL (YouTube/Vimeo)</SelectItem>
                    <SelectItem value="video-upload">Video Upload (MP4/MOV)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-bold text-foreground">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="rounded-xl border-muted bg-muted/30">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="conservation">Conservation</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="hotels">Eco Hotels</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-bold text-foreground">
                {formData.type === 'image' ? 'Upload Image' : formData.type === 'video-upload' ? 'Upload Video' : 'Video URL'}
              </Label>
              {formData.type === 'image' || formData.type === 'video-upload' ? (
                <MediaUpload
                  type={formData.type === 'image' ? 'image' : 'video'}
                  value={formData.url}
                  onChange={(url) => setFormData({ ...formData, url })}
                  onRemove={() => setFormData({ ...formData, url: '' })}
                />
              ) : (
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="pl-10 rounded-xl border-muted bg-muted/30 focus-visible:ring-forest"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold text-foreground">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Briefly describe this visual story..."
                className="rounded-xl border-muted bg-muted/30 focus-visible:ring-forest min-h-[100px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 flex gap-3 bg-muted/20 border-t shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-full flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-forest hover:bg-forest-dark text-white rounded-full flex-1 gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? 'Adding...' : 'Save Media'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
