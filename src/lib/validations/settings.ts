import { z } from 'zod'

/**
 * Gym business profile maintained from Admin → Settings. Printed on every
 * invoice: header band (name/address/contact), footer (address, contact,
 * GSTIN · SAC), GST breakdown and PENDING payment strip (UPI).
 */
export const gymSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Gym name is required').max(60),
  legalName: z.string().trim().min(2, 'Legal name is required').max(120),
  tagline: z.string().trim().max(120).default(''),
  addressLine1: z.string().trim().min(4, 'Address line 1 is required').max(160),
  addressLine2: z.string().trim().max(160).default(''),
  phone: z.string().trim().min(6, 'Phone is required').max(24),
  email: z.string().trim().email('Enter a valid email').max(120),
  website: z.string().trim().max(120).default(''),
  gstEnabled: z.boolean().default(true),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .max(15)
    .default('')
    .refine((v) => v === '' || /^[0-9A-Z]{15}$/.test(v), 'GSTIN must be exactly 15 letters/digits'),
  sac: z.string().trim().max(10).default(''),
  gstRatePct: z.coerce.number().min(0, 'Rate cannot be negative').max(100).default(18),
  gstMode: z.enum(['CGST_SGST', 'IGST']).default('CGST_SGST'),
  placeOfSupply: z.string().trim().max(60).default(''),
  upiId: z.string().trim().max(60).default(''),
  invoiceFooterNote: z
    .string()
    .trim()
    .max(250)
    .default('This is a computer generated invoice and does not require a physical signature.'),
  invoiceTerms: z.string().max(1500).default(''),
})

export type GymSettingsInput = z.infer<typeof gymSettingsSchema>
