'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Dumbbell, LayoutDashboard, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gym-bg/95 backdrop-blur-md border-b border-gym-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" aria-label="FX Gym Home">
              <Dumbbell className="h-8 w-8 text-gym-primary" aria-hidden="true" />
              <span className="font-heading text-xl font-bold text-gym-text">FX Gym</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-gym-primary',
                  pathname === item.href ? 'text-gym-primary' : 'text-gym-text-muted'
                )}
              >
                {item.label}
              </Link>
            ))}
            {session && (() => {
              const role = (session.user as any)?.role
              const dashboardHref = role === 'ADMIN' ? '/admin' : role === 'TRAINER' ? '/trainer/clients' : '/dashboard'
              const dashboardLabel = role === 'ADMIN' ? 'Admin' : role === 'TRAINER' ? 'Trainer' : 'Dashboard'
              const isActive = role === 'ADMIN' ? pathname.startsWith('/admin') : role === 'TRAINER' ? pathname.startsWith('/trainer') : pathname.startsWith('/dashboard')
              
              return (
                <Link
                  href={dashboardHref}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-gym-primary flex items-center space-x-1',
                    isActive ? 'text-gym-primary' : 'text-gym-text-muted'
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{dashboardLabel}</span>
                </Link>
              )
            })()}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {status === 'loading' ? (
              <div className="w-20 h-10 animate-pulse bg-gym-border rounded" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{session.user?.name?.split(' ')[0] || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link 
                        href={(session.user as any)?.role === 'ADMIN' ? '/admin' : (session.user as any)?.role === 'TRAINER' ? '/trainer/clients' : '/dashboard'} 
                        className="flex items-center space-x-2"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{(session.user as any)?.role === 'ADMIN' ? 'Admin Dashboard' : (session.user as any)?.role === 'TRAINER' ? 'Trainer Dashboard' : 'Dashboard'}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(session.user as any)?.role === 'MEMBER' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/membership" className="flex items-center space-x-2 text-gym-text">
                            <span>Membership</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/checkin" className="flex items-center space-x-2 text-gym-text">
                            <span>Check-in</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/streak" className="flex items-center space-x-2 text-gym-text">
                            <span>Streaks</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: window.location.origin + '/' })}
                      className="text-gym-accent focus:text-gym-accent flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/contact">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gym-text hover:text-gym-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 space-y-2 border-t border-gym-border">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-2 py-2 text-base font-medium rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-gym-surface text-gym-primary'
                    : 'text-gym-text-muted hover:text-gym-text hover:bg-gym-surface'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {session && (() => {
              const role = (session.user as any)?.role
              const dashboardHref = role === 'ADMIN' ? '/admin' : role === 'TRAINER' ? '/trainer/clients' : '/dashboard'
              const dashboardLabel = role === 'ADMIN' ? 'Admin Dashboard' : role === 'TRAINER' ? 'Trainer Dashboard' : 'Dashboard'
              const isActive = role === 'ADMIN' ? pathname.startsWith('/admin') : role === 'TRAINER' ? pathname.startsWith('/trainer') : pathname.startsWith('/dashboard')
              
              return (
                <Link
                  href={dashboardHref}
                  className={cn(
                    'block px-2 py-2 text-base font-medium rounded-lg transition-colors',
                    isActive ? 'bg-gym-surface text-gym-primary' : 'text-gym-text-muted hover:text-gym-text hover:bg-gym-surface'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dashboardLabel}
                </Link>
              )
            })()}
            <Separator className="my-4" />
            <div className="px-2 space-y-2">
              {session ? (
                <>
                  {(session.user as any)?.role === 'MEMBER' && (
                    <>
                      <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">Profile</Button>
                      </Link>
                      <Link href="/dashboard/membership" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">Membership</Button>
                      </Link>
                      <Link href="/dashboard/checkin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">Check-in</Button>
                      </Link>
                      <Link href="/dashboard/streak" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">Streaks</Button>
                      </Link>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-gym-accent hover:bg-gym-accent/10"
                    onClick={() => { signOut({ callbackUrl: window.location.origin + '/' }); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">Sign In</Button>
                  </Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

import { Separator } from '@/components/ui/separator'