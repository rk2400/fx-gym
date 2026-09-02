import { Metadata } from 'next'
import { PageHero } from '@/components/sections/page-hero'
import { ServicesGridSection } from '@/components/sections/services-grid'
import { ServiceDetailSection } from '@/components/sections/service-detail'
import { FacilitySection } from '@/components/sections/facility'
import { TrainerSection } from '@/components/sections/trainers'
import { CTASection } from '@/components/sections/cta'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore FX Gym\'s comprehensive fitness services: strength training, cardio, group classes, personal training, functional training, and sports performance.',
}

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      <PageHero title="Our Services" description="Comprehensive fitness programs designed for every level. From beginner to athlete, we have the perfect program for your goals." />
      <ServicesGridSection />
      <ServiceDetailSection />
      <FacilitySection />
      <TrainerSection />
      <CTASection />
    </div>
  )
}