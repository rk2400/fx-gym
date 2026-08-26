'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Flame, Trophy, Calendar, Target, ArrowUpRight, Crown, Sparkles, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

const streakData = {
  current: 12,
  longest: 27,
  totalWorkouts: 247,
  thisMonth: 18,
  lastWorkout: '2024-01-15',
  weeklyGoal: 5,
  weeklyProgress: 4,
}

const achievements = [
  { id: 'first', label: 'First Steps', description: 'Complete your first workout', icon: Sparkles, unlocked: true, date: '2023-06-15' },
  { id: 'week', label: 'Week Warrior', description: 'Workout 5 days in a week', icon: Flame, unlocked: true, date: '2023-07-22' },
  { id: 'month', label: 'Monthly Master', description: '30 consecutive days', icon: Calendar, unlocked: true, date: '2023-09-10' },
  { id: 'hundred', label: 'Century Club', description: '100 total workouts', icon: Trophy, unlocked: true, date: '2023-12-01' },
  { id: 'streak21', label: 'Habit Former', description: '21 day streak', icon: Flame, unlocked: false, progress: 12, target: 21 },
  { id: 'streak50', label: 'Iron Will', description: '50 day streak', icon: Crown, unlocked: false, progress: 12, target: 50 },
  { id: 'fivehundred', label: 'Legend', description: '500 total workouts', icon: Trophy, unlocked: false, progress: 247, target: 500 },
  { id: 'year', label: 'Year Round', description: '365 day streak', icon: Calendar, unlocked: false, progress: 12, target: 365 },
]

const weeklyHeatmap = [
  { day: 'Mon', workouts: [true, true, true, true] },
  { day: 'Tue', workouts: [true, false, true, true] },
  { day: 'Wed', workouts: [true, true, true, false] },
  { day: 'Thu', workouts: [true, false, true, true] },
  { day: 'Fri', workouts: [true, true, true, true] },
  { day: 'Sat', workouts: [false, true, false, true] },
  { day: 'Sun', workouts: [false, false, true, false] },
]

const monthlyStats = [
  { month: 'Aug', workouts: 12 },
  { month: 'Sep', workouts: 15 },
  { month: 'Oct', workouts: 18 },
  { month: 'Nov', workouts: 14 },
  { month: 'Dec', workouts: 16 },
  { month: 'Jan', workouts: 18 },
]

export default function StreakPage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 text-gym-text flex items-center space-x-2">
            <Flame className="h-7 w-7 text-gym-primary" />
            <span>Streaks & Achievements</span>
          </h1>
          <p className="text-gym-text-muted mt-1">Build consistency, unlock rewards</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <StatCard 
          label="Current Streak" 
          value={streakData.current} 
          suffix="days" 
          icon={Flame} 
          color="from-orange-500 to-red-500" 
          trend="+3 this week"
        />
        <StatCard 
          label="Longest Streak" 
          value={streakData.longest} 
          suffix="days" 
          icon={Trophy} 
          color="from-yellow-500 to-orange-500" 
          trend="Personal best"
        />
        <StatCard 
          label="This Month" 
          value={streakData.thisMonth} 
          suffix="workouts" 
          icon={Calendar} 
          color="from-gym-primary to-green-600" 
          trend="+2 vs last month"
        />
        <StatCard 
          label="Total Workouts" 
          value={streakData.totalWorkouts} 
          suffix="" 
          icon={Target} 
          color="from-purple-500 to-gym-secondary" 
          trend="Since joining"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-gym-primary" />
              <span>Current Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="relative inline-block">
                <div className="w-40 h-40 rounded-full border-4 border-gym-primary/20 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-gym-primary flex items-center justify-center bg-gym-bg">
                    <div className="text-center">
                      <p className="font-heading text-4xl font-bold text-gym-primary">{streakData.current}</p>
                      <p className="text-sm text-gym-text-muted">days</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 p-2 rounded-full bg-gym-primary text-white shadow-lg">
                  <Flame className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gym-bg border border-gym-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gym-text">Weekly Goal Progress</span>
                <span className="text-gym-text-muted">{streakData.weeklyProgress}/{streakData.weeklyGoal} days</span>
              </div>
              <div className="h-2 bg-gym-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(streakData.weeklyProgress / streakData.weeklyGoal) * 100}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-gym-primary to-green-600 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gym-text-muted mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gym-primary/10 border border-gym-primary/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gym-primary">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gym-text">Keep it going!</p>
                  <p className="text-sm text-gym-text-muted">Only {streakData.longest - streakData.current} days to beat your record</p>
                </div>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                {streakData.current} 🔥
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gym-surface border-gym-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gym-primary" />
                <span>Activity Calendar</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-xs text-gym-text-muted font-medium py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {weeklyHeatmap.flatMap((week, weekIndex) => 
                  week.workouts.map((workedOut, dayIndex) => (
                    <motion.div
                      key={`${week.day}-${dayIndex}-${weekIndex}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: (weekIndex * 7 + dayIndex) * 0.02 }}
                      className={cn(
                        'aspect-square rounded-lg transition-colors',
                        workedOut 
                          ? 'bg-gym-primary hover:bg-gym-primary/80' 
                          : 'bg-gym-border hover:bg-gym-bg'
                      )}
                      title={workedOut ? `${week.day} - Workout completed` : `${week.day} - Rest day`}
                    >
                      {workedOut && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50 mx-auto mt-2" />
                      )}
                    </motion.div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-gym-text-muted pt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded bg-gym-primary" />
                  <span>Workout</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded bg-gym-border" />
                  <span>Rest</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-gym-primary" />
                <span>Achievements</span>
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gym-text-muted">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    achievement.unlocked 
                      ? 'bg-gym-surface border-gym-primary/30' 
                      : 'bg-gym-bg border-gym-border opacity-60'
                  )}
                >
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      'p-3 rounded-xl flex-shrink-0',
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                        : 'bg-gym-border'
                    )}>
                      <achievement.icon className={cn('h-6 w-6', achievement.unlocked ? 'text-white' : 'text-gym-text-muted')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gym-text">{achievement.label}</h3>
                        {achievement.unlocked && achievement.date && (
                          <Badge variant="success" className="text-xs">
                            Unlocked {formatDate(achievement.date)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gym-text-muted mt-1">{achievement.description}</p>
                      {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gym-text-muted">Progress</span>
                            <span className="font-medium text-gym-text">{achievement.progress}/{achievement.target}</span>
                          </div>
                          <div className="h-1.5 bg-gym-border rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                              transition={{ delay: 0.5 + index * 0.05, duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-gym-primary to-gym-secondary rounded-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {achievement.unlocked && (
                      <div className="flex flex-col items-end space-y-1">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <span className="text-xs text-yellow-500 font-medium">UNLOCKED</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gym-primary" />
              <span>Monthly Consistency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.map((stat, index) => (
                <motion.div
                  key={stat.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-gym-bg"
                >
                  <div className="w-20 text-right font-medium text-gym-text-muted">{stat.month}</div>
                  <div className="flex-1 h-8 bg-gym-border rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.workouts / 20) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.05, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-gym-primary to-gym-secondary rounded-full"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white">
                      {stat.workouts}
                    </span>
                  </div>
                  <div className="w-16 text-center">
                    <div className="h-6 w-6 rounded-full bg-gym-primary/10 flex items-center justify-center mx-auto">
                      {stat.workouts >= 15 ? (
                        <Flame className="h-4 w-4 text-gym-primary" />
                      ) : (
                        <Target className="h-4 w-4 text-gym-text-muted" />
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

function StatCard({ label, value, suffix, icon: Icon, color, trend }: { 
  label: string; value: number; suffix: string; icon: React.ComponentType<{ className?: string }>; color: string; trend: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gym-surface border border-gym-border"
    >
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-gradient-to-br {color}">
          <Icon className="h-6 w-6 text-white" />
        </div>
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

import { cn } from '@/lib/utils'