'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MapPin, ArrowRight, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'

interface Hotel {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  coverImage: string | null
  city: string
  region: string
  ecoRating: number
  priceRange: string
  featured: boolean
  _count: { reviews: number }
  averageRating: number | null
}

export function FeaturedHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const { navigateTo } = useAppStore()

  useEffect(() => {
    fetch('/api/hotels?featured=true&limit=6')
      .then((res) => res.json())
      .then((data) => setHotels(data.hotels || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Featured{' '}
              <span className="text-gradient-forest">Eco Hotels</span>
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Discover hand-picked sustainable accommodations across the UK that
              prioritise environmental responsibility without compromising
              comfort.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigateTo('hotels')}
            className="shrink-0 group"
          >
            View All Hotels
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No featured hotels available yet
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Check back soon for our curated eco-friendly picks
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden">
                    {hotel.coverImage ? (
                      <div
                        className="h-48 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url(${hotel.coverImage})` }}
                      />
                    ) : (
                      <div className="h-48 w-full gradient-forest flex items-center justify-center">
                        <Leaf className="h-12 w-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-forest text-primary-foreground text-xs">
                        {hotel.priceRange}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-0.5">
                      {Array.from({ length: hotel.ecoRating }).map((_, i) => (
                        <Leaf
                          key={i}
                          className="h-4 w-4 text-green-300 fill-green-300"
                        />
                      ))}
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
                          ({hotel.averageRating})
                        </span>
                      </div>
                    )}
                    {hotel.shortDesc && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
                        {hotel.shortDesc}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateTo('hotel-detail', hotel.id)}
                      className="mt-4 w-full group/btn"
                    >
                      View Details
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
