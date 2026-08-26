import Link from 'next/link'
import { Dumbbell, Mail, MapPin, Phone, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { cn } from '@/lib/utils'

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ],
  support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  legal: [
    { label: 'Membership Terms', href: '/membership-terms' },
    { label: 'Cancellation Policy', href: '/cancellation' },
    { label: 'Code of Conduct', href: '/conduct' },
  ],
}

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
]

const contactInfo = [
  { label: 'Address', value: '123 Fitness Street, Gym City, GC 12345', icon: MapPin },
  { label: 'Phone', value: '+1 (555) 123-4567', icon: Phone },
  { label: 'Email', value: 'hello@fxgym.com', icon: Mail },
]

export function Footer() {
  return (
    <footer className="bg-gym-surface border-t border-gym-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-2" aria-label="FX Gym Home">
              <Dumbbell className="h-8 w-8 text-gym-primary" aria-hidden="true" />
              <span className="font-heading text-xl font-bold text-gym-text">FX Gym</span>
            </Link>
            <p className="text-gym-text-muted text-sm leading-relaxed max-w-xs">
              Transform your body, elevate your mind. Premium fitness experience with 
              state-of-the-art equipment, expert trainers, and a community that pushes you further.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gym-text-muted hover:text-gym-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gym-text">Company</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gym-text-muted hover:text-gym-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gym-text">Support</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gym-text-muted hover:text-gym-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gym-text">Legal</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gym-text-muted hover:text-gym-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gym-text">Contact Us</h3>
                <ul className="mt-4 space-y-3">
                  {contactInfo.map((item) => (
                    <li key={item.label} className="flex items-start space-x-3">
                      <item.icon className="h-5 w-5 text-gym-primary mt-0.5 shrink-0" aria-hidden="true" />
                      <div>
                        <span className="text-xs font-medium text-gym-text-muted">{item.label}</span>
                        <p className="text-sm text-gym-text">{item.value}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gym-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gym-text-muted">
              &copy; {new Date().getFullYear()} FX Gym. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gym-text-muted">
              <span>Built with Next.js & Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}