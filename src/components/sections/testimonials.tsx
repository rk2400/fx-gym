'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const testimonials = [
  { content: "FX Gym completely transformed my fitness journey. The trainers are incredibly knowledgeable, the equipment is top-tier, and the community keeps me accountable. I've lost 30lbs and gained confidence I never had.", author: 'Sarah Mitchell', role: 'Member since 2022', avatar: 'SM', rating: 5 },
  { content: "As a former college athlete, I've trained at many facilities. FX Gym stands out for its attention to detail - from the programming to the recovery areas. The sports performance program got me back to peak condition.", author: 'Marcus Johnson', role: 'Athlete / Member since 2021', avatar: 'MJ', rating: 5 },
  { content: "I was intimidated by gyms before joining FX. The welcoming atmosphere and beginner-friendly classes made all the difference. The trainers took time to teach proper form. 6 months later, I'm stronger than ever!", author: 'Emily Chen', role: 'Member since 2023', avatar: 'EC', rating: 5 },
  { content: "The 24/7 access is a game-changer for my schedule. I can train at 5am before work or 10pm after late shifts. The facility is always clean, secure, and never overcrowded. Best investment in myself.", author: 'David Rodriguez', role: 'Shift Worker / Member since 2022', avatar: 'DR', rating: 5 },
  { content: "My whole family trains here - me, my wife, and our two teens. The family membership is great value, and there's something for everyone. The youth sports program helped my son make varsity!", author: 'Lisa Thompson', role: 'Family Membership since 2021', avatar: 'LT', rating: 5 },
  { content: "The nutritional guidance combined with personal training was exactly what I needed. My trainer created a sustainable plan that fit my lifestyle. Down 25lbs, up significant muscle, and I actually enjoy the process now.", author: 'James Park', role: 'Personal Training Client', avatar: 'JP', rating: 5 },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3
  const totalGroups = testimonials.length - itemsPerView + 1

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalGroups)
  }, [totalGroups])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalGroups) % totalGroups)
  }, [totalGroups])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="section bg-gym-surface border-y border-gym-border" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center space-x-2 rounded-full bg-gym-primary/10 px-4 py-1.5 text-sm font-medium text-gym-primary mb-4">
            <Quote className="h-4 w-4" aria-hidden="true" />
            <span>Member Stories</span>
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            id="testimonials-heading"
            className="heading-2 text-gym-text mb-4"
          >
            Trusted by <span className="gradient-text">2,500+ Members</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-body-lg max-w-2xl mx-auto text-gym-text-muted"
          >
            Real results from real people. See what our community has to say about their FX Gym
            experience.
          </motion.p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex gap-6"
              >
                {testimonials.slice(currentIndex, currentIndex + itemsPerView).map((testimonial) => (
                  <motion.article
                    key={testimonial.author}
                    className="w-full sm:w-1/2 lg:w-1/3 h-full p-6 rounded-2xl bg-gym-bg border border-gym-border hover:border-gym-primary/50 transition-colors flex flex-col"
                  >
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, s) => (
                        <Star key={s} className="h-5 w-5 fill-gym-primary text-gym-primary" aria-hidden="true" />
                      ))}
                    </div>
                    <blockquote className="text-body text-gym-text mb-6 relative flex-grow">
                      <Quote className="absolute -top-2 -left-2 h-8 w-8 text-gym-primary/10" aria-hidden="true" />
                      <p className="relative z-10">&ldquo;{testimonial.content}&rdquo;</p>
                    </blockquote>
                    <div className="flex items-center space-x-4 mt-auto">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center font-heading font-bold text-gym-bg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gym-text">{testimonial.author}</p>
                        <p className="text-sm text-gym-text-muted">{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} aria-label="Previous testimonials">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial navigation">
              {Array.from({ length: totalGroups }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-gym-primary w-6' : 'bg-gym-text-muted/30 hover:bg-gym-text-muted/50'
                  }`}
                  role="tab"
                  aria-selected={i === currentIndex}
                  aria-label={`Go to testimonial group ${i + 1}`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} aria-label="Next testimonials">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}