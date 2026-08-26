import { Metadata } from 'next'
import { PageHero } from '@/components/sections/page-hero'
import { PricingSection } from '@/components/pricing/pricing-section'
import { FAQSection } from '@/components/sections/faq'
import { CTASection } from '@/components/sections/cta'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for every fitness journey. Choose from monthly, quarterly, or annual memberships. No hidden fees, cancel anytime.',
}

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      <PageHero title="Simple, Transparent Pricing" description="No hidden fees. No long-term contracts. Just results. Choose the plan that fits your lifestyle." />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  )
}