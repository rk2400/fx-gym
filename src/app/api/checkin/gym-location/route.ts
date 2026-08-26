import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const gym = await prisma.gymLocation.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        radiusMeters: true
      }
    })

    if (!gym) {
      return NextResponse.json({ error: 'Gym location not configured' }, { status: 404 })
    }

    return NextResponse.json({
      name: gym.name,
      address: gym.address,
      radius: gym.radiusMeters,
      // Don't expose exact coordinates to client
      allowed: true // Will be verified server-side
    })
  } catch (error) {
    console.error('Gym location fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch gym location' }, { status: 500 })
  }
}