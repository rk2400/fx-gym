import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/geolocation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { type, checkInTime, latitude, longitude } = body

    if (!type) {
      return NextResponse.json({ error: 'Workout type is required' }, { status: 400 })
    }

    // Verify location if provided
    let distance: number | null = null
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const gym = await prisma.gymLocation.findFirst({
        where: { isActive: true }
      })

      if (gym) {
        distance = calculateDistance(latitude, longitude, gym.latitude, gym.longitude)
        
        // Server-side enforcement
        if (distance > gym.radiusMeters) {
          return NextResponse.json({ 
            error: 'You are too far from the gym to check in',
            distance: Math.round(distance),
            radius: gym.radiusMeters
          }, { status: 400 })
        }
      }
    }

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingCheckin = await prisma.checkin.findFirst({
      where: {
        userId,
        checkedIn: {
          gte: today,
          lt: tomorrow
        },
        checkedOut: null
      }
    })

    if (existingCheckin) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 400 })
    }

    const checkin = await prisma.checkin.create({
      data: {
        userId,
        checkedIn: new Date(),
        // Store location data for reference
      }
    })

    return NextResponse.json({
      id: checkin.id,
      date: formatDate(checkin.checkedIn),
      checkIn: checkin.checkedIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      checkOut: null,
      type,
      duration: 0,
      distance: distance ? Math.round(distance) : undefined
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 })
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}