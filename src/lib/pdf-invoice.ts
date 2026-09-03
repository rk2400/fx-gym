/**
 * FX Gym PDF invoice generator — production grade.
 *
 *  - Deterministic band layout with an explicit row cursor (no overlaps).
 *  - Real ₹ glyph via bundled Inter fonts (registered once per process), with
 *    automatic fallback to Helvetica when fonts are missing (CI / fresh clone).
 *  - India-compliant GST breakdown (CGST/SGST or IGST), SAC code, round-off.
 *  - Persisted invoice numbers come from the DB (see invoice-service.ts), the
 *    generator is a pure renderer over `InvoicePdfData`.
 */
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export interface CompanyProfile {
  name: string
  legalName: string
  tagline: string
  addressLines: string[]
  phone: string
  email: string
  website: string
  gst: {
    enabled: boolean
    ratePct: number
    mode: 'CGST_SGST' | 'IGST'
    gstin: string
    sac: string
    placeOfSupply: string
  }
  payments: { upiId: string; bankName: string; accountName: string; accountNumber: string; ifsc: string }
  invoice: { prefix: string; footerLegal: string; terms: string[] }
}

export interface InvoiceLine {
  description: string
  detail?: string
  amount: number
  /** HSN/SAC code shown per line when GST applies. */
  sac?: string
}

export type InvoiceStatus = 'PAID' | 'PENDING' | 'CANCELLED'

export interface InvoicePdfData {
  invoiceNumber: string
  issueDate: Date
  dueDate?: Date
  status: InvoiceStatus
  billing: {
    name: string
    email?: string
    memberId?: string
    phone?: string
    address?: string
  }
  lines: InvoiceLine[]
  /** GST percentage; 0 disables the tax band. */
  taxRatePct?: number
  /**
   * Final stored total. When provided, the document derives the round-off
   * paise from it instead of re-computing (keeps PDF ↔ DB in sync).
   */
  totalOverride?: number
  paymentMethod?: string
  notes?: string
  /** Marks demo/sample invoices printed on the document. */
  sample?: boolean
}

// ---------------------------------------------------------------------------
// Page geometry & palette
// ---------------------------------------------------------------------------
const PAGE_W = 595.28 // A4 points
const M = 48 // horizontal margin
const RIGHT = PAGE_W - M // right text edge (money column)
const CONTENT_W = PAGE_W - M * 2

const INK = '#111827'
const MUTED = '#6B7280'
const FAINT = '#9CA3AF'
const LINE = '#E5E7EB'
const SOFT = '#F6F8F7'
const DARK = '#0F172A'
const BRAND = '#00C853'

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  PAID: BRAND,
  PENDING: '#F59E0B',
  CANCELLED: '#EF4444',
}

// ---------------------------------------------------------------------------
// Fonts — Inter (regular + bold) with Helvetica fallback.
// ---------------------------------------------------------------------------
const FONT_DIR = path.join(process.cwd(), 'public', 'fonts')
const REGULAR = path.join(FONT_DIR, 'Inter-Regular.otf')
const BOLD = path.join(FONT_DIR, 'Inter-Bold.otf')
const HAS_FONTS = fs.existsSync(REGULAR) && fs.existsSync(BOLD)

function ensureFonts(doc: PDFKit.PDFDocument) {
  // registerFont is per-document (fonts are embedded into each PDF), so it
  // must run for every new PDFDocument — a module-level flag would break the
  // second and all subsequent requests.
  if (!HAS_FONTS) return
  doc.registerFont('Inter', REGULAR)
  doc.registerFont('Inter-Bold', BOLD)
}
function F(bold = false): string {
  if (HAS_FONTS) return bold ? 'Inter-Bold' : 'Inter'
  return bold ? 'Helvetica-Bold' : 'Helvetica'
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
const inr = (n: number): string =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Signed round-off paise between the raw amount and the settled rupee total. */
const roundOff = (raw: number, settled: number): number =>
  Math.round((settled - raw) * 100) / 100

const fmtDate = (d: Date): string =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export function computeTotals(data: InvoicePdfData) {
  const subtotal = data.lines.reduce((s, l) => s + l.amount, 0)
  const rate = data.taxRatePct ?? 0
  const tax = Math.round(((subtotal * rate) / 100) * 100) / 100
  const total = data.totalOverride ?? Math.round(subtotal + tax)
  return { subtotal, rate, tax, total, roundOffValue: roundOff(subtotal + tax, total) }
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------
export async function renderInvoicePdf(
  data: InvoicePdfData,
  company: CompanyProfile
): Promise<Uint8Array> {
  const doc = new PDFDocument({ size: 'A4', margin: 0,
    info: { Title: `Invoice ${data.invoiceNumber}`, Author: company.name,
      Subject: 'Gym membership invoice', Keywords: 'invoice, membership, gym' } })
  ensureFonts(doc)

  const chunks: Buffer[] = []
  doc.on('data', (c: Buffer) => chunks.push(c))
  const finished = new Promise<Buffer>((resolve) =>
    doc.on('end', () => resolve(Buffer.concat(chunks))))

  const { subtotal, rate, tax, total, roundOffValue } = computeTotals(data)
  const color = STATUS_COLOR[data.status]
  let y = 0

  // -- Band 1 · Header ------------------------------------------------------
  doc.rect(0, 0, PAGE_W, 6).fill(BRAND)
  doc.rect(0, 6, PAGE_W, 114).fill(DARK)

  doc.fillColor('#FFFFFF').font(F(true)).fontSize(22).text(company.name, M, 26)
  doc.font(F(false)).fontSize(8).fillColor(FAINT).text(company.tagline, M, 52)
  doc.fontSize(8.5).fillColor('#C7CDD6')
  let hy = 68
  for (const line of company.addressLines) {
    doc.text(line, M, hy, { lineBreak: false })
    hy += 12
  }
  doc.fontSize(8).fillColor(FAINT)
    .text(`${company.phone}  ·  ${company.email}  ·  ${company.website}`, M, hy + 2, { lineBreak: false })

  doc.font(F(true)).fontSize(24).fillColor('#FFFFFF')
    .text('INVOICE', RIGHT - 300, 26, { width: 300, align: 'right', lineBreak: false })
  doc.font(F(true)).fontSize(11).fillColor(BRAND)
    .text(data.invoiceNumber, RIGHT - 300, 56, { width: 300, align: 'right', lineBreak: false })
  const dateLine = `Date: ${fmtDate(data.issueDate)}${data.dueDate ? `   ·   Due: ${fmtDate(data.dueDate)}` : ''}`
  doc.font(F(false)).fontSize(8.5).fillColor(FAINT)
    .text(dateLine, RIGHT - 300, 74, { width: 300, align: 'right', lineBreak: false })

  // Status chip
  doc.font(F(true)).fontSize(10)
  const chipW = doc.widthOfString(data.status) + 18
  const chipX = RIGHT - chipW
  doc.fillColor(color)
  doc.fillOpacity(0.14)
  doc.roundedRect(chipX, 92, chipW, 19, 4).fill()
  doc.fillOpacity(1)
  doc.lineWidth(1).roundedRect(chipX, 92, chipW, 19, 4).stroke(color)
  doc.fillColor(color).text(data.status, chipX, 97, { width: chipW, align: 'center', lineBreak: false })

  if (company.gst.enabled) {
    doc.font(F(false)).fontSize(7.5).fillColor(FAINT)
      .text(`GSTIN ${company.gst.gstin}  ·  SAC ${company.gst.sac}`, M, 104, { lineBreak: false })
  }
  y = 142

  // -- Band 2 · Bill-to + summary box ---------------------------------------
  doc.font(F(true)).fontSize(8).fillColor(MUTED).text('BILL TO', M, y, { characterSpacing: 1 })
  doc.font(F(true)).fontSize(13).fillColor(INK).text(data.billing.name, M, y + 15, { lineBreak: false })

  let by = y + 34
  const billRows: string[] = []
  if (data.billing.memberId) billRows.push(`Member ID  ·  ${data.billing.memberId}`)
  if (data.billing.email) billRows.push(data.billing.email)
  if (data.billing.phone) billRows.push(data.billing.phone)
  if (data.billing.address) billRows.push(data.billing.address)
  doc.font(F(false)).fontSize(9).fillColor(MUTED)
  for (const row of billRows) {
    doc.text(row, M, by, { lineBreak: false })
    by += 13
  }

  const boxX = 356
  const boxW = RIGHT - boxX
  doc.lineWidth(1).fillColor(SOFT).roundedRect(boxX, y, boxW, 96, 6).fill()
  doc.roundedRect(boxX, y, boxW, 96, 6).stroke(LINE)

  const summaryRow = (label: string, value: string, rowY: number, bold = false, valueColor = INK) => {
    doc.font(F(bold)).fontSize(bold ? 10 : 9).fillColor(bold ? INK : MUTED)
      .text(label, boxX + 12, rowY, { lineBreak: false })
    doc.font(F(true)).fontSize(bold ? 13 : 10).fillColor(valueColor)
      .text(value, boxX + 12, rowY - (bold ? 2 : 1), { width: boxW - 24, align: 'right', lineBreak: false })
  }
  summaryRow('Amount', inr(subtotal), y + 14)
  if (rate > 0) summaryRow(`GST (${rate}%)`, inr(tax), y + 36)
  summaryRow('TOTAL', inr(total), y + 62, true, BRAND)
  doc.moveTo(boxX + 12, y + 56).lineTo(RIGHT - 12, y + 56).lineWidth(0.75).strokeColor(LINE).stroke()

  y = Math.max(by, y + 112) + 14

  // -- Band 3 · Items table --------------------------------------------------
  doc.rect(M, y, CONTENT_W, 24).fill(DARK)
  doc.font(F(true)).fontSize(8).fillColor('#FFFFFF')
  doc.text('DESCRIPTION', M + 12, y + 8, { lineBreak: false })
  if (company.gst.enabled) {
    doc.text('SAC', 356, y + 8, { width: 60, align: 'center', lineBreak: false })
  }
  doc.text('AMOUNT', RIGHT - 132, y + 8, { width: 120, align: 'right', lineBreak: false })
  y += 24

  const rowH = 40
  data.lines.forEach((line, i) => {
    if (i % 2 === 1) doc.fillColor(SOFT).rect(M, y, CONTENT_W, rowH).fill()
    doc.font(F(true)).fontSize(10).fillColor(INK)
      .text(line.description, M + 12, y + 8, { width: CONTENT_W - 200, lineBreak: false })
    if (line.detail) {
      doc.font(F(false)).fontSize(8.5).fillColor(MUTED)
        .text(line.detail, M + 12, y + 23, { width: CONTENT_W - 200, lineBreak: false })
    }
    if (company.gst.enabled) {
      doc.font(F(false)).fontSize(9).fillColor(MUTED)
        .text(line.sac ?? company.gst.sac, 356, y + 8, { width: 60, align: 'center', lineBreak: false })
    }
    doc.font(F(true)).fontSize(10).fillColor(INK)
      .text(inr(line.amount), RIGHT - 132, y + 8, { width: 120, align: 'right', lineBreak: false })
    doc.moveTo(M, y + rowH).lineTo(M + CONTENT_W, y + rowH).lineWidth(0.75).strokeColor(LINE).stroke()
    y += rowH
  })
  y += 14

  // -- Band 4 · Totals (CGST/SGST split + round-off) --------------------------
  const totalsX = RIGHT - 250
  const totalsRow = (label: string, value: string, bold = false, valueColor = INK) => {
    doc.font(F(bold)).fontSize(bold ? 11 : 9.5).fillColor(bold ? INK : MUTED)
      .text(label, totalsX, y, { lineBreak: false })
    doc.font(F(true)).fontSize(bold ? 12 : 9.5).fillColor(valueColor)
      .text(value, totalsX, y - (bold ? 1.5 : 0), { width: RIGHT - totalsX, align: 'right', lineBreak: false })
    y += bold ? 20 : 16
  }
  totalsRow('Subtotal', inr(subtotal))
  if (rate > 0) {
    if (company.gst.mode === 'IGST') {
      totalsRow(`IGST (${rate}%)`, inr(tax))
    } else {
      const half = Math.round((tax / 2) * 100) / 100
      totalsRow(`CGST (${rate / 2}%)`, inr(half))
      totalsRow(`SGST (${rate / 2}%)`, inr(Math.round((tax - half) * 100) / 100))
    }
  }
  if (Math.abs(roundOffValue) >= 0.005) {
    totalsRow('Round Off', `${roundOffValue > 0 ? '+' : '-'}${inr(Math.abs(roundOffValue)).slice(1)}`)
  }
  // Rule sits 6pt below the last row's text block, and TOTAL DUE starts 10pt
  // below the rule — previously the rule was drawn at y+2, cutting through
  // the TOTAL DUE text.
  const ruleY = y + 6
  doc.moveTo(totalsX, ruleY).lineTo(RIGHT, ruleY).lineWidth(1).strokeColor(INK).stroke()
  y = ruleY + 10
  totalsRow('TOTAL DUE', inr(total), true, BRAND)
  y += 14

  // -- Band 5 · Payment strip -------------------------------------------------
  const stripColor = color
  const stripText =
    data.status === 'PAID'
      ? `PAID IN FULL${data.paymentMethod ? ` via ${data.paymentMethod}` : ''}  ·  Thank you for staying with ${company.name}`
      : data.status === 'PENDING'
        ? company.payments.upiId
          ? `PAYMENT DUE  ·  Pay at the front desk or via UPI: ${company.payments.upiId}`
          : 'PAYMENT DUE  ·  Pay at the front desk'
        : 'CANCELLED  ·  This invoice is no longer payable'
  doc.fillColor(stripColor)
  doc.fillOpacity(0.08)
  doc.roundedRect(M, y, CONTENT_W, 32, 6).fill()
  doc.fillOpacity(1)
  doc.lineWidth(1).roundedRect(M, y, CONTENT_W, 32, 6).stroke(stripColor)
  doc.font(F(true)).fontSize(9).fillColor(stripColor)
    .text(stripText, M + 14, y + 11, { lineBreak: false })
  y += 50

  // -- Band 6 · Notes & terms -------------------------------------------------
  const notes: string[] = []
  if (data.notes) notes.push(data.notes)
  if (data.sample) notes.push('Sample invoice — generated for demonstration purposes.')
  notes.push(...company.invoice.terms)
  if (notes.length > 0) {
    doc.font(F(true)).fontSize(8).fillColor(MUTED).text('NOTES & TERMS', M, y, { characterSpacing: 1 })
    let ny = y + 14
    doc.font(F(false)).fontSize(8.5).fillColor(MUTED)
    notes.forEach((note, i) => {
      doc.text(`${i + 1}.  ${note}`, M, ny, { width: CONTENT_W - 8, lineBreak: false })
      ny += 13
    })
    y = ny + 8
  }

  // -- Band 7 · Footer ---------------------------------------------------------
  // 4 compact rows (all strings are measured to fit the printable width):
  //   1. entity · GSTIN · SAC (left)            website (right)
  //   2. full address (centred)
  //   3. phone · email (centred)
  //   4. computer-generated note (centred)
  if (y > 756) {
    // Never let content collide with the footer band.
    doc.addPage()
    y = 40
  }
  doc.moveTo(M, 792).lineTo(M + CONTENT_W, 792).lineWidth(0.75).strokeColor(LINE).stroke()

  const leftId = [company.legalName, company.gst.gstin && `GSTIN ${company.gst.gstin}`, company.gst.sac && `SAC ${company.gst.sac}`]
    .filter(Boolean)
    .join('  ·  ')
  doc.font(F(false)).fontSize(7.5).fillColor(FAINT)
    .text(leftId, M, 798, { lineBreak: false })
  if (company.website) {
    doc.font(F(false)).fontSize(7.5).fillColor(FAINT)
      .text(company.website, M, 798, { width: CONTENT_W, align: 'right', lineBreak: false })
  }

  const fullAddress = company.addressLines.join(', ')
  if (fullAddress) {
    doc.font(F(false)).fontSize(7).fillColor(FAINT)
      .text(fullAddress, M, 810, { width: CONTENT_W, align: 'center', lineBreak: false })
  }
  doc.font(F(false)).fontSize(7).fillColor(FAINT)
    .text(`${company.phone}  ·  ${company.email}`, M, 821, { width: CONTENT_W, align: 'center', lineBreak: false })
  doc.font(F(false)).fontSize(7).fillColor(FAINT)
    .text(company.invoice.footerLegal, M, 832, { width: CONTENT_W, align: 'center', lineBreak: false })

  doc.end()
  const buf = await finished
  return new Uint8Array(buf)
}

// ---------------------------------------------------------------------------
// Sample document (unauthenticated demo / no membership yet)
// ---------------------------------------------------------------------------
export function sampleInvoiceData(): InvoicePdfData {
  const now = new Date()
  const yearEnd = new Date(now.getFullYear(), 11, 31)
  return {
    invoiceNumber: 'FXINV-SAMPLE-0001',
    issueDate: now,
    dueDate: yearEnd,
    status: 'PAID',
    billing: {
      name: 'Aarav Sharma',
      memberId: 'FX-000123',
      email: 'aarav@example.com',
      phone: '+91 98200 12345',
      address: 'HSR Layout, Bengaluru 560102',
    },
    lines: [
      {
        description: 'Annual Premium Membership',
        detail: `Membership period: 1 Jan ${now.getFullYear()} – 31 Dec ${now.getFullYear()}`,
        amount: 11999,
      },
      {
        description: 'Personal Training — 12 sessions',
        detail: 'Trainer-assigned package · 1 hour per session',
        amount: 3600,
      },
    ],
    taxRatePct: 18,
    paymentMethod: 'UPI',
    sample: true,
  }
}


