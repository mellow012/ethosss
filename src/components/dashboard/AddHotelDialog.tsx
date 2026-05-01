'use client'

import { useState, useEffect } from 'react'
import { Plus, Building2, MapPin, Star, Leaf, Image as ImageIcon, Globe, Phone, Mail } from 'lucide-react'
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

interface AddHotelDialogProps {
  onSuccess: () => void
  editingHotel?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddHotelDialog({ onSuccess, editingHotel, open: externalOpen, onOpenChange }: AddHotelDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    coverImage: '',
    address: '',
    city: '',
    region: '',
    postcode: '',
    latitude: '',
    longitude: '',
    ecoRating: '3',
    priceRange: '££',
    amenities: '',
    website: '',
    phone: '',
    email: '',
    featured: false,
    verified: true,
  })

  useEffect(() => {
    if (editingHotel) {
      setFormData({
        name: editingHotel.name || '',
        slug: editingHotel.slug || '',
        description: editingHotel.description || '',
        shortDesc: editingHotel.shortDesc || '',
        coverImage: editingHotel.coverImage || '',
        address: editingHotel.address || '',
        city: editingHotel.city || '',
        region: editingHotel.region || '',
        postcode: editingHotel.postcode || '',
        latitude: editingHotel.latitude?.toString() || '',
        longitude: editingHotel.longitude?.toString() || '',
        ecoRating: editingHotel.ecoRating?.toString() || '3',
        priceRange: editingHotel.priceRange || '££',
        amenities: Array.isArray(editingHotel.amenities) ? editingHotel.amenities.join(', ') : '',
        website: editingHotel.website || '',
        phone: editingHotel.phone || '',
        email: editingHotel.email || '',
        featured: editingHotel.featured || false,
        verified: editingHotel.verified ?? true,
      })
    }
  }, [editingHotel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const amenitiesArray = formData.amenities
        ? formData.amenities.split(',').map((s) => s.trim())
        : []

      const res = await fetch('/api/hotels', {
        method: editingHotel ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingHotel?.id,
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          ecoRating: parseInt(formData.ecoRating),
          amenities: amenitiesArray,
          gallery: [], // Initial empty gallery
        }),
      })

      if (res.ok) {
        toast.success(editingHotel ? 'Hotel updated successfully' : 'Hotel added successfully')
        setOpen(false)
        onSuccess()
        setFormData({
          name: '',
          slug: '',
          description: '',
          shortDesc: '',
          coverImage: '',
          address: '',
          city: '',
          region: '',
          postcode: '',
          latitude: '',
          longitude: '',
          ecoRating: '3',
          priceRange: '££',
          amenities: '',
          website: '',
          phone: '',
          email: '',
          featured: false,
          verified: true,
        })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add hotel')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!editingHotel && <Button size="sm" variant="outline" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Add Hotel
        </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingHotel ? 'Edit Eco-Hotel' : 'Add New Eco-Hotel'}</DialogTitle>
          <DialogDescription>
            {editingHotel ? 'Update the details for this accommodation.' : 'Register a new sustainable accommodation in the directory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="hotel-name">Hotel Name *</Label>
              <Input
                id="hotel-name"
                placeholder="e.g. Green Valley Retreat"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="hotel-slug">Slug *</Label>
              <Input
                id="hotel-slug"
                placeholder="e-g-green-valley-retreat"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-city">City *</Label>
              <Input
                id="hotel-city"
                placeholder="e.g. Bath"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-region">Region *</Label>
              <Input
                id="hotel-region"
                placeholder="e.g. Somerset"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="hotel-address">Full Address *</Label>
              <Input
                id="hotel-address"
                placeholder="123 Eco Lane, Bath, BA1 1XX"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-rating">Eco Rating (1-5)</Label>
              <Select
                value={formData.ecoRating}
                onValueChange={(v) => setFormData({ ...formData, ecoRating: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} Leaves
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-price">Price Range</Label>
              <Select
                value={formData.priceRange}
                onValueChange={(v) => setFormData({ ...formData, priceRange: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="£">£ (Budget)</SelectItem>
                  <SelectItem value="££">££ (Mid-range)</SelectItem>
                  <SelectItem value="£££">£££ (Luxury)</SelectItem>
                  <SelectItem value="££££">££££ (Ultra-luxury)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel-short">Short Description</Label>
            <Input
              id="hotel-short"
              placeholder="Brief summary for list view..."
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel-desc">Full Description *</Label>
            <Textarea
              id="hotel-desc"
              placeholder="Tell us about the hotel and its eco-credentials..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel-image">Cover Image</Label>
            <ImageUpload
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              onRemove={() => setFormData({ ...formData, coverImage: '' })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel-amenities">Amenities (comma separated)</Label>
            <Input
              id="hotel-amenities"
              placeholder="Solar Power, Organic Garden, EV Charging"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotel-web">Website</Label>
              <Input
                id="hotel-web"
                placeholder="https://..."
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-email">Email</Label>
              <Input
                id="hotel-email"
                type="email"
                placeholder="contact@hotel.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-dark text-primary-foreground">
              {loading ? (editingHotel ? 'Updating...' : 'Adding...') : (editingHotel ? 'Update Hotel' : 'Add Hotel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
