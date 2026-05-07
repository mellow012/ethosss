'use client'

import { useState,useEffect } from 'react'
import { Plus, Trophy, Calendar, FileText, Camera, HelpCircle, Image as ImageIcon, Layers, X } from 'lucide-react'
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

interface AddCompetitionDialogProps {
  onSuccess: () => void
  editingCompetition?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddCompetitionDialog({ onSuccess, editingCompetition, open: externalOpen, onOpenChange }: AddCompetitionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    rules: '',
    coverImage: '',
    prize: '',
    entryType: 'story',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxEntries: '',
    conditionType: 'manual',
    conditionValue: '',
    totalRounds: 1,
    recap: '',
    winnerName: '',
  })

  const [rounds, setRounds] = useState<{ title: string; objective: string; isFinal: boolean }[]>([
    { title: 'Round 1', objective: '', isFinal: true },
  ])

  useEffect(() => {
    if (editingCompetition) {
      setFormData({
        title: editingCompetition.title || '',
        slug: editingCompetition.slug || '',
        description: editingCompetition.description || '',
        rules: editingCompetition.rules || '',
        coverImage: editingCompetition.coverImage || '',
        prize: editingCompetition.prize || '',
        entryType: editingCompetition.entryType || 'story',
        startDate: editingCompetition.startDate ? new Date(editingCompetition.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: editingCompetition.endDate ? new Date(editingCompetition.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        maxEntries: editingCompetition.maxEntries?.toString() || '',
        conditionType: editingCompetition.conditionType || 'manual',
        conditionValue: editingCompetition.conditionValue || '',
        totalRounds: editingCompetition.totalRounds || 1,
        recap: editingCompetition.recap || '',
        winnerName: editingCompetition.winnerName || '',
      })
    }
  }, [editingCompetition])

  const addRound = () => {
    const updated = rounds.map(r => ({ ...r, isFinal: false }))
    updated.push({ title: `Round ${updated.length + 1}`, objective: '', isFinal: true })
    setRounds(updated)
    setFormData({ ...formData, totalRounds: updated.length })
  }

  const removeRound = (index: number) => {
    if (rounds.length <= 1) return
    const updated = rounds.filter((_, i) => i !== index)
    updated[updated.length - 1].isFinal = true
    setRounds(updated)
    setFormData({ ...formData, totalRounds: updated.length })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/competitions', {
        method: editingCompetition ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCompetition?.id,
          ...formData,
          maxEntries: formData.maxEntries ? parseInt(formData.maxEntries) : null,
          totalRounds: formData.conditionType === 'rounds' ? rounds.length : 1,
        }),
      })

      if (res.ok) {
        toast.success(editingCompetition ? 'Competition updated successfully' : 'Competition added successfully')

        setOpen(false)
        onSuccess()
        setFormData({
          title: '',
          slug: '',
          description: '',
          rules: '',
          coverImage: '',
          prize: '',
          entryType: 'story',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          maxEntries: '',
          conditionType: 'manual',
          conditionValue: '',
          totalRounds: 1,
          recap: '',
          winnerName: '',
        })
        setRounds([{ title: 'Round 1', objective: '', isFinal: true }])
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add competition')
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
        {!editingCompetition && <Button size="sm" variant="outline" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Add Competition
        </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCompetition ? 'Edit Competition' : 'Add New Competition'}</DialogTitle>
          <DialogDescription>
            {editingCompetition ? 'Update the details for this challenge.' : 'Create a new environmental challenge for the community.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comp-title">Competition Title *</Label>
            <Input
              id="comp-title"
              placeholder="e.g. Wildlife Photography 2024"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-slug">Slug *</Label>
            <Input
              id="comp-slug"
              placeholder="wildlife-photography-2024"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comp-type">Entry Type</Label>
              <Select
                value={formData.entryType}
                onValueChange={(v) => setFormData({ ...formData, entryType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">Story/Text</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comp-prize">Prize *</Label>
              <Input
                id="comp-prize"
                placeholder="e.g. £500 Eco-Voucher"
                value={formData.prize}
                onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comp-condition">Winner Condition</Label>
              <Select
                value={formData.conditionType}
                onValueChange={(v) => setFormData({ ...formData, conditionType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Selection</SelectItem>
                  <SelectItem value="rounds">Multi-Round Challenge</SelectItem>
                  <SelectItem value="entry_count">Entry Threshold</SelectItem>
                  <SelectItem value="random">Random Draw (End Date)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.conditionType === 'entry_count' && (
              <div className="space-y-2">
                <Label htmlFor="comp-cond-val">Entry Goal</Label>
                <Input
                  id="comp-cond-val"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.conditionValue}
                  onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                  required
                />
              </div>
            )}
          </div>
          {formData.conditionType === 'rounds' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2"><Layers className="h-4 w-4 text-forest" /> Competition Rounds</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addRound}>
                  <Plus className="h-3 w-3" /> Add Round
                </Button>
              </div>
              <div className="space-y-2">
                {rounds.map((round, i) => (
                  <div key={i} className="relative p-3 border rounded-xl bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {round.isFinal ? '🏆 Final Round' : `Round ${i + 1}`}
                      </span>
                      {rounds.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRound(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder={`Round ${i + 1} title`}
                      value={round.title}
                      onChange={(e) => {
                        const updated = [...rounds]
                        updated[i].title = e.target.value
                        setRounds(updated)
                      }}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="Objective (e.g., Submit a photo of a tree you planted)"
                      value={round.objective}
                      onChange={(e) => {
                        const updated = [...rounds]
                        updated[i].objective = e.target.value
                        setRounds(updated)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">Admin reviews entries each round. Approved contestants advance. Final round winner is picked randomly.</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comp-start">Start Date *</Label>
              <Input
                id="comp-start"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comp-end">End Date *</Label>
              <Input
                id="comp-end"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-desc">Description *</Label>
            <Textarea
              id="comp-desc"
              placeholder="What is this competition about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-rules">Rules (optional)</Label>
            <Textarea
              id="comp-rules"
              placeholder="Terms and conditions..."
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-image">Cover Image</Label>
            <ImageUpload
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              onRemove={() => setFormData({ ...formData, coverImage: '' })}
            />
          </div>

          {editingCompetition && (
            <div className="space-y-4 pt-4 border-t border-dashed">
              <h3 className="text-sm font-bold flex items-center gap-2 text-forest">
                <Trophy className="h-4 w-4" /> Post-Competition Results
              </h3>
              <div className="space-y-2">
                <Label htmlFor="comp-winner">Winner Name</Label>
                <Input
                  id="comp-winner"
                  placeholder="e.g. John Doe"
                  value={formData.winnerName}
                  onChange={(e) => setFormData({ ...formData, winnerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comp-recap">Recap / Outcome</Label>
                <Textarea
                  id="comp-recap"
                  placeholder="Describe how the competition went..."
                  value={formData.recap}
                  onChange={(e) => setFormData({ ...formData, recap: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-dark text-primary-foreground">
              {loading ? (editingCompetition ? 'Updating...' : 'Creating...') : (editingCompetition ? 'Update Competition' : 'Create Competition')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
