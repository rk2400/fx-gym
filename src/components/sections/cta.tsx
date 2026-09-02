'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AmbientBackground } from '@/components/visuals'

export function CTASection() {
  return (
    <section className="relative section overflow-hidden" aria-labelledby="cta-heading">
      <div className="absolute inset-0 bg-gym-pattern opacity-50" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-gym-bg via-gym-bg/95 to-transparent" aria-hidden="true" />
      <AmbientBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 id="cta-heading" className="heading-2 text-gym-text mb-4">
            Ready to <span className="gradient-text">Transform</span> Your Fitness?
          </h2>
          <p className="text-body-lg max-w-2xl mx-auto text-gym-text-muted">
            Join FX Gym today and take advantage of our exclusive limited-time offer. Get your first
            month free with our 7-day money-back guarantee.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <Button size="lg" className="group" asChild>
            <Link href="/contact">
              Become a Member
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
