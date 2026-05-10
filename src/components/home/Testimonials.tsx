'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    id: 1,
    text: 'Ethosss has completely transformed how I think about travel. Finding eco-friendly hotels in Africa has never been easier. The retreat in Maasai Mara was absolutely breathtaking and truly sustainable.',
    author: 'Sarah Mitchell',
    role: 'Eco-Traveller, Nairobi',
    rating: 5,
  },
  {
    id: 2,
    text: 'Winning the nature photography competition was a life-changing experience. It connected me with a community of like-minded people who care deeply about our environment. I now volunteer regularly with local conservation groups in South Africa.',
    author: 'James Hartley',
    role: 'Photographer & Volunteer, Cape Town',
    rating: 5,
  },
  {
    id: 3,
    text: 'The tree planting initiative organised by Ethosss has planted over 500 trees in our community alone. My children now understand the importance of environmental stewardship and look forward to every planting day.',
    author: 'Priya Sharma',
    role: 'Community Leader, Lilongwe',
    rating: 5,
  },
  {
    id: 4,
    text: 'As a hotel owner, being verified by Ethosss has brought us guests who genuinely appreciate sustainability. Our occupancy has increased by 30% since joining the platform, and every guest values our eco-friendly practices.',
    author: 'Tom Whitaker',
    role: 'Hotel Owner, Victoria Falls',
    rating: 5,
  },
  {
    id: 5,
    text: 'The blog articles are incredibly well-researched and inspiring. I started composting, reduced my carbon footprint, and even convinced my workplace to adopt green policies. Small steps, big impact!',
    author: 'Emily Chen',
    role: 'Sustainability Advocate, Lagos',
    rating: 5,
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3
  const totalPages = Math.ceil(testimonials.length / itemsPerView)

  const next = () => setCurrentIndex((prev) => (prev + 1) % totalPages)
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)

  const currentTestimonials = testimonials.slice(
    currentIndex * itemsPerView,
    currentIndex * itemsPerView + itemsPerView
  )

  return (
    <section className="py-20 gradient-forest text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Voices from Our Community
          </h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            Hear from the people who are part of the Ethosss journey —
            travellers, volunteers, hoteliers, and advocates for change.
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {currentTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="bg-white/10 backdrop-blur-sm border-white/20 h-full"
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <Quote className="h-8 w-8 text-white/30 mb-4" />
                    <p className="text-white/90 text-sm leading-relaxed flex-1">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-0.5 mb-2">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-3.5 w-3.5 text-sunlight fill-sunlight"
                            />
                          )
                        )}
                      </div>
                      <p className="font-semibold text-sm">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-white/60">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === currentIndex
                        ? 'bg-white w-6'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
