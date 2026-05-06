'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  TreePine,
  Leaf,
  Mail,
  ArrowRight,
  Heart,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  MapPin,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

const quickLinks = [
  { label: 'Home', view: 'home' as const },
  { label: 'Blog', view: 'blog' as const },
  { label: 'Eco Hotels', view: 'hotels' as const },
  { label: 'Competitions', view: 'competitions' as const },
]

const resourceLinks = [
  { label: 'Tree Planting Guide', href: '#' },
  { label: 'Carbon Calculator', href: '#' },
  { label: 'Conservation Tips', href: '#' },
  { label: 'Volunteer Opportunities', href: '#' },
]

export function Footer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { setView } = useAppStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        toast.success('Thank you for subscribing to our newsletter!')
        setEmail('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNav = (view: 'home' | 'blog' | 'hotels' | 'competitions') => {
    setView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-auto">
      {/* Newsletter Banner — Gold accent */}
      <div className="bg-forest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                <Mail className="h-5 w-5 text-gold" />
                Join Our Green Newsletter
              </h3>
              <p className="text-forest-light mt-1 text-sm">
                Get the latest conservation news, eco-tips, and exclusive
                competition updates.
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md gap-2"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-gold"
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-gold text-forest-dark hover:bg-gold-dark font-semibold shrink-0"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer — Adaptive background */}
      <div className="bg-sage-light dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <button
                onClick={() => handleNav('home')}
                className="flex items-center group mb-4"
              >
                <img
                  src={mounted && theme === 'dark' ? '/ethos-logo.jpeg' : '/ethos-white-logo.jpeg'}
                  alt="Ethosss"
                  className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </button>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Empowering youth through green innovation and sustainable travel.
                A purpose-driven social enterprise committed to the green
                economy, eco-friendly tourism, and innovation across Southern
                Africa.
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-forest" />
                  Blantyre, Malawi Branch
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-forest" />
                  0883335839
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-forest" />
                  contact.ethosss@gmail.com
                </p>
              </div>
              <div className="flex gap-3 mt-5">
                {[Instagram, Twitter, Facebook, Globe].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="h-9 w-9 rounded-full bg-forest/10 flex items-center justify-center hover:bg-forest hover:text-white text-forest transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Leaf className="h-4 w-4 text-forest" />
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.view}>
                    <button
                      onClick={() => handleNav(link.view)}
                      className="text-sm text-muted-foreground hover:text-forest transition-colors flex items-center gap-1.5 group"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-forest" />
                Resources
              </h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-forest transition-colors flex items-center gap-1.5 group"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mission */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Heart className="h-4 w-4 text-gold-dark" />
                Our Mission
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To cultivate a generation of environmentally conscious leaders
                who drive sustainable growth, innovation, and regional
                integration across Africa.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-forest" />
                <span>Operating across Southern Africa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — Adaptive background */}
      <div className="bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Ethosss. All rights reserved. Made
              with{' '}
              <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> for
              the planet.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-forest transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-forest transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-forest transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
