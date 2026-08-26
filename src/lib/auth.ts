import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        // A 6-digit input may be an emailed OTP (legacy resend-code flow) OR the
        // 6-digit starter password issued on enrollment - both authenticate.
        const isSixDigits = /^\d{6}$/.test(credentials.password)

        let otpMatch = false
        if (isSixDigits && user.otpCode && user.otpCode === credentials.password) {
          if (!user.otpExpires || user.otpExpires < new Date()) {
            throw new Error('Verification code has expired')
          }
          otpMatch = true
        } else {
          // Regular password login
          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (!isValid) {
            throw new Error('Invalid credentials')
          }
        }

        if (otpMatch) {
          // Mark OTP as used
          await prisma.user.update({
            where: { id: user.id },
            data: { otpCode: null, otpExpires: null },
          })

          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'EMAIL_VERIFIED',
              entity: 'User',
              entityId: user.id,
            },
          })
        }

        // First successful login with the emailed credentials activates the
        // account – receiving the welcome email proves ownership of the address,
        // so no separate OTP verification step is required.
        // Never-verified accounts are activated by their first successful login –
        // receiving the welcome email proves ownership of the address, so no
        // separate OTP verification step is required.
        if (!user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: new Date(),
              isActive: true,
              otpCode: null,
              otpExpires: null,
            },
          })

          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'ACCOUNT_ACTIVATED',
              entity: 'User',
              entityId: user.id,
            },
          })
        } else if (!user.isActive) {
          throw new Error('Your account has been deactivated. Contact support.')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          memberId: user.memberId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.memberId = (user as any).memberId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).memberId = token.memberId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}