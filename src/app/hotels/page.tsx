import { HotelList } from '@/components/hotels/HotelList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eco-Hotels | Ethoss',
  description: 'Discover eco-friendly hotels and sustainable travel destinations.',
}

export default function HotelsPage() {
  return <HotelList />
}
