'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Dumbbell, Calendar, Zap, Flame, Target, Loader2, ChevronLeft, ChevronRight, MapPin, Shield, AlertCircle, LocateFixed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
// Geolocation feature commented out for testing
// Uncomment once testing is completed
// import { getCurrentPosition, formatDistance } from '@/lib/geolocation'
import { toast } from 'sonner'

const workoutTypes = [
  { id: 'strength', label: 'Strength Training', icon: Dumbbell, color: 'from-gym-primary to-green-600' },
  { id: 'hiit', label: 'HIIT / Cardio', icon: Zap, color: 'from-red-500 to-gym-accent' },
  { id: 'functional', label: 'Functional Training', icon: Flame, color: 'from-orange-500 to-red-500' },
  { id: 'sports', label: 'Sports Performance', icon: Target, color: 'from-purple-500 to-gym-secondary' },
  { id: 'recovery', label: 'Recovery / Mobility', icon: Flame, color: 'from-gym-secondary to-blue-600' },
  { id: 'other', label: 'Other', icon: Dumbbell, color: 'from-gym-text-muted to-gray-600' },
]

// Geolocation feature commented out for testing
// Uncomment once testing is completed
// Matches GET /api/checkin/gym-location response (exact coordinates are never sent to the client)
// interface GymLocation {
//   name: string
//   address: string
//   radius: number
//   allowed: boolean
// }

interface CheckinRecord {
  id: string
  date: string
  checkIn: string
  checkOut: string | null
  checkedIn?: string // ISO timestamp from /api/dashboard/checkins — used to restore the live timer
  type?: string
  duration: number
  // distance?: number // Geolocation feature commented out for testing
}

// Module-level helpers (were previously declared inside the component, and the
// `<getWorkoutType(...).icon />` JSX usages were invalid JSX and broke compilation)
function getWorkoutType(id: string) {
  return workoutTypes.find(w => w.id === id) || workoutTypes[0]
}

function WorkoutIcon({ type, className }: { type: string; className?: string }) {
  const Icon = getWorkoutType(type).icon
  return <Icon className={className} aria-hidden="true" />
}

export default function CheckinPage() {
  const { data: session } = useSession()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState('strength')
  const [checkInTime, setCheckInTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [history, setHistory] = useState<CheckinRecord[]>([])
  // Geolocation feature commented out for testing
  // Uncomment once testing is completed
  // const [locationState, setLocationState] = useState<'idle' | 'locating' | 'verified' | 'denied' | 'error'>('idle')
  // const [gymLocation, setGymLocation] = useState<GymLocation | null>(null)
  // const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  // const [distance, setDistance] = useState<number | null>(null)
  // const [lastVerified, setLastVerified] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const checkInTimestampRef = useRef<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch check-in history on mount (geolocation fetch commented out for testing)
  useEffect(() => {
    fetchHistory()
  }, [])

  // Geolocation feature commented out for testing
  // Uncomment once testing is completed
  // const fetchGymLocation = async () => {
  //   try {
  //     const res = await fetch('/api/checkin/gym-location')
  //     if (res.ok) {
  //       const data = await res.json()
  //       setGymLocation(data)
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch gym location:', error)
  //   }
  // }

  // Maximum session length: 60 minutes. Mirrors the server-side auto-close so a
  // forgotten session is capped, logged, and still counted in streaks.
  const MAX_SESSION_SECONDS = 60 * 60
  const autoStopRef = useRef(false)

  // Clear the live timer immediately (used when a session ends) so no tick can
  // fire after checkInTimestampRef has been nulled.
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Live elapsed-time timer — ticks every second while checked in
  useEffect(() => {
    if (isCheckedIn && checkInTimestampRef.current) {
      autoStopRef.current = false
      timerRef.current = setInterval(() => {
        const startedAt = checkInTimestampRef.current
        // Session ended while a timer tick was in flight (check-out / auto-checkout
        // already nulled the ref) — stop ticking instead of crashing.
        if (!startedAt) {
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          return
        }
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
        setElapsedSeconds(elapsed)
        // Auto-stop at the 60-minute cap — no dialog, the session closes itself
        if (elapsed >= MAX_SESSION_SECONDS && !autoStopRef.current) {
          autoStopRef.current = true
          autoCheckout()
        }
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isCheckedIn])

  const fetchHistory = async () => {
    try {
      // Pull a large window so the Quick Stats below can compute accurate
      // weekly/monthly totals, total time, and averages from real data.
      const res = await fetch('/api/dashboard/checkins?limit=500')
      if (res.ok) {
        setHistory(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch check-in history:', error)
    }
  }

  // Geolocation feature commented out for testing
  // Uncomment once testing is completed
  // const verifyLocation = useCallback(async () => {
  //   if (!gymLocation) return false
  //
  //   setLocationState('locating')
  //   try {
  //     const position = await getCurrentPosition()
  //     const { latitude, longitude } = position.coords
  //     setUserLocation({ lat: latitude, lon: longitude })
  //
  //     const res = await fetch('/api/checkin/verify-location', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ latitude, longitude })
  //     })
  //
  //     if (!res.ok) throw new Error('Verification failed')
  //     const data = await res.json()
  // 
  //     setDistance(data.distance)
  //     setLastVerified(new Date())
  // 
  //     if (data.allowed) {
  //       setLocationState('verified')
  //       return true
  //     } else {
  //       setLocationState('denied')
  //       return false
  //     }
  //   } catch (error) {
  //     console.error('Location verification error:', error)
  //     setLocationState('error')
  //     return false
  //   }
  // }, [gymLocation])

  // Check if user is currently checked in (restores timer after navigating away and back)
  // NOTE: history[].date is 'YYYY-MM-DD' (the API's format) — the long-format
  // formatDate() from '@/lib/utils' NEVER matched it, which silently broke restore.
  // Elapsed time is rebuilt from the ISO `checkedIn` timestamp, because the
  // formatted 12-hour `checkIn` string ("07:45 PM") is not a parseable date.
  useEffect(() => {
    if (isCheckedIn) return // fresh check-in this mount — local state is already authoritative
    const today = new Date().toISOString().split('T')[0] // same format the API emits
    const todayCheckin = history.find(c => c.date === today && !c.checkOut && c.checkedIn)
    if (todayCheckin) {
      const checkedInIso = todayCheckin.checkedIn
      if (!checkedInIso) return
      const startedAt = new Date(checkedInIso)
      if (isNaN(startedAt.getTime())) return
      setIsCheckedIn(true)
      setCheckInTime(todayCheckin.checkIn)
      if (todayCheckin.type) setSelectedWorkout(todayCheckin.type)
      checkInTimestampRef.current = startedAt
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)))
    }
  }, [history, isCheckedIn])

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedWorkout,
          checkInTime: timeString,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Check-in failed')
      }

      const newCheckin = await res.json()
      setHistory(prev => [newCheckin, ...prev])
      setIsCheckedIn(true)
      setCheckInTime(timeString)
      checkInTimestampRef.current = now
      setElapsedSeconds(0)
      toast.success("You're checked in. Have a great workout! 💪")
    } catch (error) {
      console.error('Check-in failed:', error)
      toast.error(error instanceof Error ? error.message : 'Check-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = () => {
    setShowCheckoutDialog(true)
  }

  const confirmCheckOut = async () => {
    setShowCheckoutDialog(false)
    setIsLoading(true)
    try {
      const res = await fetch('/api/checkin/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Check-out failed')
      }

      const updatedCheckin = await res.json()
      setHistory(prev => prev.map(c =>
        c.id === updatedCheckin.id ? updatedCheckin : c
      ))
      stopTimer()
      setIsCheckedIn(false)
      setCheckInTime('')
      checkInTimestampRef.current = null
      setElapsedSeconds(0)
      toast.success(`Checked out • ${updatedCheckin.duration} min session complete!`)
    } catch (error) {
      console.error('Check-out failed:', error)
      toast.error(error instanceof Error ? error.message : 'Check-out failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-stop at the 60-minute cap: closes the session without the confirm dialog,
  // mirroring the server's auto-close so the entry is kept and counted in streaks.
  const autoCheckout = async () => {
    try {
      const res = await fetch('/api/checkin/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const updatedCheckin = await res.json()
        setHistory(prev => prev.map(c =>
          c.id === updatedCheckin.id ? updatedCheckin : c
        ))
        toast.info(`Auto checked out after 60 minutes • ${updatedCheckin.duration} min logged`)
      } else {
        // Server already auto-closed this session (60-min cap enforced server-side) — resync
        fetchHistory()
        toast.info('Session auto-closed after 60 minutes')
      }
      stopTimer()
      setIsCheckedIn(false)
      setCheckInTime('')
      checkInTimestampRef.current = null
      setElapsedSeconds(0)
    } catch (error) {
      console.error('Auto check-out failed:', error)
    }
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const getDayStatus = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const checkin = history.find(c => c.date === dateStr)
    if (!checkin) return 'none'
    return checkin.checkOut ? 'completed' : 'active'
  }

  // Geolocation feature commented out for testing
  // Uncomment once testing is completed
  // const canCheckIn = locationState === 'verified' && gymLocation?.allowed
  const canCheckIn = true // Always allow check-in during testing

  // Real-time Quick Stats — computed from the fetched check-in history:
  // this week's visits, this month's visits, total workout time, and the
  // average session length (completed sessions only).
  const stats = useMemo(() => {
    const now = new Date()
    // Start of the current week (Monday midnight)
    const dayOfWeek = now.getDay()
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setHours(0, 0, 0, 0)
    weekStart.setDate(now.getDate() - daysSinceMonday)
    // Start of the current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    let weekVisits = 0
    let monthVisits = 0
    let totalMinutes = 0
    let completedMinutes = 0
    let completedSessions = 0

    for (const c of history) {
      const t = c.checkedIn ? new Date(c.checkedIn) : new Date(`${c.date}T00:00:00`)
      if (isNaN(t.getTime())) continue

      if (t >= weekStart) weekVisits++
      if (t >= monthStart && t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth()) monthVisits++

      const mins = c.duration || 0
      totalMinutes += mins
      if (mins > 0) {
        completedSessions++
        completedMinutes += mins
      }
    }

    const hours = Math.floor(totalMinutes / 60)
    const remainingMins = totalMinutes % 60
    const avgMin = completedSessions > 0 ? Math.round(completedMinutes / completedSessions) : 0

    return {
      weekVisits,
      monthVisits,
      totalTime: totalMinutes > 0 ? `${hours}h ${remainingMins}m` : '0m',
      avgMin: avgMin > 0 ? `${avgMin} min` : '—',
    }
  }, [history])

  // Format elapsed seconds into HH:MM:SS display
  const formatElapsedTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 text-gym-text">Check In</h1>
          <p className="text-gym-text-muted mt-1">Track your gym visits and workout history</p>
        </div>
        {/* Geolocation feature commented out for testing */}
        {/* Uncomment once testing is completed */}
        {/* {gymLocation && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gym-surface border border-gym-border text-sm">
            <MapPin className="h-4 w-4 text-gym-primary" />
            <span className="text-gym-text-muted">{gymLocation.name}</span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gym-bg">
              {gymLocation.radius}m check-in radius
            </span>
          </div>
        )} */}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gym-primary" />
              <span>{isCheckedIn ? 'Currently Checked In' : 'Check In to Gym'}</span>
            </CardTitle>
            <CardDescription>
              {isCheckedIn 
                ? `Checked in at ${checkInTime} • ${getWorkoutType(selectedWorkout).label}`
                : 'You must be at the gym to check in'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCheckedIn ? (
              <div className="space-y-6">
                {/* Geolocation feature commented out for testing */}
                {/* Uncomment once testing is completed */}
                {/* Location Status
                <div className="p-4 rounded-xl border bg-gym-bg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {locationState === 'locating' && (
                        <Loader2 className="h-5 w-5 text-gym-primary animate-spin" />
                      )}
                      {locationState === 'verified' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {locationState === 'denied' && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      {/* {locationState === 'error' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium text-gym-text">
                        {locationState === 'idle' && 'Click "Verify Location" to check in'}
                        {locationState === 'locating' && 'Getting your location...'}
                        {locationState === 'verified' && (
                          <>
                            <Shield className="h-4 w-4 text-green-500" />
                            <span>You're at the gym! Ready to check in.</span>
                          </>
                        )}
                        {locationState === 'denied' && (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span>You're {distance ? formatDistance(distance) : 'too far'} from the gym ({gymLocation?.radius || 30}m radius)</span>
                          </>
                        )}
                        {locationState === 'error' && 'Failed to get location. Please enable location access.'}
                      </span>
                    </div> */}
                    {/* {locationState !== 'verified' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        {/* onClick={verifyLocation} */}
                        {/* disabled={locationState === 'locating'} */}
                        {/* className="ml-auto" */}
                      {/* > */}
                        {/* {locationState === 'locating' ? ( */}
                          {/* <> */}
                            {/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
                            {/* Locating... */}
                          {/* </> */}
                        {/* ) : ( */}
                          {/* <> */}
                            {/* <LocateFixed className="mr-2 h-4 w-4" /> */}
                            {/* Verify Location */}
                          {/* </> */}
                        {/* )} */}
                      {/* </Button> */}
                    {/* )} */}
                  {/* </div> */}

                  {/* {locationState === 'verified' && distance !== null && ( */}
                    {/* <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20"> */}
                      {/* <p className="text-sm text-green-500 font-medium"> */}
                        {/* ✓ Within range • {formatDistance(distance)} from gym */}
                      {/* </p> */}
                    {/* </div> */}
                  {/* )} */}

                  {/* {locationState === 'denied' && distance !== null && ( */}
                    {/* <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"> */}
                      {/* <p className="text-sm text-yellow-500 font-medium"> */}
                        {/* ✗ {formatDistance(distance)} away • Need to be within {gymLocation?.radius || 30}m */}
                      {/* </p> */}
                    {/* </div> */}
                  {/* )} */}
                {/* </div> */}

                <div>
                  <label className="block text-sm font-medium text-gym-text mb-3">Workout Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {workoutTypes.map((workout) => (
                      <button
                        key={workout.id}
                        type="button"
                        onClick={() => setSelectedWorkout(workout.id)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          selectedWorkout === workout.id
                            ? 'border-gym-primary bg-gym-primary/10 shadow-neon-primary/20'
                            : 'border-gym-border hover:border-gym-primary/50'
                        )}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${workout.color} mb-2`}>
                          <workout.icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="font-medium text-gym-text text-sm">{workout.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full py-4 text-lg" 
                  onClick={handleCheckIn}
                  disabled={isLoading || !canCheckIn}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking In...
                    </>
                  ) : !canCheckIn ? (
                    <>
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Verify Location First
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Check In Now
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gym-primary/10 border border-gym-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-gym-primary">
                        <WorkoutIcon type={selectedWorkout} className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gym-text">Active Session</p>
                        <p className="text-sm text-gym-text-muted">Started at {checkInTime}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gym-primary text-gym-bg animate-pulse">
                      LIVE
                    </span>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-gym-bg text-center">
                  <p
                    className="font-heading font-bold text-gym-primary tabular-nums whitespace-nowrap leading-tight text-[clamp(2rem,9vw,3.5rem)]"
                    id="duration-timer"
                  >
                    {formatElapsedTime(elapsedSeconds)}
                  </p>
                  <p className="text-xs text-gym-text-muted mt-1">Duration</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-gym-bg min-w-0">
                    <p className="font-heading text-lg sm:text-xl font-bold text-gym-text truncate" title={getWorkoutType(selectedWorkout).label}>{getWorkoutType(selectedWorkout).label}</p>
                    <p className="text-xs text-gym-text-muted">Workout Type</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gym-bg min-w-0">
                    <p className="font-heading text-lg sm:text-xl font-bold text-gym-text truncate">{formatDate(new Date())}</p>
                    <p className="text-xs text-gym-text-muted">Today</p>
                  </div>
                </div>
                <Button 
                  className="w-full py-4 text-lg bg-gym-accent hover:bg-red-600" 
                  onClick={handleCheckOut}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking Out...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-5 w-5" />
                      Check Out
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gym-primary" />
              <span>This Month</span>
            </CardTitle>
            <CardDescription>Your workout calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="font-semibold text-gym-text">{monthYear}</span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs text-gym-text-muted py-2 font-medium">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(firstDayOfMonth)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1
                const status = getDayStatus(day)
                const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth()
                return (
                  <motion.div
                    key={day}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: day * 0.01 }}
                    className={cn(
                      'aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all relative',
                      isToday && 'ring-2 ring-gym-primary',
                      status === 'completed' && 'bg-gym-primary/20 text-gym-primary',
                      status === 'active' && 'bg-gym-primary text-white animate-pulse',
                      status === 'none' && 'text-gym-text-muted hover:bg-gym-bg'
                    )}
                  >
                    <span>{day}</span>
                    {status !== 'none' && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-gym-primary" />
                <span>Recent History</span>
              </CardTitle>
              <CardDescription>Your last 10 check-ins</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gym-border">
              {history.slice(0, 10).map((checkin, index) => (
                <motion.div
                  key={checkin.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-gym-bg/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gym-primary/10">
                      <WorkoutIcon type={checkin.type ?? 'other'} className="h-5 w-5 text-gym-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gym-text">{getWorkoutType(checkin.type ?? 'other').label}</p>
                      <p className="text-sm text-gym-text-muted">
                        {formatDate(checkin.date)} • {checkin.checkIn} - {checkin.checkOut || 'In progress'}
                        {/* Geolocation feature commented out for testing */}
                        {/* {checkin.distance !== undefined && (
                          <span className="ml-2 text-xs text-gym-primary">({formatDistance(checkin.distance)})</span>
                        )} */}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      checkin.checkOut 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-gym-primary/10 text-gym-primary animate-pulse'
                    )}>
                      {checkin.checkOut ? 'Completed' : 'Active'}
                    </span>
                    {checkin.duration > 0 && (
                      <span className="font-mono font-medium text-gym-text">
                        {checkin.duration} min
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" asChild>
              <a href="#">View Full History</a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-gym-primary" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="This Week" value={String(stats.weekVisits)} subtitle="visits" icon={Dumbbell} color="from-gym-primary to-green-600" />
              <StatCard label="This Month" value={String(stats.monthVisits)} subtitle="visits" icon={Calendar} color="from-gym-secondary to-blue-600" />
              <StatCard label="Total Time" value={stats.totalTime} subtitle="worked out" icon={Clock} color="from-purple-500 to-gym-secondary" />
              <StatCard label="Avg/Session" value={stats.avgMin} subtitle="per visit" icon={Zap} color="from-orange-500 to-red-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Checkout Confirmation Dialog */}
    <AnimatePresence>
      {showCheckoutDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCheckoutDialog(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-gym-surface border border-gym-border rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-gym-accent/10">
                <XCircle className="h-10 w-10 text-gym-accent" />
              </div>
              <h3 className="heading-3 text-gym-text">Done for today?</h3>
              <p className="text-gym-text-muted">
                Are you sure you want to check out? Your workout session will be logged with a duration of{' '}
                <span className="font-semibold text-gym-primary">{formatElapsedTime(elapsedSeconds)}</span>.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gym-text-muted">
                <Clock className="h-4 w-4" />
                <span>Workout: {getWorkoutType(selectedWorkout).label}</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCheckoutDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gym-accent hover:bg-red-600"
                onClick={confirmCheckOut}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Yes, Check Out
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

function StatCard({ label, value, subtitle, icon: Icon, color }: { 
  label: string; value: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; color: string 
}) {
  return (
    <div className="p-4 rounded-xl bg-gym-bg border border-gym-border">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color} mb-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="font-heading text-2xl font-bold text-gym-text">{value}</p>
      <p className="text-xs text-gym-text-muted">{label}</p>
      <p className="text-xs text-gym-text-muted">{subtitle}</p>
    </div>
  )
}