import { z } from 'zod'

// Indian numbers only: exactly 10 digits (e.g. 9876543210). No other validation.
const phoneRegex = /^\d{10}$/

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || phoneRegex.test(val), 'Invalid phone number'),
  weightKg: z
    .union([z.coerce.number().positive('Weight must be positive').max(500, 'Weight seems too high'), z.literal(''), z.null()])
    .optional()
    .nullable(),
  heightCm: z
    .union([z.coerce.number().positive('Height must be positive').max(300, 'Height seems too high'), z.literal(''), z.null()])
    .optional()
    .nullable(),
  emergencyContactName: z.string().trim().max(100).optional().nullable(),
  emergencyContactPhone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || phoneRegex.test(val), 'Invalid phone number'),
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