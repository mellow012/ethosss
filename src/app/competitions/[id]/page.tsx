import { CompetitionDetail } from '@/components/competitions/CompetitionDetail'

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CompetitionDetail id={id} />
}
