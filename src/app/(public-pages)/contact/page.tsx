import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { PageHero } from '@/components/sections/page-hero'
import { ContactFormSection } from '@/components/forms/contact-form'
import { ContactInfoSection } from '@/components/sections/contact-info'
import { SectionSkeleton } from '@/components/ui/section-skeleton'

// The Google Maps iframe is code-split so it never blocks the initial page load
const MapSection = dynamic(
  () => import('@/components/sections/map').then((m) => m.MapSection),
  { loading: () => <SectionSkeleton /> }
)

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with FX Gym. Visit our facility, call us, or send a message. We\'re here to help you start your fitness journey.',
}

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <PageHero title="Get in Touch" description="Have questions? We'd love to hear from you. Visit our facility, give us a call, or send us a message below." />
      <ContactInfoSection />
      <ContactFormSection />
      <MapSection />
    </div>
  )
}