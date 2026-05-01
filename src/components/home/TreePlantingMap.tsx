'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchPlantingSites, getTotalTrees, getActiveSites } from './treePlantingData'

export interface TreePlantingSite {
  id: string
  name: string
  region: string
  latitude: number
  longitude: number
  treesPlanted: number
  species: string[]
  dateStarted: string
  status: 'active' | 'completed' | 'planned'
  description: string
  area: string
}

// Fix Leaflet default marker icon issue with bundlers
function getTreeIcon(status: string) {
  const colors: Record<string, string> = {
    active: '#16a34a',
    completed: '#15803d',
    planned: '#d4a843',
  }
  const color = colors[status] || '#16a34a'

  return L.divIcon({
    className: 'custom-tree-marker',
    html: `<div style="
      width: 32px; height: 32px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; line-height: 1;
    ">&#127794;</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    planned: 'Planned',
  }
  return labels[status] || status
}

function MapInner({ sites }: { sites: TreePlantingSite[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on UK
    const map = L.map(mapRef.current, {
      center: [54.5, -3.5],
      zoom: 6,
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: true,
    })

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Use a nature-friendly tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    // Cleanup on unmount
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update markers when sites change
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remove old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add tree planting markers
    sites.forEach((site) => {
      const marker = L.marker([site.latitude, site.longitude], {
        icon: getTreeIcon(site.status),
      }).addTo(mapInstanceRef.current!)

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 4px;">
          <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 6px; color: #1a2e05;">${site.name}</h3>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span style="font-size: 11px; color: #666;">${formatStatus(site.status)}</span>
            <span style="font-size: 11px; color: #999;">|</span>
            <span style="font-size: 11px; color: #666;">${site.region}</span>
          </div>
          <p style="font-size: 12px; color: #444; margin: 0 0 8px; line-height: 1.5;">${site.description}</p>
          <div style="background: #f0fdf4; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;">
            <div style="font-size: 20px; font-weight: 800; color: #16a34a;">${site.treesPlanted.toLocaleString()}</div>
            <div style="font-size: 11px; color: #666;">trees planted across ${site.area}</div>
          </div>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">
            <strong style="color: #555;">Species:</strong> ${site.species.join(', ')}
          </div>
          <div style="font-size: 11px; color: #888;">
            <strong style="color: #555;">Started:</strong> ${new Date(site.dateStarted).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'ethoss-tree-popup',
      })

      markersRef.current.push(marker)
    })
  }, [sites])

  return (
    <div ref={mapRef} className="w-full h-[450px] md:h-[520px] rounded-2xl overflow-hidden shadow-lg border border-border" />
  )
}

export function TreePlantingMap() {
  const [sites, setSites] = useState<TreePlantingSite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlantingSites().then(data => {
      setSites(data)
      setLoading(false)
    })
  }, [])

  const totalTrees = getTotalTrees(sites)
  const activeSites = getActiveSites(sites)

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-forest/10 dark:bg-forest/20 rounded-full px-4 py-1.5 mb-4">
            <MapPin className="h-4 w-4 text-forest" />
            <span className="text-sm font-medium text-forest dark:text-forest-light">Our Impact</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Where We Plant{' '}
            <span className="text-gradient-green">Trees</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Explore our tree planting sites across the United Kingdom. Each marker represents a community-driven
            reforestation project — click to learn more about the species, impact, and how you can get involved.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8"
        >
          {[
            { label: 'Trees Planted', value: totalTrees.toLocaleString(), accent: 'bg-forest' },
            { label: 'Planting Sites', value: sites.length.toString(), accent: 'bg-moss' },
            { label: 'Active Sites', value: activeSites.toString(), accent: 'bg-gold' },
            { label: 'UK Regions', value: '10+', accent: 'bg-forest-light' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-1 ${stat.accent} rounded-full mx-auto mb-2`} />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 mb-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-700 inline-block" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#d4a843' }} /> Planned
          </span>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="w-full h-[450px] md:h-[520px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
              <span className="text-muted-foreground">Loading Map...</span>
            </div>
          ) : (
            <MapInner sites={sites} />
          )}
        </motion.div>
      </div>

      {/* Inline styles for Leaflet popup customization */}
      <style jsx global>{`
        .custom-tree-marker {
          background: transparent !important;
          border: none !important;
        }
        .ethoss-tree-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          padding: 4px;
        }
        .ethoss-tree-popup .leaflet-popup-content {
          margin: 8px 12px;
        }
        .ethoss-tree-popup .leaflet-popup-tip {
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
      `}</style>
    </section>
  )
}

