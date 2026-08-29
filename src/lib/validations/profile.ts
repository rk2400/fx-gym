import { z } from 'zod'

/**
 * Normalize any Indian phone format to bare 10 digits:
 * "+91 98765 43210" → "9876543210" · "09876543210" → "9876543210"
 * "+91-9876543210" → "9876543210" · "98765 43210" → "9876543210"
 * Returns "" for empty/whitespace input.
 */
export function normalizeIndianPhone(value: string | null | undefined): string {
  if (!value) return ''
  let digits = value.replace(/\D/g, '')
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

// Indian numbers only: exactly 10 digits after normalization. Empty/garbage → null (cleared).
const phoneRegex = /^\d{10}$/

const phoneField = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((val) => (!val ? null : normalizeIndianPhone(val) || null))
  .refine((val) => val == null || phoneRegex.test(val), 'Invalid phone number')

export const profileSchema = z.object({
  // Optional so image-only updates (PATCH-style { image }) don't require the whole form;
  // Prisma skips undefined fields, so absent name = untouched.
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: phoneField,
  weightKg: z
    .union([z.coerce.number().positive('Weight must be positive').max(500, 'Weight seems too high'), z.literal(''), z.null()])
    .optional()
    .nullable(),
  heightCm: z
    .union([z.coerce.number().positive('Height must be positive').max(300, 'Height seems too high'), z.literal(''), z.null()])
    .optional()
    .nullable(),
  emergencyContactName: z.string().trim().max(100).optional().nullable(),
  emergencyContactPhone: phoneField,
  address: z.string().trim().max(500).optional().nullable(),
  image: z
    .string()
    .trim()
    .max(2_000_000, 'Image is too large')
    .refine(
      (val) =>
        !val ||
        /^https?:\/\//.test(val) ||
        /^data:image\/(png|jpe?g|webp|gif);base64,/.test(val),
      'Image must be a URL or a base64-encoded image'
    )
    .optional()
    .nullable(),
})

export type ProfileInput = z.infer<typeof profileSchema>