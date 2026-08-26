import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || ((session.user as any).role !== 'TRAINER' && (session.user as any).role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const trainerId = (session.user as any).id

    const where: any = {
      assignedTrainerId: trainerId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.memberships = {
        some: { status }
      }
    }

    const clients = await prisma.user.findMany({
      where,
      include: {
        memberships: {
          where: { status: { in: ['ACTIVE', 'PENDING'] } },
          include: { pricingPack: true },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
        checkins: {
          orderBy: { checkedIn: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' }
    })

    const formattedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      memberId: client.memberId,
      assignedTrainerId: client.assignedTrainerId,
      membership: client.memberships[0] ? {
        id: client.memberships[0].id,
        pricingPack: { name: client.memberships[0].pricingPack.name },
        status: client.memberships[0].status,
        endDate: client.memberships[0].endDate.toISOString(),
      } : null,
      _count: {
        checkins: client.checkins.length,
      },
      lastCheckin: client.checkins[0]?.checkedIn.toISOString() || null,
      goals: null, // Could be added later
    }))

    return NextResponse.json({ clients: formattedClients })
  } catch (error) {
    console.error('Trainer clients GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}