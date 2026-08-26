'use client'

import { motion, useReducedMotion } from 'framer-motion'

const MARQUEE_ITEMS = [
  { label: 'STRENGTH', color: 'text-gym-primary' },
  { label: 'HIIT', color: 'text-gym-secondary' },
  { label: 'YOGA', color: 'text-gym-text' },
  { label: 'SPIN', color: 'text-gym-primary' },
  { label: 'BOXING', color: 'text-gym-accent' },
  { label: 'CROSSFIT', color: 'text-gym-secondary' },
  { label: 'MOBILITY', color: 'text-gym-text' },
  { label: 'NUTRITION', color: 'text-gym-primary' },
]

/**
 * Infinite neon keyword ticker. The item list is rendered twice so the
 * CSS translate loop (-50%) wraps seamlessly. Pauses on hover and is
 * disabled for reduced-motion users.
 */
export function NeonMarquee() {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const row = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center space-x-10 pr-10"
    >
      {MARQUEE_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center space-x-10">
          <span className={`font-heading text-lg font-bold tracking-[0.25em] ${item.color}`}>
            {item.label}
          </span>
          <span className="text-gym-primary/50" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div
      className="relative overflow-hidden border-y border-gym-border bg-gym-surface/60 py-5 marquee-hover"
      aria-label="Training programs"
      role="marquee"
    >
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-gym-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-gym-bg to-transparent" />

      <div className={`flex w-max ${reduce ? '' : 'animate-marquee'}`}>
        {row(true)}
        {row(true)}
      </div>
    </div>
  )
}
