'use client'

import { motion } from 'framer-motion'
import { HeroSection } from '@/components/home/HeroSection'
import { VisionSection } from '@/components/home/VisionSection'
import { WhatWeDoCarousel } from '@/components/home/WhatWeDoCarousel'
import { ImpactStats } from '@/components/home/ImpactStats'
import { EcoBusinessSuccess } from '@/components/home/EcoBusinessSuccess'
import { FeaturedHotels } from '@/components/home/FeaturedHotels'
import { ActiveCompetitions } from '@/components/home/ActiveCompetitions'
import { LatestPosts } from '@/components/home/LatestPosts'
import { Testimonials } from '@/components/home/Testimonials'
import { UpcomingEvents } from '@/components/home/UpcomingEvents'
import { JoinMovement } from '@/components/home/JoinMovement'
import dynamic from 'next/dynamic'

const TreePlantingMap = dynamic(
  () => import('@/components/home/TreePlantingMap').then((mod) => mod.TreePlantingMap),
  { ssr: false }
)

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

const pageTransition: any = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.25,
}

export default function Home() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      <HeroSection />
      <VisionSection />
      <div id="what-we-do">
        <WhatWeDoCarousel />
      </div>
      <ImpactStats />
      <EcoBusinessSuccess />
      <UpcomingEvents />
      <LatestPosts />
      <ActiveCompetitions />
      <TreePlantingMap />
      <FeaturedHotels />
      <Testimonials />
      <JoinMovement />
    </motion.div>
  )
}
