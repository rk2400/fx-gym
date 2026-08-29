'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Flame, Clock, Target, CheckCircle, ChevronRight, Calendar, TrendingUp, User, Award, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Membership {
  id: string
  plan: { id: string; name: string; price: number; duration: number; description: string | null; features: string[] }
  status: string
  startDate: string
  endDate: string
}

interface Checkin {
  id: string
  checkedIn: string
  checkedOut: string | null
  duration: number
}

interface StreakData {
  current: number
  longest: number
  thisWeek: number
  thisMonth: number
  totalCheckins: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<Checkin[]>([])
  const [streakData, setStreakData] = useState<StreakData>({ current: 0, longest: 0, thisWeek: 0, thisMonth: 0, totalCheckins: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [membershipRes, checkinsRes, streakRes] = await Promise.all([
        fetch('/api/dashboard/membership'),
        fetch('/api/dashboard/checkins?limit=5'),
        fetch('/api/dashboard/streaks'),
      ])

      if (membershipRes.ok) setMembership(await membershipRes.json())
      if (checkinsRes.ok) setRecentCheckins(await checkinsRes.json())
      if (streakRes.ok) setStreakData(await streakRes.json())
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = [
    { label: 'Current Streak', value: `${streakData.current} days`, icon: Flame, color: 'from-orange-500 to-red-500', trend: `${streakData.thisWeek} this week` },
    { label: 'This Month', value: `${streakData.thisMonth} visits`, icon: Calendar, color: 'from-gym-primary to-green-600', trend: `${streakData.thisWeek} this week` },
    { label: 'Total Check-ins', value: `${streakData.totalCheckins}`, icon: Dumbbell, color: 'from-gym-secondary to-blue-600', trend: 'Since joining' },
    { label: 'Longest Streak', value: `${streakData.longest} days`, icon: Trophy, color: 'from-purple-500 to-gym-secondary', trend: 'Personal best' },
  ]

  const quickActions = [
    { label: 'Check In Now', href: '/dashboard/checkin', icon: Dumbbell, color: 'bg-gym-primary hover:bg-gym-primary-dim' },
    { label: 'View Membership', href: '/dashboard/membership', icon: Calendar, color: 'bg-gym-secondary hover:bg-blue-600' },
    { label: 'Update Profile', href: '/dashboard/profile', icon: Target, color: 'bg-gym-accent hover:bg-red-600' },
    { label: 'View Streaks', href: '/dashboard/streak', icon: Flame, color: 'bg-orange-500 hover:bg-orange-600' },
  ]

  const getFirstName = (name?: string | null) => name?.split(' ')[0] || 'Member'

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 text-gym-text">Welcome back, {getFirstName((session?.user as any)?.name)}! 👋</h1>
          <p className="text-gym-text-muted mt-1">Here's your fitness overview</p>
        </div>
        {loading && <div className="animate-pulse flex h-8 w-8 text-gym-primary" />}
      </motion.div>

      {/* Member ID Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-gym-surface border border-gym-border"
      >
        <div className="p-3 rounded-xl bg-gym-primary/10">
          <User className="h-6 w-6 text-gym-primary" />
        </div>
        <div>
          <p className="text-sm text-gym-text-muted">Member ID</p>
          <p className="font-heading text-lg font-bold text-gym-text font-mono">{(session?.user as any)?.memberId || 'FXG-XXXX-XXXX'}</p>
        </div>
        <Badge variant="success" className="ml-auto">Verified</Badge>
      </motion.div>

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
              <div className="p-3 rounded-xl bg-gradient-to-br {stat.color} text-white">
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <CheckCircle className="h-5 w-5 text-gym-primary" aria-hidden="true" />
            </div>
            <p className="text-sm text-gym-text-muted">{stat.label}</p>
            <p className="font-heading text-2xl font-bold text-gym-text mt-1">{stat.value}</p>
            <p className="text-xs text-gym-text-muted mt-2">{stat.trend}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-gym-text">Recent Check-ins</h2>
            <Link href="/dashboard/checkin" className="text-sm text-gym-primary hover:text-gym-primary-dim flex items-center space-x-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <Card className="bg-gym-surface border-gym-border">
            <CardContent className="p-0">
              <div className="divide-y divide-gym-border">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gym-primary mx-auto" />
                  </div>
                ) : recentCheckins.length === 0 ? (
                  <div className="p-8 text-center text-gym-text-muted">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gym-text-muted/30" />
                    <p>No check-ins yet</p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link href="/dashboard/checkin">Check In Now</Link>
                    </Button>
                  </div>
                ) : (
                  recentCheckins.map((checkin, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gym-bg/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gym-primary/10">
                          <Dumbbell className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-gym-text">Workout Session</p>
                          <p className="text-sm text-gym-text-muted">
                            {formatDate(checkin.checkedIn)} • {formatRelativeTime(checkin.checkedIn)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gym-text">{Math.round(checkin.duration / 60)} min</p>
                        <p className="text-xs text-gym-text-muted">Completed</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="heading-3 text-gym-text">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => window.location.href = action.href}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-xl text-left text-white transition-all hover:shadow-lg hover:shadow-gym-primary/20',
                  action.color
                )}
              >
                <action.icon className="h-6 w-6" aria-hidden="true" />
                <span className="font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="heading-3 text-gym-text">Your Active Membership</h2>
        <Card className="bg-gym-surface border-gym-border overflow-hidden">
          <div className="p-6">
            {membership ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-gym-primary to-green-600">
                    <Dumbbell className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold text-gym-text">{membership.plan?.name || 'No Plan'}</p>
                    <p className="text-gym-text-muted">
                      {membership.status === 'ACTIVE' ? (
                        <>
                          <Badge variant="success" className="mr-2">Active</Badge>
                          Valid until {formatDate(membership.endDate)} • {Math.max(0, Math.ceil((new Date(membership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining
                        </>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/membership">Manage</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/checkin">Check In</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gym-text-muted/30" />
                <p className="text-gym-text-muted">No active membership</p>
                <Button asChild className="mt-4">
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="heading-3 text-gym-text">Your Progress</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <ProgressCard label="Weekly Goal" value={streakData.thisWeek} target={5} unit="sessions" icon={Target} color="from-gym-primary to-green-600" />
          <ProgressCard label="Monthly Target" value={streakData.thisMonth} target={20} unit="visits" icon={Calendar} color="from-gym-secondary to-blue-600" />
          <ProgressCard label="Streak Record" value={streakData.longest} target={streakData.longest + 10} unit="days" icon={Flame} color="from-orange-500 to-red-500" />
        </div>
      </motion.section>
    </div>
  )
}

function ProgressCard({ label, value, target, unit, icon: Icon, color }: { 
  label: string; value: number; target: number; unit: string; icon: React.ComponentType<{ className?: string }>; color: string 
}) {
  const percent = Math.min(100, Math.round((value / target) * 100))
  return (
    <Card className="bg-gym-surface border-gym-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br {color}">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-gym-text">{value}/{target} {unit}</span>
        </div>
        <Progress value={percent} className="h-3 mb-2" />
        <div className="flex justify-between text-sm">
          <span className="text-gym-text-muted">{label}</span>
          <span className="text-gym-primary font-medium">{percent}%</span>
        </div>
      </CardContent>
    </Card>
  )
}