'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, TreePine, Info, Calendar, Maximize } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/ui/image-upload'

interface AddSiteDialogProps {
  onSuccess: () => void
  editingSite?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddSiteDialog({ onSuccess, editingSite, open: externalOpen, onOpenChange }: AddSiteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    region: '',
    latitude: '',
    longitude: '',
    treesPlanted: '0',
    species: '',
    dateStarted: new Date().toISOString().split('T')[0],
    status: 'active',
    description: '',
    area: '',
    image: '',
  })

  useEffect(() => {
    if (editingSite) {
      setFormData({
        name: editingSite.name || '',
        region: editingSite.region || '',
        latitude: editingSite.latitude?.toString() || '',
        longitude: editingSite.longitude?.toString() || '',
        treesPlanted: editingSite.treesPlanted?.toString() || '0',
        species: Array.isArray(editingSite.species) ? editingSite.species.join(', ') : '',
        dateStarted: editingSite.dateStarted ? new Date(editingSite.dateStarted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: editingSite.status || 'active',
        description: editingSite.description || '',
        area: editingSite.area || '',
        image: editingSite.image || '',
      })
    }
  }, [editingSite])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const speciesArray = formData.species
        ? formData.species.split(',').map((s) => s.trim())
        : []

      const res = await fetch('/api/planting-sites', {
        method: editingSite ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSite?.id,
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          treesPlanted: parseInt(formData.treesPlanted),
          species: speciesArray,
        }),
      })

      if (res.ok) {
        toast.success(editingSite ? 'Site updated successfully' : 'Planting site added successfully')
        setOpen(false)
        onSuccess()
        setFormData({
          name: '',
          region: '',
          latitude: '',
          longitude: '',
          treesPlanted: '0',
          species: '',
          dateStarted: new Date().toISOString().split('T')[0],
          status: 'active',
          description: '',
          area: '',
          image: '',
        })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add site')
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
        {!editingSite && <Button size="sm" className="bg-forest hover:bg-forest-dark text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSite ? 'Edit Planting Site' : 'Add New Planting Site'}</DialogTitle>
          <DialogDescription>
            {editingSite ? 'Update reforestation site details.' : 'Enter the details for the new reforestation site. Coordinates will be used to place it on the map.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Site Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Sherwood Forest Extension"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                placeholder="e.g. Nottinghamshire"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g. 53.2000"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g. -1.0500"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trees">Trees Planted</Label>
              <Input
                id="trees"
                type="number"
                value={formData.treesPlanted}
                onChange={(e) => setFormData({ ...formData, treesPlanted: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                placeholder="e.g. 12 hectares"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="species">Species (comma separated)</Label>
            <Input
              id="species"
              placeholder="e.g. Oak, Birch, Rowan"
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Start Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.dateStarted}
              onChange={(e) => setFormData({ ...formData, dateStarted: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Site Image</Label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              onRemove={() => setFormData({ ...formData, image: '' })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us about this project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-dark text-primary-foreground">
              {loading ? (editingSite ? 'Updating...' : 'Adding...') : (editingSite ? 'Update Site' : 'Add Planting Site')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
