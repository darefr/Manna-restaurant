'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { MapPin, Phone, Navigation } from 'lucide-react'
import Link from 'next/link'
import { restaurant } from '@/lib/restaurant'
import type { RestaurantInfo } from '@/lib/settings'
import { phoneHref } from '@/lib/site-content'

/** Navigation links that never depend on CMS values. */
const staticFooterLinks = {
  Explore: [
    { label: 'Our Story', href: '/about' },
    { label: 'Our Chef', href: '/chef' },
    { label: 'Full Menu', href: '/menu' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Reviews', href: '/reviews' },
  ],
  Order: [
    { label: 'Order on WhatsApp', href: '/order' },
    { label: 'Momo & Jhol Momo', href: '/menu' },
    { label: 'Tandoori Items', href: '/menu' },
    { label: 'Khaja Set', href: '/menu' },
    { label: 'Home Delivery', href: '/contact' },
  ],
}

const instagramSvg = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const whatsappSvg = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
  </svg>
)

export default function Footer({
  info,
}: {
  /** CMS-managed details; falls back to the verified static data. */
  info?: RestaurantInfo
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const name = info?.name || restaurant.name
  const addressLine1 = info?.addressLine1 || restaurant.address.line1
  const addressLine2 = info?.addressLine2 || restaurant.address.line2
  const mapsUrl = info?.mapsUrl || restaurant.maps.directionsUrl
  const instagramUrl = info?.instagram || restaurant.instagram.url
  const whatsapp = (info?.whatsapp || restaurant.whatsapp).replace(/\D/g, '')
  const reception = info?.phoneReception || restaurant.phones.reception.display
  const chef = info?.phoneChef || restaurant.phones.chef.display
  const receptionHref = phoneHref(reception, restaurant.phones.reception.number)
  const chefHref = phoneHref(chef, restaurant.phones.chef.number)

  const footerLinks = {
    ...staticFooterLinks,
    Visit: [
      { label: 'Contact & Location', href: '/contact' },
      { label: 'Get Directions', href: mapsUrl },
      { label: 'Call the Restaurant', href: `tel:${receptionHref}` },
      { label: 'Instagram', href: instagramUrl },
    ],
  }

  const socials = [
    { label: 'Instagram', href: instagramUrl, svg: instagramSvg },
    { label: 'WhatsApp', href: `https://wa.me/${whatsapp}`, svg: whatsappSvg },
    {
      label: 'Get Directions on Google Maps',
      href: mapsUrl,
      svg: <Navigation size={14} aria-hidden="true" />,
    },
  ]

  return (
    <footer className="relative overflow-hidden bg-background border-t border-[#c9a84c]/15">
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Main footer content */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="py-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12"
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <div className="mb-6">
              <span className="font-serif text-3xl font-bold tracking-[0.18em] text-gradient-gold">MANNA</span>
              <div className="text-[9px] tracking-[0.35em] text-muted-foreground uppercase mt-0.5">
                Restaurant &amp; Tandoori
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-2">
              Authentic Indian &amp; Nepali taste on the Rampur Highway in Devchuli — momo, tandoori,
              fried rice and thukpa, prepared fresh every day.
            </p>
            <p className="text-xs text-muted-foreground/80 mb-8">{restaurant.address.nepali}</p>
            {/* Contact mini */}
            <div className="flex flex-col gap-3 mb-8">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-xs text-muted-foreground hover:text-[#c9a84c] transition-colors"
              >
                <MapPin size={12} className="text-[#c9a84c] shrink-0 mt-0.5" />
                <span>
                  {addressLine1}, {addressLine2}
                </span>
              </a>
              <a
                href={`tel:${receptionHref}`}
                className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-[#c9a84c] transition-colors"
              >
                <Phone size={12} className="text-[#c9a84c] shrink-0" />
                <span>{reception}</span>
              </a>
              <a
                href={`tel:${chefHref}`}
                className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-[#c9a84c] transition-colors"
              >
                <Phone size={12} className="text-[#c9a84c] shrink-0" />
                <span>
                  {chef}{' '}
                  <span className="text-muted-foreground/60">({restaurant.phones.chef.label})</span>
                </span>
              </a>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full glass-card gold-border flex items-center justify-center hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/10 transition-all duration-300 text-muted-foreground hover:text-[#c9a84c]"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="col-span-1">
              <h4 className="text-[10px] tracking-[0.35em] uppercase font-semibold text-[#c9a84c] mb-5">
                {section}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) =>
                  link.href.startsWith('/') ? (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 text-left"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 text-left"
                      >
                        {link.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-[#c9a84c]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-muted-foreground tracking-wide text-center sm:text-left">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-[#c9a84c]/40" />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground tracking-wide text-center sm:text-right">
            {restaurant.qualities.join(' · ')}
          </p>
        </div>
      </div>
    </footer>
  )
}
