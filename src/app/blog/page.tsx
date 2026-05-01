import { BlogList } from '@/components/blog/BlogList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Ethosss',
  description: 'Explore stories, guides, and insights on environmental conservation.',
}

export default function BlogPage() {
  return <BlogList />
}
