import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGymProfile } from '@/lib/gym-config'
import { renderInvoicePdf, sampleInvoiceData, type InvoicePdfData } from '@/lib/pdf-invoice'
import {
  ensureInvoiceForMembership,
  getLatestMembershipIdForUser,
  invoiceToPdfData,
} from '@/lib/invoice-service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/invoices/pdf
 *
 * Streams a real-time PDF invoice for the signed-in member's latest
 * membership term. The invoice row is persisted on first download
 * (FXINV-YYYY-#### numbering) and reused thereafter, so the number is stable
 * across downloads. Unauthenticated / membership-less callers get a clearly
 * marked sample document.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Live admin-maintained profile (header band, footer, GST labels, UPI) —
    // picked up fresh on every download so Settings changes reflect instantly.
    const profile = await getGymProfile()
    let data: InvoicePdfData

    if (session?.user?.id) {
      const membershipId = await getLatestMembershipIdForUser(session.user.id)
      if (membershipId) {
        const invoice = await ensureInvoiceForMembership(membershipId)
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            name: true,
            email: true,
            memberId: true,
            phone: true,
            address: true,
          },
        })
        data = user ? invoiceToPdfData(invoice, user, profile) : sampleInvoiceData()
      } else {
        data = sampleInvoiceData()
      }
    } else {
      data = sampleInvoiceData()
    }

    const pdf = await renderInvoicePdf(data, profile)
    const filename = data.sample
      ? 'FX-Gym-Sample-Invoice.pdf'
      : `FX-Gym-Invoice-${data.invoiceNumber}.pdf`

    // Next's BodyInit typing predates typed-array generics — safe cast, the
    // bytes are a plain ArrayBufferView.
    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdf.byteLength),
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Invoice PDF GET error:', error)
    return NextResponse.json({ error: 'Failed to generate invoice PDF' }, { status: 500 })
  }
}
