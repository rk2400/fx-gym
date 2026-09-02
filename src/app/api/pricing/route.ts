import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Never statically cache: plan edits/deletes from the admin panel must show up
// on the public site immediately.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pricingPacks = await prisma.pricingPack.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(pricingPacks)
  } catch (error) {
    console.error('Pricing API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}