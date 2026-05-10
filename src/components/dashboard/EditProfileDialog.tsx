'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  user: {
    name: string
    bio?: string
    image?: string
  }
}

export function EditProfileDialog({ isOpen, onClose, onUpdate, user }: EditProfileDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [image, setImage] = useState(user.image || '')
  const { update: updateSession } = useSession()

  useEffect(() => {
    setName(user.name || '')
    setBio(user.bio || '')
    setImage(user.image || '')
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, image }),
      })

      if (res.ok) {
        toast.success('Profile updated successfully')
        await updateSession({ name, image })
        onUpdate()
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and profile picture.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="image" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Picture</Label>
            <ImageUpload 
              value={image} 
              onChange={setImage} 
              onRemove={() => setImage('')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-xl bg-muted/50 border-none h-12 font-medium"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="rounded-2xl bg-muted/50 border-none min-h-[100px] font-medium"
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-forest hover:bg-forest-dark text-white rounded-xl font-black uppercase tracking-widest px-8"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
