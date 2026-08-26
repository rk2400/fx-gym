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

    const body = await request.json()
    const { latitude, longitude } = body

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    // Get active gym location
    const gym = await prisma.gymLocation.findFirst({
      where: { isActive: true }
    })

    if (!gym) {
      return NextResponse.json({ error: 'Gym location not configured' }, { status: 500 })
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      gym.latitude,
      gym.longitude
    )

    const allowed = distance <= gym.radiusMeters

    return NextResponse.json({
      allowed,
      distance: Math.round(distance),
      radius: gym.radiusMeters,
      gym: {
        name: gym.name,
        address: gym.address
      }
    })
  } catch (error) {
    console.error('Location verification error:', error)
    return NextResponse.json({ error: 'Failed to verify location' }, { status: 500 })
  }
}