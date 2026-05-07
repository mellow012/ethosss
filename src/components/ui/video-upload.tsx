'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface VideoUploadProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
}

export function VideoUpload({ value, onChange, onRemove }: VideoUploadProps) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      toast.error('Please upload a video or image file')
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
        toast.success('Video uploaded successfully')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Something went wrong during upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        {value && !loading ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black">
            {value.includes('.mp4') || value.includes('.webm') || value.includes('.mov') || value.includes('supabase') ? (
              <video 
                src={value} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <p>External Video Link: {value}</p>
              </div>
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
                <Video className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload video from PC</p>
                <p className="text-xs text-muted-foreground/60">MP4, WebM or MOV (Max 50MB)</p>
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
        accept="video/*"
      />
    </div>
  )
}
