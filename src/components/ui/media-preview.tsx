'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, PlayCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

interface MediaPreviewProps {
  src: string
  alt: string
  type?: string
  className?: string
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MediaPreview({ 
  src, 
  alt, 
  type = 'image', 
  className, 
  children,
  isOpen: controlledOpen,
  onOpenChange
}: MediaPreviewProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  if (!src) return null

  const isVideo = type === 'video' || type === 'video-upload' || 
                  src.toLowerCase().endsWith('.mp4') || 
                  src.toLowerCase().endsWith('.webm') ||
                  src.includes('video')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={`relative group cursor-zoom-in overflow-hidden ${className}`}>
          {isVideo ? (
            <div className="relative w-full h-full">
               <video 
                src={src} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                muted
                onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                onMouseOut={(e) => {
                  const v = (e.currentTarget as HTMLVideoElement)
                  v.pause()
                  v.currentTime = 0
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <PlayCircle className="h-12 w-12 text-white/80 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          ) : (
            <img 
              src={src} 
              alt={alt} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          )}
          {/* Custom Overlay (Buttons etc.) */}
          {children ? children : (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                <Maximize2 className="h-6 w-6" />
              </div>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-full flex items-center justify-center group">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-sm"
          >
            {isVideo ? (
              <video 
                src={src} 
                className="max-w-full max-h-[90vh] object-contain" 
                controls
                autoPlay
              />
            ) : (
              <img 
                src={src} 
                alt={alt} 
                className="max-w-full max-h-[90vh] object-contain" 
              />
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <DialogClose asChild>
                <button className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </DialogClose>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-lg font-bold">{alt}</p>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
