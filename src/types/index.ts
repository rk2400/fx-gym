import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'MEMBER' | 'TRAINER'
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: 'ADMIN' | 'MEMBER' | 'TRAINER'
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: 'ADMIN' | 'MEMBER' | 'TRAINER'
    accessToken?: string
    provider?: string
  }
}

export interface Service {
  id: string
  name: string
  description: string
  icon: string
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface PricingPack {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  duration: number
  features: string[]
  isPopular: boolean
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Membership {
  id: string
  userId: string
  pricingPackId: string
  pricingPack: PricingPack
  startDate: Date
  endDate: Date
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
  stripeSubId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Checkin {
  id: string
  userId: string
  checkedIn: Date
  checkedOut: Date | null
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  isRead: boolean
  createdAt: Date
}

export interface SiteContent {
  id: string
  key: string
  value: string
  type: 'TEXT' | 'HTML' | 'JSON' | 'MARKDOWN'
  createdAt: Date
  updatedAt: Date
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface FooterLink {
  label: string
  href: string
}

export interface SocialLink {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}