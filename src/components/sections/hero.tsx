'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Zap, Flame, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AmbientBackground } from '@/components/visuals'

const features = [
  { icon: Zap, title: 'High-Intensity Training', description: 'Push your limits with our signature HIIT programs designed for maximum results in minimum time.' },
  { icon: Flame, title: 'Fat Burning Workouts', description: 'Scientifically-backed routines that torch calories and boost metabolism long after you leave.' },
  { icon: Target, title: 'Personalized Programs', description: 'Custom training plans tailored to your goals, fitness level, and schedule by certified trainers.' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden section pt-32 lg:pt-48" aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-gym-pattern opacity-50" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-gym-bg via-gym-bg/90 to-transparent" aria-hidden="true" />
      <AmbientBackground />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center space-x-2 rounded-full bg-gym-primary/10 px-4 py-1.5 text-sm font-medium text-gym-primary mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gym-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gym-primary" />
              </span>
              <span>Now Open - New Members Welcome</span>
            </motion.span>

            <h1
              id="hero-heading"
              className="heading-1 text-gym-text mb-6"
            >
              Transform Your Body,{' '}
              <span className="gradient-text">Elevate Your Mind</span>
            </h1>

            <p className="text-body-lg max-w-xl mx-auto lg:mx-0 mb-8">
              Experience the premium fitness difference. State-of-the-art equipment, 
              expert trainers, and a community that pushes you further every day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
              <Button size="lg" className="group w-full sm:w-auto" asChild>
                <a href="/contact">
                  Join Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <a href="/services">Explore Services</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-gym-text-muted">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                <span>500+ Members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                <span>98% Satisfaction</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                <span>24/7 Access</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-lg">
              <img
                src="/Images/home_banner.png"
                alt="FX Gym facility â€“ premium equipment and training space"
                className="w-full h-auto rounded-2xl shadow-neon-primary/20"
                loading="lazy"
                width={480}
                height={480}
              />
            </div>
              
              <div className="absolute -bottom-6 -left-6 lg:-left-10 bg-gym-surface border border-gym-border rounded-2xl p-6 shadow-neon-primary animate-float">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gym-primary/10">
                    <Flame className="h-6 w-6 text-gym-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gym-text">350+</p>
                    <p className="text-sm text-gym-text-muted">Calories Burned/Session</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 lg:-right-10 bg-gym-surface border border-gym-border rounded-2xl p-6 shadow-neon-secondary animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gym-secondary/10">
                    <Zap className="h-6 w-6 text-gym-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gym-text">45</p>
                    <p className="text-sm text-gym-text-muted">Min Average Workout</p>
                  </div>
                </div>
              </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          role="list"
          aria-label="Key features"
        >
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-2xl bg-gym-surface border border-gym-border hover:border-gym-primary/50 hover:shadow-neon-primary/20 transition-all duration-300"
              role="listitem"
            >
              <div className="mb-4 p-3 rounded-xl bg-gym-primary/10 group-hover:bg-gym-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-gym-primary" aria-hidden="true" />
              </div>
              <h3 className="heading-4 text-gym-text mb-2">{feature.title}</h3>
              <p className="text-sm text-gym-text-muted">{feature.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

