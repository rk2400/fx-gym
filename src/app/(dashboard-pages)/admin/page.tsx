'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Users,
  Dumbbell,
  DollarSign,
  Tag,
  UserPlus,
  UserCheck,
  Clock,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { cn, formatPrice } from '@/lib/utils'

interface StatsResponse {
  totalMembers: number
  newMembersThisMonth: number
  activeTrainers: number
  totalTrainers: number
  monthlyRevenue: number
  newSubscriptionsThisMonth: number
  checkinsToday: number
  checkinsYesterday: number
  roleDistribution: { role: string; count: number }[]
  recentUsers: {
    id: string
    name: string | null
    email: string
    role: string
    memberId: string | null
    isActive: boolean
    emailVerified: string | null
    createdAt: string
  }[]
  generatedAt: string
}

export default function AdminOverviewPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load stats')
      setData(json)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Keep metrics live — poll every 60s without flashing skeletons
  useEffect(() => {
    const t = setInterval(() => load(true), 60_000)
    return () => clearInterval(t)
  }, [load])

  const checkinDelta =
    data && data.checkinsYesterday > 0
      ? Math.round(((data.checkinsToday - data.checkinsYesterday) / data.checkinsYesterday) * 100)
      : null

  const stats = data
    ? [
        {
          label: 'Total Members',
          value: data.totalMembers.toLocaleString('en-IN'),
          icon: Users,
          color: 'from-gym-primary to-green-600',
          trend: `${data.newMembersThisMonth >= 0 ? '+' : ''}${data.newMembersThisMonth} this month`,
          trendDir: data.newMembersThisMonth > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Active Trainers',
          value: data.activeTrainers.toLocaleString('en-IN'),
          icon: Dumbbell,
          color: 'from-gym-secondary to-blue-600',
          trend: `of ${data.totalTrainers} total`,
          trendDir: 'neutral',
        },
        {
          label: 'Monthly Revenue',
          value: formatPrice(data.monthlyRevenue),
          icon: DollarSign,
          color: 'from-purple-500 to-gym-secondary',
          trend: `${data.newSubscriptionsThisMonth > 0 ? '+' : ''}${data.newSubscriptionsThisMonth} new subs`,
          trendDir: data.newSubscriptionsThisMonth > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Check-ins Today',
          value: data.checkinsToday.toLocaleString('en-IN'),
          icon: Clock,
          color: 'from-orange-500 to-red-500',
          trend:
            checkinDelta === null
              ? `${data.checkinsYesterday} yesterday`
              : `${checkinDelta >= 0 ? '+' : ''}${checkinDelta}% vs yesterday`,
          trendDir: checkinDelta === null ? 'neutral' : checkinDelta >= 0 ? 'up' : 'down',
        },
      ]
    : []

  const totalRoles = data?.roleDistribution.reduce((s, r) => s + r.count, 0) ?? 0

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 text-gym-text">
            Admin Overview{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gym-text-muted mt-1">
            Live system-wide metrics
            {data
              ? ` · updated ${new Date(data.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
              : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/users">View All Users</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users/new">Add New User</Link>
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => load()}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gym-surface border border-gym-border space-y-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="p-6 rounded-2xl bg-gym-surface border border-gym-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn('p-3 rounded-xl bg-gradient-to-br text-white', stat.color)}>
                  <stat.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div
                  className={cn(
                    'flex items-center space-x-1 text-sm',
                    stat.trendDir === 'up' && 'text-gym-primary',
                    stat.trendDir === 'down' && 'text-red-400',
                    stat.trendDir === 'neutral' && 'text-gym-text-muted'
                  )}
                >
                  {stat.trendDir === 'up' && <ArrowUpRight className="h-4 w-4" />}
                  {stat.trendDir === 'down' && <ArrowDownRight className="h-4 w-4" />}
                  {stat.trendDir === 'neutral' && <Minus className="h-4 w-4" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-sm text-gym-text-muted">{stat.label}</p>
              <p className="font-heading text-3xl font-bold text-gym-text mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-gym-text flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-gym-primary" />
              <span>Recent Registrations</span>
            </h2>
            <Link href="/admin/users" className="text-sm text-gym-primary hover:text-gym-primary-dim flex items-center space-x-1">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Card className="bg-gym-surface border-gym-border overflow-hidden">
            {loading ? (
              <CardContent className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </CardContent>
            ) : data && data.recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gym-border bg-gym-bg/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Member</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Member ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gym-border/50">
                    {data.recentUsers.map((user) => {
                      const status = !user.isActive ? 'inactive' : !user.emailVerified ? 'pending' : 'active'
                      return (
                        <tr key={user.id} className="hover:bg-gym-bg/50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gym-text">{user.name || 'Unnamed user'}</p>
                              <p className="text-sm text-gym-text-muted">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                user.role === 'ADMIN' && 'bg-gym-accent/10 text-gym-accent',
                                user.role === 'TRAINER' && 'bg-gym-secondary/10 text-gym-secondary',
                                user.role === 'MEMBER' && 'bg-gym-primary/10 text-gym-primary'
                              )}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-gym-text-muted">{user.memberId || '—'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                status === 'active' && 'bg-gym-primary/10 text-gym-primary',
                                status === 'pending' && 'bg-yellow-500/10 text-yellow-400',
                                status === 'inactive' && 'bg-red-500/10 text-red-400'
                              )}
                            >
                              {status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gym-text-muted">
                            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <CardContent className="py-10 text-center text-sm text-gym-text-muted">
                No users registered yet.
              </CardContent>
            )}
          </Card>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="heading-3 text-gym-text flex items-center space-x-2">
            <Tag className="h-5 w-5 text-gym-secondary" />
            <span>Role Distribution</span>
          </h2>
          <Card className="bg-gym-surface border-gym-border">
            <CardContent className="p-6 space-y-5">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))
                : (data?.roleDistribution ?? []).map((item) => {
                    const pct =
                      totalRoles > 0
                        ? Math.max((item.count / totalRoles) * 100, item.count > 0 ? 2 : 0)
                        : 0
                    return (
                      <div key={item.role}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gym-text">
                            {item.role.charAt(0) + item.role.slice(1).toLowerCase()}s
                          </span>
                          <span className="text-gym-text-muted">
                            {item.count.toLocaleString('en-IN')} ({totalRoles > 0 ? pct.toFixed(1) : '0.0'}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gym-border rounded-full overflow-hidden mt-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className={cn(
                              'h-full rounded-full',
                              item.role === 'MEMBER' && 'bg-gradient-to-r from-gym-primary to-green-500',
                              item.role === 'TRAINER' && 'bg-gradient-to-r from-gym-secondary to-blue-500',
                              item.role === 'ADMIN' && 'bg-gradient-to-r from-gym-accent to-purple-500'
                            )}
                          />
                        </div>
                      </div>
                    )
                  })}
              {!loading && data && totalRoles === 0 && (
                <p className="text-sm text-gym-text-muted">No users yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="heading-3 text-gym-text">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            icon={UserPlus}
            title="Add New Member"
            description="Create a new member account with credentials"
            href="/admin/users/new"
            color="from-gym-primary to-green-600"
          />
          <QuickActionCard
            icon={UserCheck}
            title="Verify Pending Users"
            description="Review and activate pending registrations"
            href="/admin/users?status=unverified"
            color="from-yellow-500 to-orange-500"
          />
          <QuickActionCard
            icon={Tag}
            title="Membership Plans"
            description="Update prices and plan details site-wide"
            href="/admin/pricing"
            color="from-gym-primary to-gym-secondary"
          />
          <QuickActionCard
            icon={BarChart3}
            title="System Analytics"
            description="Check-in trends, retention, and more"
            href="/admin/analytics"
            color="from-gym-secondary to-blue-600"
          />
        </div>
      </motion.section>
    </div>
  )
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="group p-6 rounded-2xl bg-gym-surface border border-gym-border hover:border-gym-primary/50 hover:shadow-neon-primary/20 transition-all duration-300"
    >
      <div className={cn('p-3 rounded-xl bg-gradient-to-br mb-4', color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="font-semibold text-gym-text mb-1">{title}</h3>
      <p className="text-sm text-gym-text-muted">{description}</p>
      <span className="inline-flex items-center mt-4 text-sm text-gym-primary font-medium group-hover:gap-1 transition-all">
        View →
      </span>
    </Link>
  )
}