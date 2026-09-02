'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Dumbbell, HeartPulse, Users, Zap, Flame, Target } from 'lucide-react'

const services = [
  {
    icon: Dumbbell,
    title: 'Strength Training',
    description: 'Build muscle and power with our comprehensive strength programs using free machines, cables, and free weights.',
    features: ['Progressive Overload', 'Form Coaching', 'Periodized Programs', 'Strength Testing'],
    color: 'from-gym-primary to-green-600',
    cta: 'View Strength Programs',
  },
  {
    icon: HeartPulse,
    title: 'Cardio & HIIT',
    description: 'Burn fat and improve endurance with high-intensity interval training and steady-state cardio options.',
    features: ['HIIT Classes', 'Treadmill Intervals', 'Rowing Circuits', 'Heart Rate Monitoring'],
    color: 'from-red-500 to-gym-accent',
    cta: 'View Cardio Programs',
  },
  {
    icon: Users,
    title: 'Group Fitness',
    description: 'Energizing group classes led by certified instructors. From yoga to bootcamp, find your tribe.',
    features: ['Yoga & Pilates', 'Spin Classes', 'Bootcamp', 'Dance Fitness'],
    color: 'from-gym-secondary to-blue-600',
    cta: 'View Class Schedule',
  },
  {
    icon: Zap,
    title: 'Personal Training',
    description: 'One-on-one coaching tailored to your goals. Custom nutrition plans and accountability included.',
    features: ['Custom Programs', 'Nutrition Guidance', 'Weekly Check-ins', 'Progress Tracking'],
    color: 'from-purple-500 to-gym-secondary',
    cta: 'Book Consultation',
  },
  {
    icon: Flame,
    title: 'Functional Training',
    description: 'Improve real-world movement patterns with kettlebells, battle ropes, sleds, and bodyweight exercises.',
    features: ['Kettlebell Flows', 'Battle Ropes', 'Sled Push/Pull', 'Mobility Work'],
    color: 'from-orange-500 to-red-500',
    cta: 'View Functional Programs',
  },
  {
    icon: Target,
    title: 'Sports Performance',
    description: 'Athlete-focused training for speed, agility, power, and injury prevention. Youth to pro level.',
    features: ['Speed & Agility', 'Plyometrics', 'Injury Prevention', 'Combine Prep'],
    color: 'from-gym-primary to-gym-secondary',
    cta: 'View Sports Performance',
  },
]

export function ServicesGridSection() {
  return (
    <section className="section pt-16" aria-label="Our Programs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative p-6 rounded-2xl bg-gym-surface border border-gym-border hover:border-gym-primary/50 hover:shadow-neon-primary/20 transition-all duration-300 overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-gym-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden="true"
              />
              <div className={`relative mb-4 p-3 rounded-xl bg-gradient-to-br ${service.color} text-gym-bg`}>
                <service.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="heading-4 text-gym-text mb-2 relative z-10">{service.title}</h3>
              <p className="text-sm text-gym-text-muted mb-4 relative z-10">{service.description}</p>
              <ul className="space-y-2 mb-6 relative z-10">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-2 text-sm text-gym-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-gym-primary" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full relative z-10" asChild>
                <a href="/services">
                  {service.cta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}