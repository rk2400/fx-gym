import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainers = await prisma.user.findMany({
      where: { role: 'TRAINER', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ trainers })
  } catch (error) {
    console.error('Admin trainers GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch trainers' }, { status: 500 })
  }
}