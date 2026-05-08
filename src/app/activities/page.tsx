import { ActivityList } from '@/components/activities/ActivityList'
import { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Activities & Challenges | Ethoss',
  description: 'Participate in our community events and environmental challenges to make a real impact.',
}

export default function ActivitiesPage() {
  return (
    <main className="min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header Section */}
        <div className="mb-10 text-center">
          <Badge className="mb-3 bg-forest/10 text-forest border-forest/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">
            Activities Hub
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter mb-3">
            Challenges & <span className="text-forest">Events</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover active competitions and community events driving impact.
          </p>
        </div>

        {/* Activity List Hub */}
        <ActivityList />
      </div>
    </main>
  )
}
