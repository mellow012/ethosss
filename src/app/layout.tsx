import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// Font configuration commented out due to connectivity issues during build
// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// })

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// })

// Standard font fallbacks are now handled in globals.css
const geistSans = { variable: "" }
const geistMono = { variable: "" }


export const metadata: Metadata = {
  title: 'Ethosss | Empowering Youth Through Green Innovation & Sustainable Travel',
  description:
    'Ethosss is a purpose-driven social enterprise operating across Southern Africa, empowering young people through the green economy, eco-friendly tourism, and innovation. Join us in building a greener, more inclusive future for Africa.',
  keywords: [
    'Ethosss',
    'youth empowerment',
    'green economy',
    'sustainable travel Southern Africa',
    'eco-tourism',
    'climate action',
    'reforestation',
    'green innovation',
    'youth-led sustainability',
  ],
  authors: [{ name: 'Ethosss Team' }],
  icons: {
    icon: '/favicon.jpeg',
  },
  openGraph: {
    title: 'Ethosss — Empowering Youth Through Green Innovation',
    description:
      'A purpose-driven social enterprise empowering young people through the green economy, eco-friendly tourism, and innovation across Southern Africa.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethosss — Empowering Youth Through Green Innovation',
    description:
      'A purpose-driven social enterprise empowering young people through the green economy, eco-friendly tourism, and innovation across Southern Africa.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
            <SonnerToaster position="top-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
