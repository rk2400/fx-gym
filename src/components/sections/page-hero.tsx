'use client'

import { motion } from 'framer-motion'
import { Dumbbell } from 'lucide-react'

interface PageHeroProps {
  title: string
  description: string
}

export function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden section pt-32 pb-16" aria-labelledby="page-hero-heading">
      <div className="absolute inset-0 bg-gym-pattern opacity-30" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-gym-bg via-gym-bg/90 to-transparent" aria-hidden="true" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 rounded-full bg-gym-primary/10 px-4 py-1.5 text-sm font-medium text-gym-primary mb-6"
          >
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
            <span>FX Gym Services</span>
          </motion.span>

          <h1 id="page-hero-heading" className="heading-1 text-gym-text mb-6">
            {title}
          </h1>

          <p className="text-body-lg text-gym-text-muted">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  )
}