import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Run all independent queries concurrently against the main client.
    // (Avoid interactive transactions on Neon serverless — their 5s default
    // timeout is too short for multiple round-trips.)
    const [
      roleCounts,
      newMembersThisMonth,
      activeTrainers,
      totalTrainers,
      activeMemberships,
      newSubscriptionsThisMonth,
      checkinsToday,
      checkinsYesterday,
      recentUsers,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.user.count({ where: { role: 'MEMBER', createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { role: 'TRAINER', isActive: true } }),
      prisma.user.count({ where: { role: 'TRAINER' } }),
      prisma.membership.findMany({
        where: { status: 'ACTIVE' },
        select: { pricingPack: { select: { price: true } } },
      }),
      prisma.membership.count({ where: { startDate: { gte: monthStart } } }),
      prisma.checkin.count({ where: { checkedIn: { gte: todayStart } } }),
      prisma.checkin.count({
        where: { checkedIn: { gte: yesterdayStart, lt: todayStart } },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          memberId: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
    ])

    const memberCount = roleCounts.find((r) => r.role === 'MEMBER')?._count._all ?? 0
    const trainerCount = roleCounts.find((r) => r.role === 'TRAINER')?._count._all ?? 0
    const adminCount = roleCounts.find((r) => r.role === 'ADMIN')?._count._all ?? 0

    const monthlyRevenue = activeMemberships.reduce(
      (sum, m) => sum + Number(m.pricingPack.price),
      0
    )

    return NextResponse.json({
      totalMembers: memberCount,
      newMembersThisMonth,
      activeTrainers,
      totalTrainers,
      monthlyRevenue,
      newSubscriptionsThisMonth,
      checkinsToday,
      checkinsYesterday,
      roleDistribution: [
        { role: 'MEMBER', count: memberCount },
        { role: 'TRAINER', count: trainerCount },
        { role: 'ADMIN', count: adminCount },
      ],
      recentUsers,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Admin stats GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}