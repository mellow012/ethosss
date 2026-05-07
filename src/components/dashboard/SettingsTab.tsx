'use client'

import { useEffect, useState } from 'react'
import { Save, Image as ImageIcon, Type, AlignLeft, Sparkles, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/ui/image-upload'

export function SettingsTab() {
  const [settings, setSettings] = useState<any>({
    hero_images: '[]',
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_eyebrow: '',
    what_we_do_images: '[]',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev: any) => ({ ...prev, ...data.settings }))
        }
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdate = async (key: string, customValue?: string) => {
    setSaving(key)
    try {
      const value = customValue !== undefined ? customValue : settings[key]
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })

      if (res.ok) {
        toast.success('Setting updated successfully')
      } else {
        toast.error('Failed to update setting')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(null)
    }
  }

  const getHeroImages = () => {
    try {
      return JSON.parse(settings.hero_images || '[]')
    } catch {
      return []
    }
  }

  const updateHeroImages = (images: string[]) => {
    const jsonValue = JSON.stringify(images)
    setSettings({ ...settings, hero_images: jsonValue })
    handleUpdate('hero_images', jsonValue)
  }

  const getWhatWeDoImages = () => {
    try {
      return JSON.parse(settings.what_we_do_images || '[]')
    } catch {
      return []
    }
  }

  const updateWhatWeDoImages = (images: string[]) => {
    const jsonValue = JSON.stringify(images)
    setSettings({ ...settings, what_we_do_images: jsonValue })
    handleUpdate('what_we_do_images', jsonValue)
  }

  const handleSaveAll = async () => {
    setSaving('all')
    try {
      await Promise.all(Object.entries(settings).map(([key, value]) => 
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        })
      ))
      toast.success('All settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading settings...</div>
  }

  const heroImages = getHeroImages()
  const whatWeDoImages = getWhatWeDoImages()
  // Ensure we have exactly 5 spots for What We Do
  const paddedWhatWeDo = Array.from({ length: 5 }, (_, i) => whatWeDoImages[i] || '')

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
        <div>
          <h2 className="text-lg font-bold">Global Settings</h2>
          <p className="text-sm text-muted-foreground">Manage the content and configuration across the platform.</p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={saving === 'all'}
          className="bg-forest hover:bg-forest-dark text-white font-semibold flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving === 'all' ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sunlight" />
            Hero Section Content
          </CardTitle>
          <CardDescription>
            Customize the main banner carousel on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Carousel Management */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <ImageIcon className="h-5 w-5 text-forest" />
              Hero Carousel Images
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroImages.map((img: string, index: number) => (
                <div key={index} className="relative group space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Slide {index + 1}</span>
                  </div>
                  <ImageUpload 
                    value={img}
                    onChange={(url) => {
                      const newImages = [...heroImages]
                      newImages[index] = url
                      updateHeroImages(newImages)
                    }}
                    onRemove={() => {
                      const newImages = heroImages.filter((_: any, i: number) => i !== index)
                      updateHeroImages(newImages)
                    }}
                  />
                </div>
              ))}
              <button
                onClick={() => updateHeroImages([...heroImages, ''])}
                className="aspect-video rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-forest/50 hover:bg-forest/5 flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-forest/20 flex items-center justify-center transition-colors">
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-forest" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-forest">Add Slide</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Hero Eyebrow (Gold text)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.hero_eyebrow}
                    onChange={(e) => setSettings({ ...settings, hero_eyebrow: e.target.value })}
                    placeholder="e.g. See the World, Save the Planet"
                    className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-forest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Hero Title
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.hero_title}
                    onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                    placeholder="e.g. Protecting Nature, Inspiring Change"
                    className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-forest"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-2.5 w-2.5" />
                  Use a comma to split the gradient text part.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" />
                  Hero Subtitle (In bubble)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.hero_subtitle}
                    onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                    placeholder="e.g. Building a greener tomorrow, today"
                    className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-forest"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" />
                  Hero Description
                </Label>
                <div className="flex gap-2 items-start">
                  <Textarea
                    value={settings.hero_description}
                    onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                    placeholder="Detailed description..."
                    rows={6}
                    className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-forest resize-none w-full"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl space-y-2 border border-border/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Live Preview (First Image)</h4>
                <div
                  className="h-40 rounded-lg bg-cover bg-center flex items-center justify-center relative overflow-hidden shadow-inner"
                  style={{ backgroundImage: `url(${heroImages[0] || ''})` }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10 text-center px-4">
                    <p className="text-[10px] text-sunlight font-bold uppercase tracking-widest mb-1">{settings.hero_eyebrow}</p>
                    <h5 className="text-sm font-bold text-white leading-tight">{settings.hero_title}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-forest" />
            What We Do Carousel
          </CardTitle>
          <CardDescription>
            Manage the 5 images displayed in the "What We Do" section on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {paddedWhatWeDo.map((img: string, index: number) => {
              const titles = ['Eco Hotels', 'Tree Planting', 'Competitions', 'Research', 'Community']
              return (
                <div key={index} className="space-y-2">
                  <div className="text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{titles[index]}</span>
                  </div>
                  <ImageUpload 
                    value={img}
                    onChange={(url) => {
                      const newImages = [...paddedWhatWeDo]
                      newImages[index] = url
                      updateWhatWeDoImages(newImages)
                    }}
                    onRemove={() => {
                      const newImages = [...paddedWhatWeDo]
                      newImages[index] = ''
                      updateWhatWeDoImages(newImages)
                    }}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
