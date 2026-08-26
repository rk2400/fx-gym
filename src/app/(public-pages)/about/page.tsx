import { Metadata } from 'next'
import { AboutHeroSection as AboutHero } from '@/components/sections/about-hero'
import { MissionSection } from '@/components/sections/mission'
import { ValuesSection } from '@/components/sections/values'
import { TeamSection } from '@/components/sections/team'
import { FacilitySection } from '@/components/sections/facility'
import { CTASection } from '@/components/sections/cta'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about FX Gym\'s mission, values, expert trainers, and world-class facility. Transform your body and elevate your mind with us.',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <AboutHero />
      <MissionSection />
      <ValuesSection />
      <TeamSection />
      <FacilitySection />
      <CTASection />
    </div>
  )
}