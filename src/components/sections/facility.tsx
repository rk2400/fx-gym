'use client'

import { motion } from 'framer-motion'
import { Dumbbell, HeartPulse, Users, Zap, Flame, Target, Music, Wind } from 'lucide-react'

const facilities = [
  {
    icon: Dumbbell,
    title: 'Strength Zone',
    description: '5,000+ sq ft of premium strength equipment. Rogue, Eleiko, Hammer Strength, and custom-built stations. 20+ power racks, 30+ plate-loaded machines.',
    features: ['Rogue Power Racks', 'Eleiko Barbells', 'Hammer Strength', 'Dumbbells 5-150lbs', 'Cable Stations', 'Specialty Bars'],
    image: 'strength',
  },
  {
    icon: HeartPulse,
    title: 'Cardio Theater',
    description: '60+ pieces of commercial cardio with personal entertainment screens. Treadmills, bikes, rowers, steppers, and VersaClimbers.',
    features: ['Woodway Treadmills', 'Assault Bikes', 'Concept2 Rowers', 'StairMasters', 'VersaClimbers', 'Entertainment Screens'],
    image: 'cardio',
  },
  {
    icon: Users,
    title: 'Group Fitness Studios',
    description: 'Three dedicated studios with professional sound, lighting, and flooring. Hosting 50+ classes weekly across all formats.',
    features: ['Studio A: 60-person', 'Studio B: 40-person', 'Studio C: 30-person', 'Professional Sound', 'Climate Control', 'Shock-Absorbing Floors'],
    image: 'studio',
  },
  {
    icon: Zap,
    title: 'Functional Training Arena',
    description: '3,000 sq ft open turf area with sled tracks, rig systems, and every functional tool imaginable. Perfect for HIIT and athletic training.',
    features: ['40yd Sled Track', 'Rig Systems', 'Battle Ropes', 'Kettlebells 4-48kg', 'Medicine Balls', 'Plyo Boxes'],
    image: 'functional',
  },
  {
    icon: Flame,
    title: 'Combat & Martial Arts',
    description: 'Full-size boxing ring, heavy bag wall, grappling mats, and dedicated striking area. Boxing, Muay Thai, BJJ classes available.',
    features: ['Boxing Ring', '20+ Heavy Bags', 'Speed Bags', 'Grappling Mats', 'Double-End Bags', 'Focus Mitts'],
    image: 'combat',
  },
  {
    icon: Target,
    title: 'Recovery & Wellness Center',
    description: 'Dedicated recovery zone with NormaTec compression, massage chairs, infrared sauna, cold plunge, and stretching/mobility areas.',
    features: ['NormaTec Compression', 'Massage Chairs', 'Infrared Sauna', 'Cold Plunge', 'Stretch Areas', 'Foam Rolling'],
    image: 'recovery',
  },
]

export function FacilitySection() {
  return (
    <section className="section bg-gym-surface border-y border-gym-border" aria-labelledby="facility-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="facility-heading" className="heading-2 text-gym-text mb-4">
            World-Class <span className="gradient-text">Facility</span>
          </h2>
          <p className="text-body-lg max-w-2xl mx-auto text-gym-text-muted">
            25,000+ sq ft of premium training space designed for every fitness pursuit
          </p>
        </motion.div>

        <div className="space-y-8">
          {facilities.map((facility, index) => (
            <motion.article
              key={facility.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`flex flex-col md:flex-row gap-8 p-6 rounded-2xl bg-gym-bg border border-gym-border hover:border-gym-primary/50 transition-colors ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="relative md:w-1/3 shrink-0">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-gym-primary/10 to-gym-secondary/10 flex items-center justify-center overflow-hidden">
                  <facility.icon className="h-16 w-16 text-gym-primary/30" aria-hidden="true" />
                </div>
              </div>
              <div className="md:flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-gym-primary/10">
                    <facility.icon className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                  </div>
                  <h3 className="heading-4 text-gym-text">{facility.title}</h3>
                </div>
                <p className="text-gym-text-muted mb-4">{facility.description}</p>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {facility.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2 text-sm text-gym-text-muted">
                      <div className="h-1.5 w-1.5 rounded-full bg-gym-primary" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}