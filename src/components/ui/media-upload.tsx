'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface MediaUploadProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
  type?: 'image' | 'video' | 'all'
}

export function MediaUpload({ value, onChange, onRemove, type = 'all' }: MediaUploadProps) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type based on prop
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please upload a video file')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.url) {
        onChange(data.url)
        toast.success(`${file.type.startsWith('video') ? 'Video' : 'Image'} uploaded successfully`)
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Something went wrong during upload')
    } finally {
      setLoading(false)
    }
  }

  const isVideo = value.toLowerCase().endsWith('.mp4') || 
                  value.toLowerCase().endsWith('.webm') || 
                  value.toLowerCase().endsWith('.mov') ||
                  value.includes('video')

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black">
            {isVideo ? (
              <video 
                src={value} 
                className="w-full h-full object-contain" 
                controls
              />
            ) : (
              <img src={value} alt="Upload" className="w-full h-full object-cover" />
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 z-10"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            {loading ? (
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            ) : (
              <>
                {type === 'video' ? <Video className="h-10 w-10 text-muted-foreground" /> : <Upload className="h-10 w-10 text-muted-foreground" />}
                <p className="text-sm text-muted-foreground font-bold">
                  {type === 'video' ? 'Upload Video from PC' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">
                  {type === 'video' ? 'MP4, WEBM, MOV (Max 50MB)' : 'PNG, JPG, WEBP (Max 5MB)'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept={type === 'all' ? 'image/*,video/*' : type === 'video' ? 'video/*' : 'image/*'}
      />
    </div>
  )
}
