import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      include: { pricingPack: true },
      orderBy: { startDate: 'desc' },
    })

    if (!membership) {
      return NextResponse.json(null)
    }

    // A membership whose endDate has fully passed is reported as EXPIRED even
    // if the DB status still says ACTIVE — keeps the UI in sync with reality.
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const effectiveStatus =
      membership.status === 'ACTIVE' && membership.endDate < startOfToday
        ? 'EXPIRED'
        : membership.status

    return NextResponse.json({
      id: membership.id,
      status: effectiveStatus,
      startDate: membership.startDate.toISOString(),
      endDate: membership.endDate.toISOString(),
      plan: {
        id: membership.pricingPack.id,
        name: membership.pricingPack.name,
        price: Number(membership.pricingPack.price),
        duration: membership.pricingPack.duration,
        description: membership.pricingPack.description,
        features: membership.pricingPack.features,
      },
    })
  } catch (error) {
    console.error('Dashboard membership GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 })
  }
}