import { prisma } from '@/lib/prisma'

/**
 * Maximum length of a single check-in session, in minutes.
 * Forgotten open sessions are automatically closed at exactly this
 * duration so history and streaks always reflect final, truthful data.
 */
export const MAX_SESSION_MINUTES = 60

/**
 * Lazy auto-close for serverless (there is no cron worker): every API path
 * that reads or writes check-ins first closes open sessions running longer
 * than MAX_SESSION_MINUTES. The session is checked out at
 * `checkedIn + MAX_SESSION_MINUTES` — not "now" — so the recorded duration
 * is exactly the cap, keeping workout history and day-streaks honest.
 */
export async function autoCloseStaleSessions(userId?: string): Promise<void> {
  const cutoff = new Date(Date.now() - MAX_SESSION_MINUTES * 60 * 1000)

  const stale = await prisma.checkin.findMany({
    where: {
      checkedOut: null,
      checkedIn: { lt: cutoff },
      ...(userId ? { userId } : {}),
    },
    select: { id: true, checkedIn: true },
  })

  if (stale.length === 0) return

  await prisma.$transaction(
    stale.map((s) =>
      prisma.checkin.update({
        where: { id: s.id },
        data: {
          checkedOut: new Date(s.checkedIn.getTime() + MAX_SESSION_MINUTES * 60 * 1000),
        },
      })
    )
  )
}
