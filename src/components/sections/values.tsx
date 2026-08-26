'use client';
import { motion } from 'framer-motion';
import { Dumbbell, Heart, Users, Award, Shield, Star } from 'lucide-react';
const values = [
  {
    icon: Dumbbell,
    title: 'Excellence in Everything',
    description:
      'We hold ourselves to the highest standards - from equipment maintenance to program design. Good enough is never good enough.',
    color: 'from-gym-primary to-green-600',
  },
  {
    icon: Heart,
    title: 'People First, Always',
    description:
      'Every decision starts with our members. Your goals, your safety, your experience - these are our only metrics that matter.',
    color: 'from-red-500 to-gym-accent',
  },
  {
    icon: Users,
    title: 'Community Over Competition',
    description:
      "We celebrate each other's wins. Your PR is our PR. The person next to you isn't your competition - they're your motivation.",
    color: 'from-gym-secondary to-blue-600',
  },
  {
    icon: Award,
    title: 'Continuous Growth',
    description:
      'We never stop learning. Our trainers pursue ongoing education. Our programs evolve with science. Stagnation is the enemy.',
    color: 'from-purple-500 to-gym-secondary',
  },
  {
    icon: Shield,
    title: 'Integrity & Transparency',
    description:
      'No hidden fees. No false promises. No shortcuts. We build trust through honesty, one interaction at a time.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Star,
    title: 'Inclusive Environment',
    description:
      'Fitness is for every body. Regardless of age, ability, background, or starting point - you belong here.',
    color: 'from-gym-primary to-gym-secondary',
  },
];
export function ValuesSection() {
  return (
    <section
      className="section border-y border-gym-border bg-gym-surface"
      aria-labelledby="values-heading"
    >
      {' '}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {' '}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          {' '}
          <h2 id="values-heading" className="heading-2 mb-4 text-gym-text">
            {' '}
            Our <span className="gradient-text">Core Values</span>{' '}
          </h2>{' '}
          <p className="text-body-lg mx-auto max-w-2xl text-gym-text-muted">
            {' '}
            The principles that drive every decision, every program, every interaction at FX
            Gym{' '}
          </p>{' '}
        </motion.div>{' '}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {' '}
          {values.map((value, index) => (
            <motion.article
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="hover:shadow-neon-primary/20 group relative overflow-hidden rounded-2xl border border-gym-border bg-gym-bg p-6 transition-all duration-300 hover:border-gym-primary/50"
            >
              {' '}
              <div
                className="{value.color} absolute left-0 right-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />{' '}
              <div className="{value.color} mb-4 rounded-xl bg-gradient-to-br p-3 text-gym-bg">
                {' '}
                <value.icon className="h-6 w-6" aria-hidden="true" />{' '}
              </div>{' '}
              <h3 className="heading-4 mb-3 text-gym-text">{value.title}</h3>{' '}
              <p className="text-gym-text-muted">{value.description}</p>{' '}
            </motion.article>
          ))}{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
