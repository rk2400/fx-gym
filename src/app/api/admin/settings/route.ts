import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { defaultSettingsForm } from '@/lib/gym-config'
import { gymSettingsSchema } from '@/lib/validations/settings'
import type { GymSettings } from '@prisma/client'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return null
  return session
}

type SettingsForm = ReturnType<typeof defaultSettingsForm>

/** Maps the DB row onto the form shape (Decimal → number for the client). */
function rowToForm(row: GymSettings): SettingsForm {
  return {
    name: row.name,
    legalName: row.legalName,
    tagline: row.tagline,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    phone: row.phone,
    email: row.email,
    website: row.website,
    gstEnabled: row.gstEnabled,
    gstin: row.gstin,
    sac: row.sac,
    gstRatePct: Number(row.gstRatePct),
    gstMode: row.gstMode === 'IGST' ? 'IGST' : 'CGST_SGST',
    placeOfSupply: row.placeOfSupply,
    upiId: row.upiId,
    invoiceFooterNote: row.invoiceFooterNote,
    invoiceTerms: row.invoiceTerms,
  }
}

/** GET — effective profile (persisted row, or built-in defaults pre-first-save). */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const row = await prisma.gymSettings.findUnique({ where: { id: 'singleton' } })
    return NextResponse.json({
      settings: row ? rowToForm(row) : defaultSettingsForm(),
      persisted: Boolean(row),
      updatedAt: row?.updatedAt.toISOString() ?? null,
    })
  } catch (error) {
    console.error('Admin settings GET error:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

/** PUT — upserts the singleton; takes effect on the next invoice download. */
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = gymSettingsSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid data' },
        { status: 400 }
      )
    }

    const { id: _ignored, ...data } = parsed.data as typeof parsed.data & { id?: string }
    const row = await prisma.gymSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    })

    return NextResponse.json({ settings: rowToForm(row), persisted: true })
  } catch (error) {
    console.error('Admin settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
