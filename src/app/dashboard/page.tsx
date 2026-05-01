import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Ethosss',
  description: 'Your personal Ethosss dashboard.',
}

export default function DashboardPage() {
  return <UserDashboard />
}
