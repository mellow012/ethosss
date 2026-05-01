import { CompetitionList } from '@/components/competitions/CompetitionList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Competitions | Ethosss',
  description: 'Join environmental competitions, share your stories, and win prizes.',
}

export default function CompetitionsPage() {
  return <CompetitionList />
}
