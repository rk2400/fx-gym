'use client'

import { motion } from 'framer-motion'
import { Users, Dumbbell, Trophy, Clock } from 'lucide-react'
import { CountUp } from '@/components/visuals'

const stats = [
  { icon: Users, value: 2500, suffix: '+', label: 'Active Members' },
  { icon: Dumbbell, value: 50, suffix: '+', label: 'Weekly Classes' },
  { icon: Trophy, value: 15, suffix: '', label: 'Certified Trainers' },
  { icon: Clock, value: 24, suffix: '/7', label: 'Gym Access' },
]

export function StatsSection() {
  return (
    <section className="section-sm bg-gym-surface border-y border-gym-border" aria-labelledby="stats-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="mx-auto lg:mx-0 mb-4 p-3 rounded-xl bg-gym-primary/10 inline-flex">
                <stat.icon className="h-8 w-8 text-gym-primary" aria-hidden="true" />
              </div>
              <div className="font-heading text-4xl lg:text-5xl font-bold text-gym-text mb-1">
                <CountUp value={stat.value} />
                <span className="text-gym-primary">{stat.suffix}</span>
              </div>
              <p className="text-gym-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}