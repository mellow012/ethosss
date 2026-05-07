import { ActivityList } from '@/components/activities/ActivityList'
import { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Activities & Challenges | Ethoss',
  description: 'Participate in our community events and environmental challenges to make a real impact.',
}

export default function ActivitiesPage() {
  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-forest/10 text-forest hover:bg-forest/20 border-none px-4 py-1 text-sm font-semibold">
            Get Involved
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-4">
            Challenges & <span className="text-gradient-forest">Events</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover active competitions, join community-driven activities, and track our environmental impact together.
          </p>
        </div>

        {/* Activity List Hub */}
        <ActivityList />
      </div>
    </main>
  )
}
