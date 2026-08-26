'use client'

import { motion } from 'framer-motion'
import { Dumbbell, Target, Users, Award } from 'lucide-react'

export function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden section pt-32" aria-labelledby="about-hero-heading">
      <div className="absolute inset-0 bg-gym-pattern opacity-30" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-gym-bg via-gym-bg/90 to-transparent" aria-hidden="true" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 rounded-full bg-gym-primary/10 px-4 py-1.5 text-sm font-medium text-gym-primary mb-6"
          >
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
            <span>Since 2018 - Transforming Lives</span>
          </motion.span>

          <h1 id="about-hero-heading" className="heading-1 text-gym-text mb-6">
            More Than a Gym,{' '}
            <span className="gradient-text">A Movement</span>
          </h1>

          <p className="text-body-lg text-gym-text-muted mb-8">
            Founded with a vision to create a fitness community where everyone belongs. 
            Where beginners feel welcomed, athletes feel challenged, and everyone leaves stronger than they arrived.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gym-primary/10">
                <Target className="h-6 w-6 text-gym-primary" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="font-heading text-2xl font-bold text-gym-text">50K+</p>
                <p className="text-sm text-gym-text-muted">Lives Transformed</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gym-secondary/10">
                <Users className="h-6 w-6 text-gym-secondary" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="font-heading text-2xl font-bold text-gym-text">2,500+</p>
                <p className="text-sm text-gym-text-muted">Active Members</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gym-accent/10">
                <Award className="h-6 w-6 text-gym-accent" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="font-heading text-2xl font-bold text-gym-text">15</p>
                <p className="text-sm text-gym-text-muted">Certified Trainers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}