'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    image: '/Images/contact1.png',
    details: ['123 Fitness Street', 'Gym City, GC 12345', 'United States'],
    link: { label: 'Get Directions', href: 'https://maps.google.com', external: true },
  },
  {
    icon: Phone,
    title: 'Call Us',
    image: '/Images/contact2.png',
    details: ['+1 (555) 123-4567', 'Mon-Fri: 5am - 10pm', 'Sat-Sun: 7am - 8pm'],
    link: { label: 'Call Now', href: 'tel:+15551234567', external: false },
  },
  {
    icon: Mail,
    title: 'Email Us',
    image: '/Images/contact3.png',
    details: ['hello@fxgym.com', 'membership@fxgym.com', 'training@fxgym.com'],
    link: { label: 'Email Us', href: 'mailto:hello@fxgym.com', external: false },
  },
  {
    icon: Clock,
    title: 'Hours',
    image: '/Images/contact4.png',
    details: ['Gym Floor: 24/7/365', 'Staffed Hours: Mon-Fri 5am-10pm', 'Weekends: 7am-8pm'],
    link: { label: 'View Schedule', href: '/schedule', external: false },
  },
]

export function ContactInfoSection() {
  return (
    <section className="section bg-gym-surface border-y border-gym-border" aria-labelledby="contact-info-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 id="contact-info-heading" className="heading-2 text-gym-text mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-body-lg max-w-2xl mx-auto text-gym-text-muted">
            Multiple ways to reach us. Choose what works best for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-2xl bg-gym-bg border border-gym-border hover:border-gym-primary/50 transition-colors flex flex-col h-full"
            >
              <div className="relative mb-5 h-40 overflow-hidden rounded-xl border border-gym-border p-2">
                <Image
                  src={item.image}
                  alt={`${item.title} - FX Gym`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-gym-bg/90 via-gym-bg/20 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-gym-primary text-gym-bg shadow-lg">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <h3 className="heading-4 text-gym-text mb-3">{item.title}</h3>
              <ul className="space-y-1 text-gym-text-muted mb-6">
                {item.details.map((detail) => (
                  <li key={detail} className="text-sm">
                    {detail}
                  </li>
                ))}
              </ul>
              <a
                href={item.link.href}
                target={item.link.external ? '_blank' : undefined}
                rel={item.link.external ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center text-sm font-medium text-gym-primary hover:text-gym-primary-dim transition-colors mt-auto"
              >
                {item.link.label}
                <svg
                  className="ml-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}


