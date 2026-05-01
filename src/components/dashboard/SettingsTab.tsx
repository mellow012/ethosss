'use client'

import { useEffect, useState } from 'react'
import { Save, Image as ImageIcon, Type, AlignLeft, Sparkles, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function SettingsTab() {
  const [settings, setSettings] = useState<any>({
    hero_image: '',
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_eyebrow: '',
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

  const handleUpdate = async (key: string) => {
    setSaving(key)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key] }),
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

  if (loading) {
    return <div className="p-10 text-center">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sunlight" />
            Hero Section Content
          </CardTitle>
          <CardDescription>
            Customize the main banner on the homepage. Changes reflect instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Hero Background Image URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.hero_image}
                    onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdate('hero_image')}
                    disabled={saving === 'hero_image'}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>

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
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdate('hero_eyebrow')}
                    disabled={saving === 'hero_eyebrow'}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
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
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdate('hero_title')}
                    disabled={saving === 'hero_title'}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-2.5 w-2.5" />
                  Use a comma to split the gradient text part.
                </p>
              </div>
            </div>

            <div className="space-y-4">
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
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdate('hero_subtitle')}
                    disabled={saving === 'hero_subtitle'}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>

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
                    rows={4}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdate('hero_description')}
                    disabled={saving === 'hero_description'}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Preview</h4>
            <div
              className="h-32 rounded-md bg-cover bg-center flex items-center justify-center relative overflow-hidden"
              style={{ backgroundImage: `url(${settings.hero_image})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 text-center px-4">
                <p className="text-[10px] text-sunlight font-bold uppercase tracking-widest">{settings.hero_eyebrow}</p>
                <h5 className="text-sm font-bold text-white leading-tight">{settings.hero_title}</h5>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
