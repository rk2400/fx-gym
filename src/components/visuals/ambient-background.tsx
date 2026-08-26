'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * Ambient neon backdrop – three blurred color orbs drifting slowly over a
 * faint grid. Pure transform/opacity animation (GPU friendly) and fully
 * static when the user prefers reduced motion.
 */
export function AmbientBackground({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()

  const orbs = [
    { color: '#00ff88', size: 420, top: '-10%', left: '-8%', dur: 18 },
    { color: '#00d4ff', size: 360, top: '35%', left: '70%', dur: 22 },
    { color: '#ff3366', size: 300, top: '75%', left: '20%', dur: 26 },
  ]

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Faint grid */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #1e1e2e 1px, transparent 1px), linear-gradient(to bottom, #1e1e2e 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)',
        }}
      />

      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[110px]"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            backgroundColor: orb.color,
            opacity: 0.16,
          }}
          animate={reduce ? undefined : { x: [0, 40, -30, 0], y: [0, -35, 25, 0] }}
          transition={
            reduce ? undefined : { duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      ))}
    </div>
  )
}
