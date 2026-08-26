'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Clock,
  Bike,
  Navigation,
  MessageCircle,
  Camera as InstagramIcon,
  UtensilsCrossed,
  Package,
} from 'lucide-react'
import PageHero from '@/components/PageHero'
import { restaurant, images } from '@/lib/restaurant'
import type { OpeningHours, RestaurantInfo } from '@/lib/settings'
import { formatOpeningLine, phoneHref } from '@/lib/site-content'
import { ORDER_WHATSAPP_NUMBER } from '@/lib/whatsapp-order'

function SectionHeading({
  overline,
  title,
  description,
}: {
  overline: string
  title: string
  description?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="text-center mb-14 md:mb-20"
    >
      <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
        {overline}
      </span>
      <h2 className="font-serif text-4xl md:text-6xl font-bold mt-4 mb-6 text-balance">{title}</h2>
      <div className="flex items-center justify-center gap-4">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
      </div>
      {description && (
        <p className="text-muted-foreground mt-8 max-w-2xl mx-auto leading-relaxed text-pretty">
          {description}
        </p>
      )}
    </motion.div>
  )
}

/** Primary contact actions. */
function QuickActions() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="pt-4 pb-20 md:pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Link
            href="/order"
            className="glass-card gold-border rounded-2xl p-7 text-center hover:border-[#c9a84c]/50 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={18} className="text-[#c9a84c]" />
            </div>
            <div className="text-sm font-semibold mb-1.5 group-hover:text-[#c9a84c] transition-colors">
              Order on WhatsApp
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              Build your order and send it in one tap
            </div>
          </Link>

          <a
            href={`tel:${restaurant.phones.reception.number}`}
            className="glass-card gold-border rounded-2xl p-7 text-center hover:border-[#c9a84c]/50 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mx-auto mb-4">
              <Phone size={18} className="text-[#c9a84c]" />
            </div>
            <div className="text-sm font-semibold mb-1.5 group-hover:text-[#c9a84c] transition-colors">
              Call Reception
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              {restaurant.phones.reception.display}
            </div>
          </a>

          <a
            href={restaurant.maps.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card gold-border rounded-2xl p-7 text-center hover:border-[#c9a84c]/50 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mx-auto mb-4">
              <Navigation size={18} className="text-[#c9a84c]" />
            </div>
            <div className="text-sm font-semibold mb-1.5 group-hover:text-[#c9a84c] transition-colors">
              Get Directions
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              Open in Google Maps
            </div>
          </a>

          <a
            href={restaurant.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card gold-border rounded-2xl p-7 text-center hover:border-[#c9a84c]/50 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mx-auto mb-4">
              <InstagramIcon size={18} className="text-[#c9a84c]" />
            </div>
            <div className="text-sm font-semibold mb-1.5 group-hover:text-[#c9a84c] transition-colors">
              Instagram
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              {restaurant.instagram.handle}
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

/** Full contact details beside the embedded map. */
function DetailsAndMap({ info, hours }: { info?: RestaurantInfo; hours?: OpeningHours }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const name = info?.name || restaurant.name
  const addressLine1 = info?.addressLine1 || restaurant.address.line1
  const addressLine2 = info?.addressLine2 || restaurant.address.line2
  const mapsUrl = info?.mapsUrl || restaurant.maps.directionsUrl

  const phones = [
    { display: info?.phoneReception || restaurant.phones.reception.display, label: restaurant.phones.reception.label },
    { display: info?.phoneChef || restaurant.phones.chef.display, label: restaurant.phones.chef.label },
    { display: info?.phoneAlt || restaurant.phones.alt.display, label: restaurant.phones.alt.label },
  ].filter((phone) => phone.display)

  const openLines = hours ? formatOpeningLine(hours) : null

  const infoCards = [
    {
      icon: MapPin,
      title: 'Location',
      content: (
        <>
          <div className="text-sm text-foreground leading-relaxed">{addressLine1}</div>
          <div className="text-sm text-foreground leading-relaxed">{addressLine2}</div>
          <div className="text-xs text-muted-foreground mt-1.5">{restaurant.address.nepali}</div>
          <div className="text-xs text-muted-foreground mt-1.5">{restaurant.address.mapsLine}</div>
        </>
      ),
    },
    {
      icon: Phone,
      title: 'Phone',
      content: (
        <div className="flex flex-col gap-1.5">
          {phones.map((p) => (
            <a
              key={p.display}
              href={`tel:${phoneHref(p.display, restaurant.phones.reception.number)}`}
              className="text-sm text-foreground hover:text-[#c9a84c] transition-colors"
            >
              {p.display}
              <span className="text-xs text-muted-foreground ml-2">({p.label})</span>
            </a>
          ))}
        </div>
      ),
    },
    {
      icon: Clock,
      title: 'Opening Hours',
      content: (
        <>
          <div className="text-sm text-foreground leading-relaxed">
            {openLines?.headline ?? 'Open daily'}
          </div>
          {openLines && openLines.days.length > 0 && (
            <div className="flex flex-col gap-0.5 mt-2">
              {openLines.days.map((entry) => (
                <div key={entry.day} className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">{entry.day}</span>
                  <span className={entry.closed ? 'text-muted-foreground' : 'text-foreground'}>
                    {entry.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {openLines?.note || restaurant.hoursNote}
          </div>
        </>
      ),
    },
    {
      icon: Bike,
      title: 'Services',
      content: (
        <div className="text-sm text-foreground leading-relaxed">
          {restaurant.services.join(' · ')}
        </div>
      ),
    },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <SectionHeading
          overline="Get in Touch"
          title="Visit Us"
          description="We are on the Rampur Highway at Devchuli-13, Daldale, in Nawalpur — easy to stop at whether you are passing through or coming from town."
        />

        <div ref={ref} className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            {infoCards.map((item) => (
              <div
                key={item.title}
                className="glass-card gold-border rounded-2xl p-6 md:p-7 flex items-start gap-4 hover:border-[#c9a84c]/40 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center shrink-0">
                  <item.icon size={16} className="text-[#c9a84c]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-medium">
                    {item.title}
                  </div>
                  {item.content}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="h-full min-h-[460px] lg:min-h-[560px] rounded-2xl overflow-hidden gold-border relative">
              <iframe
                src={restaurant.maps.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map showing ${name} in Devchuli, Nawalpur`}
                className="absolute inset-0 w-full h-full"
              />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 right-4 sm:right-auto glass-dark px-4 py-3 rounded-xl z-10 hover:border-[#c9a84c]/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#c9a84c] shrink-0" />
                  <span className="text-xs text-foreground font-medium">{name}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {addressLine1}, {addressLine2}
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** The three ways to get our food. */
function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const services = [
    {
      icon: UtensilsCrossed,
      title: 'Dine-in',
      desc: 'Table seating inside the restaurant for families, groups and travellers stopping on the highway.',
    },
    {
      icon: Bike,
      title: 'Home Delivery',
      desc: 'Home delivery is available around Devchuli. Tell us your address when you place the order.',
    },
    {
      icon: Package,
      title: 'Home Packing',
      desc: 'Takeaway and home packing for anything on the menu — call ahead and collect it hot.',
    },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.03] blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <SectionHeading
          overline="How We Serve You"
          title="Our Services"
          description="Three ways to eat with us, all confirmed on our shopfront sign."
        />

        <div ref={ref} className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="glass-card gold-border rounded-2xl p-8 md:p-9 text-center hover:border-[#c9a84c]/40 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mx-auto mb-6">
                <s.icon size={22} className="text-[#c9a84c]" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-4">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** WhatsApp ordering CTA with the restaurant photograph. */
function WhatsAppCta() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <div ref={ref} className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative h-[320px] md:h-[420px] rounded-2xl overflow-hidden gold-border"
          >
            <Image
              src={images.exteriorFlags}
              alt={`${restaurant.name} exterior`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ filter: 'brightness(1.12)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#c9a84c] font-medium">
              Fastest Way to Order
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mt-4 mb-6 text-balance">
              Order on WhatsApp
            </h2>
            <div className="section-divider mb-8" />
            <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg text-pretty">
              Pick your dishes, choose pickup or delivery, and send the order straight to our
              WhatsApp. We will reply to confirm it, the price and the timing.
            </p>
            <p className="text-xs text-muted-foreground mb-10 tracking-wide">
              Orders go to +{ORDER_WHATSAPP_NUMBER}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/order"
                className="btn-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={14} />
                Start Your Order
              </Link>
              <Link
                href="/menu"
                className="btn-outline-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center"
              >
                View Full Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default function ContactPageContent({
  info,
  hours,
}: {
  /** CMS-managed details; falls back to the verified static data. */
  info?: RestaurantInfo
  hours?: OpeningHours
}) {
  return (
    <>
      <PageHero
        overline="Devchuli-13, Daldale · Nawalpur"
        title="Contact"
        description="Call us, message us on WhatsApp, or find us on the Rampur Highway. Home delivery and home packing are available around Devchuli."
        image={images.exteriorWide}
        imageAlt={`Street view of ${restaurant.name}`}
      />

      <QuickActions />
      <DetailsAndMap info={info} hours={hours} />
      <Services />
      <WhatsAppCta />
    </>
  )
}
