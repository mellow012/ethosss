import { HotelDetail } from '@/components/hotels/HotelDetail'

export default async function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <HotelDetail id={id} />
}
