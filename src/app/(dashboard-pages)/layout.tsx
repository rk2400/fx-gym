'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  Dumbbell, User, Users, CreditCard, Clock, Flame, LogOut, Menu, X,
  Calendar, BarChart3, Settings, Shield, UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Each role gets its own navigation and its own landing dashboard
const memberNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Dumbbell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Membership', href: '/dashboard/membership', icon: CreditCard },
  { label: 'Check-in', href: '/dashboard/checkin', icon: Clock },
  { label: 'Streaks', href: '/dashboard/streak', icon: Flame },
]

const adminNavItems = [
  { label: 'Overview', href: '/admin', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

const trainerNavItems = [
  { label: 'My Clients', href: '/trainer/clients', icon: Users },
  { label: 'Schedule', href: '/trainer/schedule', icon: Calendar },
  { label: 'Progress Tracking', href: '/trainer/progress', icon: BarChart3 },
]

// Where each role lands after login (and if it wanders into another role's area)
const roleHome: Record<string, string> = {
  ADMIN: '/admin',
  TRAINER: '/trainer/clients',
  MEMBER: '/dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const role = (session?.user as any)?.role as string | undefined

  // Keep every role inside its own dashboard section
  useEffect(() => {
    if (status !== 'authenticated' || !role) return
    if (pathname.startsWith('/dashboard') && role !== 'MEMBER') {
      router.replace(roleHome[role])
    }
  }, [status, role, pathname, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gym-bg">
        <div className="animate-pulse flex h-8 w-8 text-gym-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const navItems =
    role === 'ADMIN' ? adminNavItems : role === 'TRAINER' ? trainerNavItems : memberNavItems
  const homeHref = roleHome[role ?? 'MEMBER'] ?? '/dashboard'

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const pageTitle = navItems.find((item) => isActive(item.href))?.label || navItems[0].label

  return (
    <div className="min-h-screen bg-gym-bg">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gym-surface border-r border-gym-border transform transition-transform duration-300 lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label={`${role === 'ADMIN' ? 'Admin' : role === 'TRAINER' ? 'Trainer' : 'Member'} navigation`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-gym-border">
          <Link href={homeHref} className="flex items-center space-x-2" aria-label="FX Gym Dashboard">
            <Dumbbell className="h-8 w-8 text-gym-primary" aria-hidden="true" />
            <span className="font-heading text-xl font-bold text-gym-text">FX Gym</span>
          </Link>
          <button
            className="lg:hidden p-2 text-gym-text-muted hover:text-gym-text"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-gym-primary text-gym-bg shadow-neon-primary/30'
                  : 'text-gym-text-muted hover:text-gym-text hover:bg-gym-bg'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gym-border">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gym-text-muted hover:text-gym-accent hover:bg-gym-bg transition-colors"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gym-border bg-gym-surface/95 backdrop-blur-sm px-6 lg:px-8">
          <button
            className="lg:hidden p-2 text-gym-text-muted hover:text-gym-text"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-heading text-xl font-semibold text-gym-text">{pageTitle}</h1>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gym-text-muted">
              {role === 'ADMIN' && <Shield className="h-4 w-4 text-gym-primary" aria-hidden="true" />}
              {role === 'TRAINER' && <UserCog className="h-4 w-4 text-gym-secondary" aria-hidden="true" />}
              <span className="font-medium text-gym-text">{session.user?.name || session.user?.email}</span>
              {role && (
                <span className="rounded-full bg-gym-bg px-2 py-0.5 text-xs font-medium text-gym-text-muted">
                  {role}
                </span>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 rounded-lg text-gym-text-muted hover:text-gym-text hover:bg-gym-bg transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-8" id="main-content">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}