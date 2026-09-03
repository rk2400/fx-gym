import { Prisma, type Invoice as DbInvoice } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { GYM, getGymProfile } from './gym-config'
import type { CompanyProfile, InvoicePdfData } from './pdf-invoice'

/** Indian-format date used across invoice documents. */
export function fmtInvoiceDate(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

/** Sequential, zero-padded invoice number for the current year. */
async function nextInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `${GYM.invoice.prefix}-${year}-`
  const last = await tx.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true },
  })
  const lastSeq = last ? parseInt(last.invoiceNumber.slice(prefix.length), 10) || 0 : 0
  return `${prefix}${String(lastSeq + 1).padStart(4, '0')}`
}

/**
 * Returns the persisted invoice for a membership term, creating it on first
 * use. Numbers are computed from the current max — retried on the rare
 * unique-constraint race when two invoices are created at the same moment.
 */
export async function ensureInvoiceForMembership(membershipId: string): Promise<DbInvoice> {
  const existing = await prisma.invoice.findFirst({
    where: { membershipId },
    orderBy: { issueDate: 'desc' },
  })
  if (existing) return existing

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { pricingPack: true, user: true },
  })
  if (!membership) throw new Error(`Membership ${membershipId} not found`)

  // GST settings are snapshotted from the admin-maintained profile at issue
  // time — the row (and its totals) then stay immutable, as invoices should.
  const profile = await getGymProfile()
  const subtotal = Number(membership.pricingPack.price)
  const taxRatePct = profile.gst.enabled ? profile.gst.ratePct : 0
  const taxAmount = Math.round(((subtotal * taxRatePct) / 100) * 100) / 100
  // Indian invoices settle the final total to a whole rupee; the PDF prints
  // the paise difference as an explicit "Round Off" line.
  const total = Math.round(subtotal + taxAmount)
  const status =
    membership.status === 'PENDING'
      ? 'PENDING'
      : membership.status === 'CANCELLED'
        ? 'CANCELLED'
        : 'PAID'

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const invoiceNumber = await nextInvoiceNumber(tx)
        return tx.invoice.create({
          data: {
            invoiceNumber,
            userId: membership.userId,
            membershipId: membership.id,
            planName: membership.pricingPack.name,
            issueDate: new Date(),
            periodStart: membership.startDate,
            periodEnd: membership.endDate,
            subtotal,
            taxRatePct,
            taxAmount,
            total,
            status,
          },
        })
      })
    } catch (err) {
      const target = (err as { meta?: { target?: string[] } })?.meta?.target
      const isNumberRace =
        (err as { code?: string })?.code === 'P2002' &&
        Array.isArray(target) &&
        target.includes('invoiceNumber')
      if (!isNumberRace || attempt === 4) throw err
    }
  }
  throw new Error('Could not allocate an invoice number')
}

/** Latest ACTIVE/PENDING membership for a user (falls back to most recent). */
export async function getLatestMembershipIdForUser(userId: string): Promise<string | null> {
  const live = await prisma.membership.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'PENDING'] } },
    orderBy: { startDate: 'desc' },
    select: { id: true },
  })
  if (live) return live.id
  const any = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { startDate: 'desc' },
    select: { id: true },
  })
  return any?.id ?? null
}

export async function listUserInvoices(userId: string): Promise<DbInvoice[]> {
  return prisma.invoice.findMany({
    where: { userId },
    orderBy: { issueDate: 'desc' },
    take: 50,
  })
}

/** Maps a persisted Invoice (+ its user) onto the PDF document shape. */
export function invoiceToPdfData(
  invoice: DbInvoice,
  user: {
    name?: string | null
    email?: string | null
    memberId?: string | null
    phone?: string | null
    address?: string | null
  },
  profile: CompanyProfile = GYM
): InvoicePdfData {
  const period =
    invoice.periodStart && invoice.periodEnd
      ? `${fmtInvoiceDate(invoice.periodStart)} – ${fmtInvoiceDate(invoice.periodEnd)}`
      : 'Gym membership'

  return {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.periodEnd ?? undefined,
    status: (invoice.status as InvoicePdfData['status']) ?? 'PAID',
    billing: {
      name: user.name || 'Member',
      email: user.email || '',
      memberId: user.memberId ?? undefined,
      phone: user.phone ?? undefined,
      address: user.address ?? undefined,
    },
    lines: [
      {
        description: invoice.planName,
        detail: `Membership period: ${period}`,
        amount: Number(invoice.subtotal),
        sac: profile.gst.enabled ? profile.gst.sac : undefined,
      },
    ],
    taxRatePct: Number(invoice.taxRatePct),
    totalOverride: Number(invoice.total),
    paymentMethod: invoice.paymentMethod ?? undefined,
    notes: invoice.notes ?? undefined,
  }
}
