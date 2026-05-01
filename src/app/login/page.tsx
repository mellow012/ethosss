import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In | Ethosss',
  description: 'Log in to your Ethosss account.',
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <LoginForm />
    </div>
  )
}
