'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrice } from '@/lib/utils'

interface MembershipData {
  id: string
  status: string
  startDate: string
  endDate: string
  plan: {
    id: string
    name: string
    price: number
    duration: number
    description: string | null
    features: string[]
  }
}

interface PackOption {
  id: string
  name: string
  price: number
  duration: number
}

function periodLabel(durationDays: number): string {
  if (durationDays <= 31) return 'month'
  if (durationDays <= 93) return '3 months'
  if (durationDays <= 184) return '6 months'
  return 'year'
}

export default function MembershipPage() {
  const [loading, setLoading] = useState(true)
  const [membership, setMembership] = useState<MembershipData | null>(null)
  const [packs, setPacks] = useState<PackOption[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/dashboard/membership').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/pricing').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([mem, pricing]) => {
        if (cancelled) return
        setMembership(mem && mem.id ? mem : null)
        if (Array.isArray(pricing)) {
          setPacks(pricing.map((p: any) => ({ id: p.id, name: p.name, price: Number(p.price), duration: p.duration })))
        }
      })
      .catch(() => !cancelled && toastError())
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gym-primary" aria-label="Loading membership" />
      </div>
    )
  }

  // Calendar-days remaining, inclusive of the plan's last valid day.
  // endDate counts as valid through the END of that day (23:59:59.999),
  // so a plan ending today still shows 1 day remaining — not 0.
  let daysRemaining = 0
  if (membership) {
    const end = new Date(membership.endDate)
    end.setHours(23, 59, 59, 999)
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    daysRemaining = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="heading-2 text-gym-text">Membership</h1>
          <p className="text-gym-text-muted mt-1">Your plan, dates and benefits</p>
        </div>
      </motion.div>

      {!membership ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gym-surface border-gym-border">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-6 inline-flex rounded-full bg-gym-warning/10 p-4">
                <AlertCircle className="h-10 w-10 text-gym-warning" aria-hidden="true" />
              </div>
              <h2 className="heading-3 text-gym-text mb-2">No Active Membership</h2>
              <p className="text-gym-text-muted max-w-md mx-auto mb-6">
                You don't have an active membership right now. Contact the front desk or pick a plan
                below – the team will activate it for you.
              </p>
              <Button asChild>
                <Link href="/pricing">View Membership Plans</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Current plan card with real dates */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gym-surface border-gym-border overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-gym-primary to-green-600">
                      <CreditCard className="h-8 w-8 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="heading-3 text-gym-text">{membership.plan.name}</h2>
                        <Badge variant="success" className="capitalize">{membership.status.toLowerCase()}</Badge>
                      </div>
                      <p className="text-gym-text-muted mt-1">
                        {formatPrice(membership.plan.price)} / {periodLabel(membership.plan.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center p-4 rounded-xl bg-gym-bg border border-gym-border">
                      <p className="font-heading text-3xl font-bold text-gym-primary">{daysRemaining}</p>
                      <p className="text-sm text-gym-text-muted">Days Remaining</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gym-bg border border-gym-border">
                      <p className="font-heading text-lg font-bold text-gym-text whitespace-nowrap">{formatDate(membership.endDate)}</p>
                      <p className="text-sm text-gym-text-muted">Valid Until</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gym-border p-6 bg-gym-bg/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-sm text-gym-text-muted">
                    <Calendar className="h-4 w-4 text-gym-primary" aria-hidden="true" />
                    <span>Started {formatDate(membership.startDate)}</span>
                  </div>
                  {membership.status === 'PENDING' && (
                    <div className="flex items-center space-x-2 text-sm text-gym-warning">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <span>Awaiting activation</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Plan features */}
          {membership.plan.features.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="heading-3 text-gym-text mb-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                <span>Included in Your Plan</span>
              </h2>
              <div className="space-y-3">
                {membership.plan.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.03 }}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-gym-surface border border-gym-border"
                  >
                    <CheckCircle className="h-5 w-5 text-gym-primary shrink-0" aria-hidden="true" />
                    <span className="text-gym-text">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Available plans (live from pricing API) */}
      {packs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="heading-3 text-gym-text mb-4">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {packs.map((plan, index) => {
              const isCurrent = membership?.plan.id === plan.id
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`relative p-6 rounded-2xl bg-gym-surface border ${
                    isCurrent
                      ? 'border-gym-primary ring-2 ring-gym-primary/20'
                      : 'border-gym-border hover:border-gym-primary/50'
                  }`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gym-primary text-gym-bg">
                      Current Plan
                    </Badge>
                  )}
                  <div className="mb-4">
                    <h3 className="heading-4 text-gym-text mb-1">{plan.name}</h3>
                    <div className="flex items-baseline space-x-2">
                      <span className="font-heading text-3xl font-bold text-gym-text">{formatPrice(plan.price)}</span>
                      <span className="text-sm text-gym-text-muted">/ {periodLabel(plan.duration)}</span>
                    </div>
                  </div>
                  {isCurrent ? (
                    <Button className="w-full" variant="outline" disabled>
                      Your Current Plan
                    </Button>
                  ) : (
                    <p className="text-xs text-gym-text-muted text-center py-2 border border-gym-border rounded-lg bg-gym-bg/50">
                      To switch plans, contact the front desk or an admin
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
          <p className="text-xs text-gym-text-muted mt-4 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            Plan changes are handled by gym staff so your billing dates stay accurate.
          </p>
        </motion.div>
      )}
    </div>
  )
}

function toastError() {
  import('sonner').then(({ toast }) => toast.error('Could not load your membership'))
}