import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Ethoss | Environmental Advocacy & Eco-Tourism UK',
  description:
    'Join Ethoss in building a sustainable future through tree planting, eco-tourism, and community action across the UK. Discover eco-friendly hotels, enter environmental competitions, and read inspiring stories of conservation.',
  keywords: [
    'Ethoss',
    'environmental advocacy',
    'eco-tourism',
    'tree planting UK',
    'sustainable travel',
    'conservation',
    'green hotels',
    'nature competitions',
  ],
  authors: [{ name: 'Ethoss Team' }],
  icons: {
    icon: '/favicon.jpeg',
  },
  openGraph: {
    title: 'Ethoss — See the World, Save the Planet',
    description:
      'Protecting Nature, Inspiring Change. Join Ethoss for eco-tourism, tree planting, and community action across the UK.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethoss — See the World, Save the Planet',
    description:
      'Protecting Nature, Inspiring Change. Join Ethoss for eco-tourism, tree planting, and community action across the UK.',
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
