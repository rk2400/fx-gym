'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Target, Heart, Users, Zap } from 'lucide-react'

const missionItems = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To empower every individual to become their strongest self - physically, mentally, and emotionally - through science-backed training, expert guidance, and unwavering community support.',
    image: '/Images/our_mission.png',
  },
  {
    icon: Heart,
    title: 'Our Vision',
    description: 'A world where fitness is accessible, enjoyable, and sustainable for everyone. Where walking through our doors means joining a family that celebrates every victory, big or small.',
    image: '/Images/our_vision.png',
  },
  {
    icon: Users,
    title: 'Our Promise',
    description: 'To never compromise on quality, integrity, or care. Every piece of equipment, every program, every interaction is designed with your success in mind.',
    image: '/Images/our_promise.png',
  },
  {
    icon: Zap,
    title: 'Our Approach',
    description: "Evidence-based training meets personalized attention. We combine cutting-edge exercise science with the human touch that technology can't replace.",
    image: '/Images/our_approach.png',
  },
]

export function MissionSection() {
  return (
    <section className="section" aria-labelledby="mission-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            id="mission-heading"
            className="heading-2 text-gym-text mb-4"
          >
            Our <span className="gradient-text">Foundation</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-body-lg max-w-2xl mx-auto text-gym-text-muted"
          >
            Four pillars that guide everything we do at FX Gym
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {missionItems.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group overflow-hidden rounded-2xl bg-gym-surface border border-gym-border hover:border-gym-primary/50 hover:shadow-neon-primary/20 transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.title} - FX Gym`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gym-surface to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute bottom-3 left-4 p-2.5 rounded-xl bg-gym-bg/85 backdrop-blur-sm flex items-center justify-center border border-gym-border">
                  <item.icon className="h-6 w-6 text-gym-primary" aria-hidden="true" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="heading-4 text-gym-text mb-2">{item.title}</h3>
                <p className="text-sm text-gym-text-muted">{item.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}