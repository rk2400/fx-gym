'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'

const serviceDetails = [
  {
    title: 'Strength Training Programs',
    description: 'Science-based strength programs for every level. From beginner linear progression to advanced periodization for competitive lifters.',
    details: [
      'Initial strength assessment & movement screening',
      'Customized periodized program (4-12 weeks)',
      'Weekly form checks via app or in-person',
      'Progressive overload tracking & deload weeks',
      'Access to strength-specific equipment zones',
      'Monthly 1RM testing sessions',
      'Nutrition guidance for strength goals',
    ],
    price: 'Included with membership',
    cta: 'Start Strength Program',
  },
  {
    title: 'Personal Training Packages',
    description: 'One-on-one coaching with our elite trainers. Fully customized training, nutrition, and lifestyle programming.',
    details: [
      'Comprehensive fitness & lifestyle assessment',
      'Fully custom training program (updated monthly)',
      'Personalized nutrition protocol & meal guides',
      'Weekly 60-min training sessions',
      'Bi-weekly 30-min check-ins & adjustments',
      '24/7 coach access via messaging app',
      'Quarterly body composition scans',
      'Goal-specific supplementation guidance',
    ],
    price: 'Starting at Rs 3,000/mo',
    cta: 'Book Free Consultation',
  },
  {
    title: 'Group Fitness Membership',
    description: 'Unlimited access to 50+ weekly classes across all formats. Yoga, spin, HIIT, strength, dance, and more.',
    details: [
      'Unlimited classes (50+ weekly sessions)',
      'Priority booking 48hrs before non-members',
      'Access to all 3 studio spaces',
      'Class variety: Yoga, Spin, HIIT, Strength, Dance, Pilates',
      'Certified instructors for every format',
      'Beginner-friendly modifications always offered',
      'Monthly fitness challenges & community events',
    ],
    price: 'Included with membership',
    cta: 'View Class Schedule',
  },
]

export function ServiceDetailSection() {
  return (
    <section className="section bg-gym-surface border-y border-gym-border" aria-labelledby="service-detail-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="service-detail-heading" className="heading-2 text-gym-text mb-4">
            Program <span className="gradient-text">Details</span>
          </h2>
          <p className="text-body-lg max-w-2xl mx-auto text-gym-text-muted">
            Deep dive into our most popular programs. Each designed for results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {serviceDetails.map((service, index) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl bg-gym-bg border border-gym-border flex flex-col h-full"
            >
              <h3 className="heading-4 text-gym-text mb-2">{service.title}</h3>
              <p className="text-gym-text-muted mb-4 flex-grow">{service.description}</p>
              <ul className="space-y-3 mb-6">
                {service.details.map((detail) => (
                  <li key={detail} className="flex items-start space-x-3 text-sm text-gym-text-muted">
                    <Check className="h-5 w-5 text-gym-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading text-xl font-bold text-gym-primary">{service.price}</span>
              </div>
              <Button className="w-full group" asChild>
                <Link href="/contact">
                  {service.cta} <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
