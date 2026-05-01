'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  MapPin,
  Star,
  Leaf,
  Phone,
  Mail,
  Globe,
  Check,
  Send,
  Building2,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface Hotel {
  id: string
  name: string
  slug: string
  description: string
  shortDesc: string | null
  coverImage: string | null
  gallery: string
  address: string
  city: string
  region: string
  postcode: string | null
  latitude: number | null
  longitude: number | null
  ecoRating: number
  priceRange: string
  amenities: string
  website: string | null
  phone: string | null
  email: string | null
  featured: boolean
  verified: boolean
  _count: { reviews: number }
  averageRating: number | null
}

interface Review {
  id: string
  rating: number
  content: string | null
  authorName: string
  createdAt: string
}

import { useRouter } from 'next/navigation'

export function HotelDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  // Review form
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewName, setReviewName] = useState('')
  const [reviewContent, setReviewContent] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch(`/api/hotels?limit=100`).then((r) => r.json()),
      fetch(`/api/reviews?hotelId=${id}`).then((r) => r.json()),
    ])
      .then(([hotelData, reviewData]) => {
        const found = (hotelData.hotels || []).find(
          (h: Hotel) => h.id === id
        )
        setHotel(found || null)
        setReviews(reviewData.reviews || [])
      })
      .catch(() => {
        toast.error('Failed to load hotel')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewName.trim() || !reviewContent.trim()) {
      toast.error('Name and review content are required')
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: id,
          rating: reviewRating,
          authorName: reviewName.trim(),
          content: reviewContent.trim(),
        }),
      })

      if (res.ok) {
        toast.success('Review submitted successfully!')
        setReviewName('')
        setReviewContent('')
        setReviewRating(5)
        // Refresh reviews
        fetch(`/api/reviews?hotelId=${id}`)
          .then((r) => r.json())
          .then((data) => setReviews(data.reviews || []))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-80 w-full rounded-xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">
          Hotel not found
        </h2>
        <Button
          variant="outline"
          onClick={() => router.push('/hotels')}
          className="mt-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hotels
        </Button>
      </div>
    )
  }

  const gallery = JSON.parse(hotel.gallery || '[]')
  const amenities = JSON.parse(hotel.amenities || '[]')
  const images = [
    hotel.coverImage,
    ...gallery.filter((url: string) => url !== hotel.coverImage),
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          onClick={() => router.push('/hotels')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hotels
        </Button>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="mb-8">
            <div className="relative rounded-xl overflow-hidden h-64 sm:h-80 lg:h-96">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${images[activeImage]})` }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                      i === activeImage
                        ? 'border-forest'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                {hotel.verified && (
                  <Badge className="bg-green-500 text-white">Verified</Badge>
                )}
                {hotel.featured && (
                  <Badge className="bg-sunlight text-forest-dark">Featured</Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {hotel.address}, {hotel.city}, {hotel.region}
                  {hotel.postcode ? ` ${hotel.postcode}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.ecoRating }).map((_, i) => (
                    <Leaf
                      key={i}
                      className="h-5 w-5 text-forest fill-forest"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    Eco Rating
                  </span>
                </div>
                {hotel.averageRating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(hotel.averageRating!)
                            ? 'text-sunlight fill-sunlight'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({hotel.averageRating}, {hotel._count.reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About This Hotel</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-forest [&_blockquote]:pl-4 [&_blockquote]:italic">
                <ReactMarkdown>{hotel.description}</ReactMarkdown>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {amenities.map((amenity: string) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-forest shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Reviews ({reviews.length})
              </h2>

              {/* Review Form */}
              <Card className="mb-6">
                <CardContent className="p-5">
                  <h3 className="font-medium mb-4">Leave a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Name *</label>
                      <Input
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating *</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setReviewRating(r)}
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                r <= reviewRating
                                  ? 'text-sunlight fill-sunlight'
                                  : 'text-muted'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Your Review *
                      </label>
                      <Textarea
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="Share your experience at this eco hotel..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-forest hover:bg-forest-dark text-primary-foreground"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Review List */}
              {reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No reviews yet. Be the first to review this hotel!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {review.authorName}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? 'text-sunlight fill-sunlight'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.content && (
                          <p className="text-sm text-muted-foreground">
                            {review.content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price Range</span>
                  <Badge variant="secondary">{hotel.priceRange}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Eco Rating</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Leaf
                        key={i}
                        className={`h-4 w-4 ${
                          i < hotel.ecoRating
                            ? 'text-forest fill-forest'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {hotel.website && (
                  <>
                    <Separator />
                    <a
                      href={hotel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-forest hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  </>
                )}
                {hotel.phone && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {hotel.phone}
                    </div>
                  </>
                )}
                {hotel.email && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {hotel.email}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-forest" />
                  Location
                </h3>
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {hotel.city}, {hotel.region}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
