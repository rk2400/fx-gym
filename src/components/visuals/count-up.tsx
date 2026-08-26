'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

/**
 * Animated number that counts up from 0 when scrolled into view.
 * Renders the live value into a span (no re-renders per frame).
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: 1800, bounce: 0 })
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (inView) motionValue.set(value)
  }, [inView, value, motionValue])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-US')
    })
    return unsubscribe
  }, [spring])

  return (
    <span ref={ref} className={className}>
      0
    </span>
  )
}
