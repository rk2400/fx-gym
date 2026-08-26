import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/sections/hero'
import { NeonMarquee } from '@/components/visuals'
import { SectionSkeleton } from '@/components/ui/section-skeleton'

// Below-the-fold sections are code-split and loaded after the hero renders,
// which keeps the initial JS bundle (and first paint) fast.
const StatsSection = dynamic(
  () => import('@/components/sections/stats').then((m) => m.StatsSection),
  { loading: () => <SectionSkeleton /> }
)
const ServicesPreviewSection = dynamic(
  () => import('@/components/sections/services-preview').then((m) => m.ServicesPreviewSection),
  { loading: () => <SectionSkeleton /> }
)
const TestimonialsSection = dynamic(
  () => import('@/components/sections/testimonials').then((m) => m.TestimonialsSection),
  { loading: () => <SectionSkeleton /> }
)
const CTASection = dynamic(
  () => import('@/components/sections/cta').then((m) => m.CTASection),
  { loading: () => <SectionSkeleton /> }
)

export const metadata: Metadata = {
  title: 'Transform Your Body, Elevate Your Mind',
  description: 'Premium fitness experience with state-of-the-art equipment, expert trainers, and a community that pushes you further. Join FX Gym today.',
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <NeonMarquee />
      <StatsSection />
      <ServicesPreviewSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}