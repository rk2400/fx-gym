'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronRight, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface DisplayPack {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  features: string[]
  popular: boolean
}

const FALLBACK_PACKS: DisplayPack[] = [
  {
    id: 'monthly', name: 'Monthly Membership',
    description: 'Perfect for getting started or short-term goals. No commitment, cancel anytime.',
    price: 3000, duration: 30,
    features: ['24/7 Gym Access', 'All Group Classes', 'Strength & Cardio Zones', 'Functional Training Area', 'Locker Rooms & Showers', 'Free WiFi'],
    popular: false,
  },
  {
    id: 'quarterly', name: '3 Month Membership',
    description: 'Commit to three months and save Rs 3000 vs going month to month.',
    price: 6000, duration: 90,
    features: ['Everything in Monthly Membership', 'Save Rs 3000 vs monthly', 'Free Fitness Assessment', 'Priority Class Booking (48hrs)', 'Monthly Body Composition Scan', 'Nutrition Guide Access'],
    popular: true,
  },
  {
    id: 'semiannual', name: '6 Month Membership',
    description: 'Half-year commitment with serious savings – Rs 6000 saved vs monthly billing.',
    price: 12000, duration: 180,
    features: ['Everything in 3 Month Membership', 'Save Rs 6000 vs monthly billing', 'Quarterly Body Composition Scan', 'Personalized Program Review', 'Guest Passes Included'],
    popular: false,
  },
  {
    id: 'annual', name: '12 Month Membership',
    description: 'Best value for the committed – Rs 18000 saved vs monthly billing.',
    price: 18000, duration: 365,
    features: ['Everything in 6 Month Membership', 'Biggest savings vs monthly billing', 'Unlimited Guest Passes', 'Quarterly PT Session (4x/year)', 'Premium Recovery Access', 'Exclusive Member Events', 'Lifetime Price Lock Guarantee'],
    popular: false,
  },
]

function periodLabel(durationDays: number): string {
  if (durationDays <= 31) return 'month'
  if (durationDays <= 93) return '3 months'
  if (durationDays <= 184) return '6 months'
  return 'year'
}

export function PricingSection() {
  const [packs, setPacks] = useState<DisplayPack[]>(FALLBACK_PACKS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/pricing')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setPacks(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description ?? null,
            price: Number(p.price),
            duration: p.duration,
            features: p.features ?? [],
            popular: !!p.isPopular,
          })))
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  return (
    <section className="section" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gym-primary" aria-label="Loading plans" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {packs.map((pack, index) => (
              <motion.article
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className={`relative flex flex-col rounded-2xl border bg-gym-surface p-6 ${
                  pack.popular
                    ? 'shadow-neon-primary/30 border-gym-primary ring-2 ring-gym-primary/20'
                    : 'border-gym-border hover:border-gym-primary/50'
                } transition-all duration-300`}
              >
                {pack.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gym-primary text-gym-bg">
                    Most Popular
                  </Badge>
                )}

                <h3 className="heading-4 text-gym-text mb-2">{pack.name}</h3>
                {pack.description && (
                  <p className="text-sm text-gym-text-muted mb-4">{pack.description}</p>
                )}

                <div className="mb-6">
                  <span className="font-heading text-4xl font-bold text-gym-text">
                    {formatPrice(pack.price)}
                  </span>
                  <span className="text-sm text-gym-text-muted"> / {periodLabel(pack.duration)}</span>
                </div>

                <ul className="mb-8 space-y-3 flex-1" role="list">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3 text-sm text-gym-text-muted">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-gym-primary" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" variant={pack.popular ? 'default' : 'outline'} size="lg" asChild>
                  <a href="/register">
                    Get Started <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="mb-4 text-gym-text-muted">
            All plans include a <strong className="text-gym-text">free 7-day trial</strong>. No credit card required.
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="/contact">Need a Custom Plan?</a>
          </Button>
        </div>
      </div>
    </section>
  )
}