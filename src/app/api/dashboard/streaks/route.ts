import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get all check-ins for this user
    const checkins = await prisma.checkin.findMany({
      where: { userId },
      orderBy: { checkedIn: 'asc' },
    })

    if (checkins.length === 0) {
      return NextResponse.json({
        current: 0,
        longest: 0,
        thisWeek: 0,
        thisMonth: 0,
        totalCheckins: 0,
      })
    }

    // Calculate streaks
    const dates = checkins
      .filter(c => c.checkedOut)
      .map(c => new Date(c.checkedIn).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    // Check if worked out today or yesterday
    const hasToday = dates.includes(today)
    const hasYesterday = dates.includes(yesterday)

    if (hasToday || hasYesterday) {
      // Calculate current streak
      let checkDate = hasToday ? today : yesterday
      currentStreak = 1
      
      for (let i = dates.length - 1; i > 0; i--) {
        const current = new Date(dates[i]).getTime()
        const prev = new Date(dates[i - 1]).getTime()
        const diffDays = Math.round((current - prev) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentStreak++
        } else {
          break
        }
      }
    } else {
      currentStreak = 0
    }

    // Calculate longest streak
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const current = new Date(dates[i]).getTime()
        const prev = new Date(dates[i - 1]).getTime()
        const diffDays = Math.round((current - prev) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          tempStreak++
        } else {
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    // This week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const thisWeek = dates.filter(d => new Date(d) >= weekStart).length

    // This month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const thisMonth = dates.filter(d => new Date(d) >= monthStart).length

    return NextResponse.json({
      current: currentStreak,
      longest: longestStreak,
      thisWeek,
      thisMonth,
      totalCheckins: checkins.length,
    })
  } catch (error) {
    console.error('Dashboard streaks GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 })
  }
}