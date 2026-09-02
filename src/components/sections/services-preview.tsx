'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    image: '/Images/strength.png',
  },
  {
    icon: HeartPulse,
    title: 'Cardio & HIIT',
    description: 'Burn fat and improve endurance with high-intensity interval training and steady-state cardio options.',
    features: ['HIIT Classes', 'Treadmill Intervals', 'Rowing Circuits', 'Heart Rate Monitoring'],
    color: 'from-red-500 to-gym-accent',
    image: '/Images/Cardio.png',
  },
  {
    icon: Users,
    title: 'Group Fitness',
    description: 'Energizing group classes led by certified instructors. From yoga to bootcamp, find your tribe.',
    features: ['Yoga & Pilates', 'Spin Classes', 'Bootcamp', 'Dance Fitness'],
    color: 'from-gym-secondary to-blue-600',
    image: '/Images/group.png',
  },
  {
    icon: Zap,
    title: 'Personal Training',
    description: 'One-on-one coaching tailored to your goals. Custom nutrition plans and accountability included.',
    features: ['Custom Programs', 'Nutrition Guidance', 'Weekly Check-ins', 'Progress Tracking'],
    color: 'from-purple-500 to-gym-secondary',
    image: '/Images/personal.png',
  },
  {
    icon: Flame,
    title: 'Functional Training',
    description: 'Improve real-world movement patterns with kettlebells, battle ropes, sleds, and bodyweight exercises.',
    features: ['Kettlebell Flows', 'Battle Ropes', 'Sled Push/Pull', 'Mobility Work'],
    color: 'from-orange-500 to-red-500',
    image: '/Images/functional.png',
  },
  {
    icon: Target,
    title: 'Sports Performance',
    description: 'Athlete-focused training for speed, agility, power, and injury prevention. Youth to pro level.',
    features: ['Speed & Agility', 'Plyometrics', 'Injury Prevention', 'Combine Prep'],
    color: 'from-gym-primary to-gym-secondary',
    image: '/Images/sports.png',
  },
]

export function ServicesPreviewSection() {
  return (
    <section className="section" aria-labelledby="services-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center space-x-2 rounded-full bg-gym-primary/10 px-4 py-1.5 text-sm font-medium text-gym-primary mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gym-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gym-primary" />
            </span>
            <span>Our Services</span>
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            id="services-heading"
            className="heading-2 text-gym-text mb-4"
          >
            Everything You Need to <span className="gradient-text">Reach Your Goals</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-body-lg max-w-2xl mx-auto text-gym-text-muted"
          >
            From beginner to athlete, our diverse range of programs and expert guidance ensure you
            never train alone.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 6).map((service, index) => (
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
              <div className="relative z-10 mb-5 h-44 overflow-hidden rounded-xl border border-gym-border">
                <Image
                  src={service.image}
                  alt={`${service.title} - FX Gym`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-gym-bg/90 via-gym-bg/20 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className={`absolute bottom-3 left-3 p-2.5 rounded-xl bg-gradient-to-br ${service.color} text-gym-bg shadow-lg`}
                >
                  <service.icon className="h-6 w-6" aria-hidden="true" />
                </div>
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
              <div className="relative z-10">
                <Link
                  href="/services"
                  className="inline-flex items-center text-sm font-medium text-gym-primary hover:text-gym-primary-dim transition-colors"
                >
                  Learn More <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-16"
        >
          <Button size="lg" className="group" asChild>
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}