'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dumbbell, Award, GraduationCap, HeartPulse, Shield, Star, ChevronRight } from 'lucide-react'

const trainers = [
  {
    name: 'Marcus Steele',
    role: 'Head Strength Coach',
    bio: 'Former Division I strength coach with 12+ years experience. CSCS, NSCA-CPT certified. Specializes in powerlifting and athletic performance.',
    certifications: ['CSCS', 'NSCA-CPT', 'USAW Level 2'],
    avatar: 'MS',
    specialties: ['Strength Training', 'Powerlifting', 'Sports Performance'],
  },
  {
    name: 'Dr. Amanda Chen',
    role: 'Clinical Exercise Physiologist',
    bio: 'PhD in Exercise Science. Expert in injury rehabilitation and chronic disease management through exercise. ACSM-CEP certified.',
    certifications: ['ACSM-CEP', 'PhD Exercise Science', 'Corrective Exercise Specialist'],
    avatar: 'AC',
    specialties: ['Rehabilitation', 'Medical Exercise', 'Mobility'],
  },
  {
    name: 'Jason "J-Rock" Rodriguez',
    role: 'HIIT & Conditioning Specialist',
    bio: 'Former MMA fighter turned coach. 10+ years designing high-intensity programs. Known for energy that pushes you past your limits.',
    certifications: ['NASM-CPT', 'HIIT Specialist', 'Kettlebell Level 2'],
    avatar: 'JR',
    specialties: ['HIIT', 'Conditioning', 'Fat Loss'],
  },
  {
    name: 'Sarah Mitchell',
    role: 'Yoga & Mobility Director',
    bio: 'E-RYT 500 with 15 years teaching. Combines traditional yoga with modern mobility science. Helps athletes move better, recover faster.',
    certifications: ['E-RYT 500', 'FRCms', 'Yoga Therapy'],
    avatar: 'SM',
    specialties: ['Yoga', 'Mobility', 'Recovery'],
  },
  {
    name: 'David Park',
    role: 'Nutrition & Lifestyle Coach',
    bio: 'Precision Nutrition Level 2 certified. Helps members build sustainable nutrition habits without restrictive dieting. 8+ years coaching.',
    certifications: ['PN Level 2', 'NSCA-CPT', 'Behavior Change Specialist'],
    avatar: 'DP',
    specialties: ['Nutrition', 'Habit Coaching', 'Lifestyle'],
  },
  {
    name: 'Emma Thompson',
    role: 'Group Fitness Director',
    bio: 'AFAA/ACE certified with 20+ years leading group classes. Creates energizing, inclusive experiences for every fitness level.',
    certifications: ['AFAA', 'ACE', 'Barre Certified'],
    avatar: 'ET',
    specialties: ['Group Classes', 'Barre', 'Community'],
  },
]

export function TrainerSection() {
  return (
    <section className="section" aria-labelledby="trainer-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="trainer-heading" className="heading-2 text-gym-text mb-4">
            Your <span className="gradient-text">Coaching Team</span>
          </h2>
          <p className="text-body-lg max-w-2xl mx-auto text-gym-text-muted">
            6 expert coaches. 50+ combined certifications. One goal: your success.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer, index) => (
            <motion.article
              key={trainer.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-2xl bg-gym-surface border border-gym-border hover:border-gym-primary/50 hover:shadow-neon-primary/20 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center font-heading font-bold text-gym-bg shrink-0">
                  {trainer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="heading-4 text-gym-text truncate">{trainer.name}</h3>
                  <p className="text-gym-primary font-medium">{trainer.role}</p>
                </div>
              </div>
              <p className="text-sm text-gym-text-muted mb-4 flex-grow">{trainer.bio}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {trainer.specialties.map((specialty) => (
                  <span key={specialty} className="text-xs px-2.5 py-1 bg-gym-primary/10 text-gym-primary rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gym-border">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-gym-primary fill-gym-primary" aria-hidden="true" />
                  <span className="text-sm font-medium text-gym-text">
                    {trainer.certifications.length} Certifications
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/contact">
                    Book Session
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}