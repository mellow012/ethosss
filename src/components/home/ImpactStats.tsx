'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TreePine, Users, Globe, Leaf, Award, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ImpactStat {
  id: string
  label: string
  value: string
  icon?: string
  order: number
}

const iconMap: Record<string, React.ElementType> = {
  tree: TreePine,
  users: Users,
  globe: Globe,
  leaf: Leaf,
  award: Award,
  heart: Heart,
}

const defaultStats: ImpactStat[] = [
  { id: '1', label: 'Trees Planted', value: '25000', icon: 'tree', order: 0 },
  { id: '2', label: 'Active Members', value: '5200', icon: 'users', order: 1 },
  { id: '3', label: 'UK Regions', value: '15', icon: 'globe', order: 2 },
  { id: '4', label: 'Eco Hotels', value: '42', icon: 'leaf', order: 3 },
  { id: '5', label: 'Competitions Won', value: '180', icon: 'award', order: 4 },
  { id: '6', label: 'Volunteer Hours', value: '12000', icon: 'heart', order: 5 },
]

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [inView, value, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export function ImpactStats() {
  const [stats, setStats] = useState<ImpactStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/impact')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats && data.stats.length > 0) {
          setStats(data.stats)
        } else {
          setStats(defaultStats)
        }
      })
      .catch(() => setStats(defaultStats))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-20 bg-leaf-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Our <span className="text-gradient-forest">Impact</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Together with our community, we are making a measurable difference
            for the environment across the United Kingdom.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon ? iconMap[stat.icon] || TreePine : TreePine
              const numericValue = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0
              const suffix = stat.value.replace(/[0-9,]/g, '')

              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                      <div className="h-12 w-12 rounded-full bg-forest/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-forest" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        <AnimatedCounter value={numericValue} />
                        {suffix}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
