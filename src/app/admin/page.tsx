import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel | Ethosss',
  description: 'Ethosss administrative dashboard.',
}

export default function AdminPage() {
  return <AdminDashboard />
}
