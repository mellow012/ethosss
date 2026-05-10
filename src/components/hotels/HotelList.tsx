'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  Leaf,
  ArrowRight,
  Building2,
  X,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { toast } from 'sonner'
import { startTransition } from 'react'

interface Hotel {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  coverImage: string | null
  city: string
  region: string
  address: string
  ecoRating: number
  priceRange: string
  amenities: string
  featured: boolean
  verified: boolean
  _count: { reviews: number }
  averageRating: number | null
}

const regions = [
  'All Regions',
  'East Africa',
  'West Africa',
  'North Africa',
  'Southern Africa',
  'Central Africa',
  'Nairobi',
  'Mombasa',
  'Maasai Mara',
  'Serengeti',
  'Kruger',
]

export function HotelList() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('All Regions')
  const [ecoRating, setEcoRating] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    startTransition(() => setLoading(true))
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    if (search) params.set('search', search)
    if (region !== 'All Regions') params.set('region', region)
    if (ecoRating !== 'all') params.set('ecoRating', ecoRating)

    fetch(`/api/hotels?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setHotels(data.hotels || [])
          setTotalPages(data.pagination?.totalPages || 1)
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load hotels')
          setHotels([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [search, region, ecoRating, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Header */}
      <div className="gradient-forest py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground">
              Eco-Friendly Hotels
            </h1>
            <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
              Discover verified sustainable accommodations across Africa that
              prioritise environmental responsibility and your comfort.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search and Filters */}
        <div className="bg-card border rounded-xl p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <form onSubmit={handleSearch} className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </form>
            <Select
              value={region}
              onValueChange={(v) => {
                setRegion(v)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={ecoRating}
              onValueChange={(v) => {
                setEcoRating(v)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Eco Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Leaves</SelectItem>
                <SelectItem value="4">4+ Leaves</SelectItem>
                <SelectItem value="3">3+ Leaves</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hotels Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground">
              No hotels found
            </h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing {hotels.length} eco-friendly hotels
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel, index) => {
                const amenities = JSON.parse(hotel.amenities || '[]')
                return (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link href={`/hotels/${hotel.id}`} className="block h-full">
                    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      <div className="relative overflow-hidden">
                        {hotel.coverImage ? (
                          <div
                            className="h-48 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                            style={{
                              backgroundImage: `url(${hotel.coverImage})`,
                            }}
                          />
                        ) : (
                          <div className="h-48 w-full gradient-forest flex items-center justify-center">
                            <Building2 className="h-12 w-12 text-white/30" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Badge className="bg-forest text-primary-foreground text-xs">
                            {hotel.priceRange}
                          </Badge>
                          {hotel.verified && (
                            <Badge className="bg-green-500 text-white text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3 flex gap-0.5">
                          {Array.from({ length: hotel.ecoRating }).map(
                            (_, i) => (
                              <Leaf
                                key={i}
                                className="h-4 w-4 text-green-300 fill-green-300"
                              />
                            )
                          )}
                        </div>
                      </div>
                      <CardContent className="p-5 flex flex-col flex-1">
                        <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {hotel.city}, {hotel.region}
                        </div>
                        {hotel.averageRating && (
                          <div className="flex items-center gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.round(hotel.averageRating!)
                                    ? 'text-sunlight fill-sunlight'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({hotel.averageRating}, {hotel._count.reviews}{' '}
                              reviews)
                            </span>
                          </div>
                        )}
                        {hotel.shortDesc && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
                            {hotel.shortDesc}
                          </p>
                        )}
                        {amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {amenities
                              .slice(0, 3)
                              .map((a: string) => (
                                <Badge
                                  key={a}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {a}
                                </Badge>
                              ))}
                            {amenities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div
                          className="mt-4 w-full group/btn inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                          View Details
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={
                        p === page
                          ? 'bg-forest hover:bg-forest-dark text-primary-foreground'
                          : ''
                      }
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
