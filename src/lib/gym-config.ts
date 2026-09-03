/**
 * Central FX Gym business profile.
 *
 * `GYM` holds the built-in defaults (used on first boot, before any admin
 * saves settings). `getGymProfile()` returns the admin-maintained profile
 * from the GymSettings singleton, falling back to GYM when no row exists or
 * the table is missing. Invoices (header, footer, GST math, payment strips)
 * all read through getGymProfile().
 */
import { prisma } from '@/lib/prisma'
import type { CompanyProfile } from './pdf-invoice'

export const GYM: CompanyProfile = {
  name: 'FX GYM',
  legalName: 'FX Fitness Ventures',
  tagline: 'POWER • PERFORMANCE • PROGRESS',
  addressLines: ['Plot 21, 100 Ft Road, Indiranagar', 'Bengaluru, Karnataka 560038'],
  phone: '+91 98765 43210',
  email: 'billing@fxgym.com',
  website: 'www.fxgym.com',

  gst: {
    enabled: true,
    ratePct: 18,
    /** CGST_SGST = intra-state supply; IGST = inter-state. */
    mode: 'CGST_SGST' as 'CGST_SGST' | 'IGST',
    gstin: '29ABCDE1234F1Z5',
    /** SAC 999723 — Physical well-being services (gyms & fitness centres). */
    sac: '999723',
    placeOfSupply: 'Karnataka (29)',
  },

  payments: {
    upiId: 'fxgym@upi',
    bankName: 'HDFC Bank',
    accountName: 'FX Fitness Ventures',
    accountNumber: '50100XXXXXX4421',
    ifsc: 'HDFC0001234',
  },

  invoice: {
    prefix: 'FXINV',
    footerLegal:
      'This is a computer generated invoice and does not require a physical signature.',
    terms: [
      'Membership fees, once paid, are non-refundable and non-transferable.',
      'Memberships may be frozen up to 15 days per billing period with prior notice.',
      'Gym timings, rules and class schedules are subject to change as notified.',
    ],
  },
}

/** Form-shaped defaults for the admin settings API when nothing is persisted. */
export function defaultSettingsForm() {
  return {
    name: GYM.name,
    legalName: GYM.legalName,
    tagline: GYM.tagline,
    addressLine1: GYM.addressLines[0] ?? '',
    addressLine2: GYM.addressLines[1] ?? '',
    phone: GYM.phone,
    email: GYM.email,
    website: GYM.website,
    gstEnabled: GYM.gst.enabled,
    gstin: GYM.gst.gstin,
    sac: GYM.gst.sac,
    gstRatePct: GYM.gst.ratePct,
    gstMode: GYM.gst.mode,
    placeOfSupply: GYM.gst.placeOfSupply,
    upiId: GYM.payments.upiId,
    invoiceFooterNote: GYM.invoice.footerLegal,
    invoiceTerms: GYM.invoice.terms.join('\n'),
  }
}

/**
 * Admin-maintained gym profile. One DB read per invoice render — invoices are
 * infrequent, and reading live guarantees the dashboard "save" takes effect
 * on the very next download.
 */
export async function getGymProfile(): Promise<CompanyProfile> {
  try {
    const row = await prisma.gymSettings.findUnique({ where: { id: 'singleton' } })
    if (!row) return GYM
    return {
      name: row.name,
      legalName: row.legalName,
      tagline: row.tagline,
      addressLines: [row.addressLine1, row.addressLine2].filter(Boolean),
      phone: row.phone,
      email: row.email,
      website: row.website,
      gst: {
        enabled: row.gstEnabled,
        ratePct: Number(row.gstRatePct),
        mode: row.gstMode === 'IGST' ? 'IGST' : 'CGST_SGST',
        gstin: row.gstin,
        sac: row.sac,
        placeOfSupply: row.placeOfSupply,
      },
      payments: {
        upiId: row.upiId,
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifsc: '',
      },
      invoice: {
        prefix: GYM.invoice.prefix,
        footerLegal: row.invoiceFooterNote,
        terms: row.invoiceTerms
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
      },
    }
  } catch {
    // Table not migrated yet (fresh DB) → built-in defaults.
    return GYM
  }
}

