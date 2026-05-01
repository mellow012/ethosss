import { SignupForm } from '@/components/auth/SignupForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Ethosss',
  description: 'Create a new Ethosss account.',
}

export default function SignupPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <SignupForm />
    </div>
  )
}
