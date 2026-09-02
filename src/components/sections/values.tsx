'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Dumbbell, Heart, Users, Award, Shield, Star } from 'lucide-react';

const values = [
  {
    icon: Dumbbell,
    title: 'Excellence in Everything',
    description:
      'We hold ourselves to the highest standards - from equipment maintenance to program design. Good enough is never good enough.',
    color: 'from-gym-primary to-green-600',
    image: '/Images/value1.png',
  },
  {
    icon: Heart,
    title: 'People First, Always',
    description:
      'Every decision starts with our members. Your goals, your safety, your experience - these are our only metrics that matter.',
    color: 'from-red-500 to-gym-accent',
    image: '/Images/value2.png',
  },
  {
    icon: Users,
    title: 'Community Over Competition',
    description:
      "We celebrate each other's wins. Your PR is our PR. The person next to you isn't your competition - they're your motivation.",
    color: 'from-gym-secondary to-blue-600',
    image: '/Images/value3.png',
  },
  {
    icon: Award,
    title: 'Continuous Growth',
    description:
      'We never stop learning. Our trainers pursue ongoing education. Our programs evolve with science. Stagnation is the enemy.',
    color: 'from-purple-500 to-gym-secondary',
    image: '/Images/value4.png',
  },
  {
    icon: Shield,
    title: 'Integrity & Transparency',
    description:
      'No hidden fees. No false promises. No shortcuts. We build trust through honesty, one interaction at a time.',
    color: 'from-orange-500 to-red-500',
    image: '/Images/value5.png',
  },
  {
    icon: Star,
    title: 'Inclusive Environment',
    description:
      'Fitness is for every body. Regardless of age, ability, background, or starting point - you belong here.',
    color: 'from-gym-primary to-gym-secondary',
    image: '/Images/value6.png',
  },
];

export function ValuesSection() {
  return (
    <section
      className="section border-y border-gym-border bg-gym-surface"
      aria-labelledby="values-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 id="values-heading" className="heading-2 mb-4 text-gym-text">
            Our <span className="gradient-text">Core Values</span>
          </h2>
          <p className="text-body-lg mx-auto max-w-2xl text-gym-text-muted">
            The principles that drive every decision, every program, every interaction at FX Gym
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => (
            <motion.article
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="hover:shadow-neon-primary/20 group relative overflow-hidden rounded-2xl border border-gym-border bg-gym-bg p-6 transition-all duration-300 hover:border-gym-primary/50"
            >
              <div className="relative mb-5 h-40 overflow-hidden rounded-xl border border-gym-border p-2">
                <Image
                  src={value.image}
                  alt={`${value.title} - FX Gym`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-gym-bg/90 via-gym-bg/20 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className={`absolute bottom-3 left-3 rounded-xl bg-gradient-to-br ${value.color} p-2.5 text-gym-bg shadow-lg`}
                >
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <h3 className="heading-4 mb-3 text-gym-text">{value.title}</h3>
              <p className="text-gym-text-muted">{value.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

