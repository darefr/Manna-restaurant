'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { MapPin, Phone, Clock, Bike, Navigation, MessageCircle } from 'lucide-react'
import { restaurant } from '@/lib/restaurant'
import type { OpeningHours, RestaurantInfo } from '@/lib/settings'
import { formatOpeningLine, phoneHref } from '@/lib/site-content'

export default function Contact({
  info,
  hours,
}: {
  /** CMS-managed details; falls back to the verified static data. */
  info?: RestaurantInfo
  hours?: OpeningHours
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const name = info?.name || restaurant.name
  const addressLine1 = info?.addressLine1 || restaurant.address.line1
  const addressLine2 = info?.addressLine2 || restaurant.address.line2
  const whatsapp = (info?.whatsapp || restaurant.whatsapp).replace(/\D/g, '')
  const mapsUrl = info?.mapsUrl || restaurant.maps.directionsUrl

  const phones = [
    { display: info?.phoneReception || restaurant.phones.reception.display, label: restaurant.phones.reception.label },
    { display: info?.phoneChef || restaurant.phones.chef.display, label: restaurant.phones.chef.label },
    { display: info?.phoneAlt || restaurant.phones.alt.display, label: restaurant.phones.alt.label },
  ].filter((phone) => phone.display)

  const receptionHref = phoneHref(phones[0]?.display, restaurant.phones.reception.number)
  const openLines = hours ? formatOpeningLine(hours) : null

  const infoCards = [
    {
      icon: MapPin,
      title: 'Location',
      content: (
        <>
          <div className="text-sm text-foreground leading-relaxed">{addressLine1}</div>
          <div className="text-sm text-foreground leading-relaxed">{addressLine2}</div>
          <div className="text-xs text-muted-foreground mt-1">{restaurant.address.nepali}</div>
          <div className="text-xs text-muted-foreground mt-1">{restaurant.address.mapsLine}</div>
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
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {openLines?.note || restaurant.hoursNote}
          </div>
        </>
      ),
    },
    {
      icon: Bike,
      title: 'Services',
      content: (
        <div className="text-sm text-foreground leading-relaxed">{restaurant.services.join(' · ')}</div>
      ),
    },
  ]

  return (
    <section id="contact" className="py-32 md:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 md:mb-24"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            Get in Touch
          </span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mt-4 mb-6">Visit Us</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-12"
        >
          <a
            href={`tel:${receptionHref}`}
            className="btn-gold px-7 py-3.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
          >
            <Phone size={14} />
            Call Now
          </a>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              `Hello ${name}, I would like to place an order.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold px-7 py-3.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold px-7 py-3.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
          >
            <Navigation size={14} />
            Get Directions
          </a>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            {infoCards.map((item) => (
              <div
                key={item.title}
                className="glass-card gold-border rounded-2xl p-6 flex items-start gap-4 hover:border-[#c9a84c]/40 transition-all duration-300"
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

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="h-full min-h-[420px] rounded-2xl overflow-hidden gold-border relative">
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
              {/* Map overlay label */}
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
