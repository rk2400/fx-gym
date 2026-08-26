'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Trophy, Calendar, Target, Crown, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface Streaks {
  current: number
  longest: number
  thisWeek: number
  thisMonth: number
  totalCheckins: number
}

export default function StreakPage() {
  const [loading, setLoading] = useState(true)
  const [streaks, setStreaks] = useState<Streaks>({ current: 0, longest: 0, thisWeek: 0, thisMonth: 0, totalCheckins: 0 })
  const [checkinDates, setCheckinDates] = useState<string[]>([]) // 'YYYY-MM-DD' unique sorted asc

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/dashboard/streaks').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/dashboard/checkins?limit=500').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([s, c]) => {
        if (cancelled) return
        if (s && typeof s.current === 'number') setStreaks(s)
        const rows = Array.isArray(c) ? c : []
        const dates = Array.from(new Set(rows.map((x: any) => String(x.checkedIn ?? x.date ?? '').slice(0, 10))))
          .filter(Boolean)
          .sort()
        setCheckinDates(dates)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // ── Derived (100% from real check-ins; a brand-new user gets zeros/empties) ──
  const dateSet = useMemo(() => new Set(checkinDates), [checkinDates])

  const lastWorkout = checkinDates.length > 0 ? checkinDates[checkinDates.length - 1] : null

  // Last 28 days grid (4 week-rows x 7 day-columns, Monday-first)
  const heatWeeks = useMemo(() => {
    const today = new Date()
    const cells: { key: string; date: string; visited: boolean; isToday: boolean }[] = []
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      cells.push({ key, date: key, visited: dateSet.has(key), isToday: i === 0 })
    }
    const weeks: (typeof cells)[] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
    return weeks
  }, [dateSet])

  // Last 6 months visit counts
  const monthly = useMemo(() => {
    const out: { label: string; count: number; year: number; month: number }[] = []
    const now = new Date()
    for (let k = 5; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1)
      const count = checkinDates.filter((ds) => {
        const dt = new Date(ds + 'T00:00:00')
        return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth()
      }).length
      out.push({ label: d.toLocaleString('en-US', { month: 'short' }), count, year: d.getFullYear(), month: d.getMonth() })
    }
    return out
  }, [checkinDates])

  // Best visits in any single calendar week (Mon-start) – for the Week Warrior badge
  const bestWeekVisits = useMemo(() => {
    const byWeek = new Map<string, number>()
    for (const ds of checkinDates) {
      const d = new Date(ds + 'T00:00:00')
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      const key = monday.toISOString().slice(0, 10)
      byWeek.set(key, (byWeek.get(key) || 0) + 1)
    }
    return byWeek.size ? Math.max(...Array.from(byWeek.values())) : 0
  }, [checkinDates])

  const achievements = [
    { id: 'first', label: 'First Steps', description: 'Complete your first workout', icon: Sparkles, unlocked: streaks.totalCheckins >= 1 },
    { id: 'week', label: 'Week Warrior', description: '5 workouts in one week', icon: Flame, unlocked: bestWeekVisits >= 5 },
    { id: 'streak21', label: 'Habit Former', description: '21 day streak', icon: Flame, unlocked: streaks.longest >= 21, progress: Math.min(streaks.longest, 21), target: 21 },
    { id: 'month', label: 'Monthly Master', description: '30 consecutive days', icon: Calendar, unlocked: streaks.longest >= 30, progress: Math.min(streaks.longest, 30), target: 30 },
    { id: 'hundred', label: 'Century Club', description: '100 total workouts', icon: Trophy, unlocked: streaks.totalCheckins >= 100, progress: Math.min(streaks.totalCheckins, 100), target: 100 },
    { id: 'streak50', label: 'Iron Will', description: '50 day streak', icon: Crown, unlocked: streaks.longest >= 50, progress: Math.min(streaks.longest, 50), target: 50 },
    { id: 'fivehundred', label: 'Legend', description: '500 total workouts', icon: Trophy, unlocked: streaks.totalCheckins >= 500, progress: Math.min(streaks.totalCheckins, 500), target: 500 },
    { id: 'year', label: 'Year Round', description: '365 day streak', icon: Calendar, unlocked: streaks.longest >= 365, progress: Math.min(streaks.longest, 365), target: 365 },
  ]

  const maxMonthVisits = Math.max(10, ...monthly.map((m) => m.count))

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gym-primary" aria-label="Loading streaks" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 text-gym-text flex items-center space-x-2">
            <Flame className="h-7 w-7 text-gym-primary" aria-hidden="true" />
            <span>Streaks & Achievements</span>
          </h1>
          <p className="text-gym-text-muted mt-1">
            {streaks.totalCheckins === 0
              ? 'Check in at the gym to start your first streak'
              : lastWorkout
                ? `Last workout: ${formatDate(lastWorkout)}`
                : ''}
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid gap-4 md:grid-cols-4">
        <StatCard label="Current Streak" value={streaks.current} suffix="days" icon={Flame} trend={`${streaks.thisWeek} visits this week`} />
        <StatCard label="Longest Streak" value={streaks.longest} suffix="days" icon={Trophy} trend="Personal best" />
        <StatCard label="Total Workouts" value={streaks.totalCheckins} suffix="" icon={CheckCircle2} trend="Since joining" />
        <StatCard label="This Month" value={streaks.thisMonth} suffix="visits" icon={Calendar} trend={`${streaks.thisWeek} this week`} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.map((a, index) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.04 }}
                  className={`p-4 rounded-xl border ${a.unlocked ? 'bg-gym-bg border-gym-primary/40' : 'bg-gym-bg/50 border-gym-border opacity-70'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${a.unlocked ? 'bg-gym-primary/15' : 'bg-gym-border/50'}`}>
                        <a.icon className={`h-5 w-5 ${a.unlocked ? 'text-gym-primary' : 'text-gym-text-muted'}`} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium text-gym-text">{a.label}</p>
                        <p className="text-xs text-gym-text-muted">{a.description}</p>
                      </div>
                    </div>
                    {a.unlocked ? (
                      <Badge variant="success">Unlocked</Badge>
                    ) : (
                      <Badge variant="secondary">{a.progress ?? 0}/{a.target ?? 0}</Badge>
                    )}
                  </div>
                  {!a.unlocked && a.target != null && (
                    <div className="mt-3 h-1.5 rounded-full bg-gym-border overflow-hidden">
                      <div
                        className="h-full bg-gym-primary/60 rounded-full"
                        style={{ width: `${Math.round(((a.progress ?? 0) / (a.target || 1)) * 100)}%` }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle>Last 4 Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-gym-text-muted">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              {heatWeeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, di) => {
                    // Pad the first week so days align Monday-first
                    const first = week[0]
                    const offset = wi === 0 ? (new Date(first.date + 'T00:00:00').getDay() + 6) % 7 : 0
                    const cell = di >= offset && di - offset < week.length ? week[di - offset] : null
                    if (!cell) return <div key={di} className="aspect-square rounded-md bg-transparent" />
                    return (
                      <div
                        key={cell.key}
                        title={cell.date}
                        className={`aspect-square rounded-md ${cell.visited ? 'bg-gym-primary' : 'bg-gym-border/60'} ${cell.isToday ? 'ring-2 ring-gym-secondary' : ''}`}
                      />
                    )
                  })}
                </div>
              ))}
              <p className="text-xs text-gym-text-muted pt-1">
                {checkinDates.length === 0 ? 'No visits yet – your activity will appear here.' : `${streaks.thisMonth} visits this month.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle>Monthly Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthly.map((stat, index) => (
                <motion.div
                  key={`${stat.year}-${stat.month}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-gym-bg"
                >
                  <div className="w-20 text-right font-medium text-gym-text-muted">{stat.label}</div>
                  <div className="flex-1 h-8 bg-gym-border rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.count / maxMonthVisits) * 100}%` }}
                      transition={{ delay: 0.4 + index * 0.05, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-gym-primary to-gym-secondary rounded-full"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white">
                      {stat.count}
                    </span>
                  </div>
                  <div className="w-16 text-center">
                    <div className="h-6 w-6 rounded-full bg-gym-primary/10 flex items-center justify-center mx-auto">
                      {stat.count >= 15 ? (
                        <Flame className="h-4 w-4 text-gym-primary" aria-hidden="true" />
                      ) : (
                        <Target className="h-4 w-4 text-gym-text-muted" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function StatCard({ label, value, suffix, icon: Icon, trend }: {
  label: string; value: number; suffix?: string; icon: React.ComponentType<{ className?: string }>; trend: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gym-surface border border-gym-border">
      <div className="p-3 rounded-xl bg-gym-primary/10 w-fit">
        <Icon className="h-6 w-6 text-gym-primary" aria-hidden="true" />
      </div>
      <div className="mt-4">
        <div className="flex items-baseline space-x-1">
          <p className="font-heading text-3xl font-bold text-gym-text">{value}</p>
          {suffix && <span className="text-gym-text-muted">{suffix}</span>}
        </div>
        <p className="text-sm text-gym-text-muted mt-1">{label}</p>
        <p className="text-xs text-gym-primary mt-2">{trend}</p>
      </div>
    </motion.div>
  )
}