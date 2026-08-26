'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Dumbbell, Shield, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import { AmbientBackground } from '@/components/visuals'

const benefits = [
  { icon: Shield, title: 'No Contract Lock-in', description: 'Cancel anytime with 30-day notice' },
  { icon: Users, title: 'Guest Passes Included', description: 'Bring a friend up to 4x/month' },
  { icon: Clock, title: '24/7 Facility Access', description: 'Train on your schedule, not ours' },
  { icon: Dumbbell, title: 'Free Fitness Assessment', description: 'Comprehensive evaluation, complimentary for new members' },
]

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
          className="text-center mb-16"
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
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-gym-surface border border-gym-border rounded-2xl p-8 mb-12"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 p-3 rounded-xl bg-gym-primary/10">
                  <benefit.icon className="h-6 w-6 text-gym-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="heading-4 text-gym-text mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gym-text-muted">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
