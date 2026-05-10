'use client'

import { useState, useEffect, useCallback, useSyncExternalStore, startTransition } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TreePine,
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { usePathname, useRouter } from 'next/navigation'

const navLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Activities', href: '/activities' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Eco-Business', href: '/eco-business' },
  { label: 'Media Hub', href: '/media-hub' },
]

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const mounted = useSyncExternalStore(
    (cb) => {
      cb()
      return () => {}
    },
    () => true,
    () => false
  )

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)
  }, [])

  useEffect(() => {
    const onScroll = () => startTransition(() => handleScroll())
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [handleScroll])

  const handleNav = (href: string) => {
    router.push(href)
  }

  const userRole = (session?.user as any)?.role
  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const userImage = session?.user?.image
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav('/')}
            className="flex items-center group"
          >
            <img
              src={mounted && theme === 'dark' ? '/ethos-logo.jpeg' : '/ethos-white-logo.jpeg'}
              alt="Ethosss"
              className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="ml-2.5 text-xl font-bold tracking-tight text-foreground">
              Ethosss
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'text-forest'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {(pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))) && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-forest/10 rounded-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            <Button
              onClick={() => handleNav('/get-involved')}
              className="hidden lg:flex bg-gold hover:bg-gold-dark text-bark font-bold rounded-xl h-9 px-4 text-xs uppercase tracking-wider"
            >
              Get Involved
            </Button>

            {/* Auth Buttons / Avatar */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userImage || undefined} alt={userName} />
                      <AvatarFallback className="bg-forest text-primary-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNav('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem onClick={() => handleNav('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNav('/login')}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNav('/signup')}
                  className="bg-forest hover:bg-forest-dark text-primary-foreground"
                >
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 pt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center">
                    <img
                      src={mounted && theme === 'dark' ? '/ethos-logo.jpeg' : '/ethos-white-logo.jpeg'}
                      alt="Ethosss"
                      className="h-8 w-auto object-contain"
                    />
                    <span className="ml-2 text-lg font-bold tracking-tight text-foreground">
                      Ethosss
                    </span>
                  </div>

                  {/* Mobile Nav Links */}
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <button
                          onClick={() => handleNav(link.href)}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                              ? 'bg-forest/10 text-forest'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {link.label}
                        </button>
                      </SheetClose>
                    ))}
                  </nav>

                  {/* Mobile Auth */}
                  <div className="border-t border-border pt-4 flex flex-col gap-4">
                    <Button
                      onClick={() => handleNav('/get-involved')}
                      className="w-full bg-gold hover:bg-gold-dark text-bark font-bold"
                    >
                      Get Involved
                    </Button>
                    
                    {session ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 px-4 py-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={userImage || undefined} alt={userName} />
                            <AvatarFallback className="bg-forest text-primary-foreground text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                        <SheetClose asChild>
                          <button
                            onClick={() => handleNav('/dashboard')}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Dashboard
                          </button>
                        </SheetClose>
                        {userRole === 'admin' && (
                          <SheetClose asChild>
                            <button
                              onClick={() => handleNav('/admin')}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                            >
                              <Shield className="h-4 w-4" />
                              Admin Panel
                            </button>
                          </SheetClose>
                        )}
                        <SheetClose asChild>
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Log out
                          </button>
                        </SheetClose>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            onClick={() => handleNav('/login')}
                            className="w-full"
                          >
                            Log in
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            onClick={() => handleNav('/signup')}
                            className="w-full bg-forest hover:bg-forest-dark text-primary-foreground"
                          >
                            Sign up
                          </Button>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
