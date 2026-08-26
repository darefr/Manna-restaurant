'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Flame,
  Sparkles,
  Bike,
  MapPin,
  Navigation,
  Phone,
  UtensilsCrossed,
  Leaf,
  ShieldCheck,
} from 'lucide-react'
import PageHero from '@/components/PageHero'
import { restaurant, images, menu as staticMenu, type MenuCategory } from '@/lib/restaurant'
import type { OpeningHours, RestaurantInfo } from '@/lib/settings'
import { formatOpeningLine, phoneHref } from '@/lib/site-content'

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

/** Our story — two columns with the dining room photograph. */
function Story({ content }: { content?: { heading: string; body: string } }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const heading = content?.heading?.trim() || 'A Highway Kitchen in Devchuli'
  // Blank lines separate paragraphs, matching the admin content editor.
  const paragraphs = (content?.body ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const values = [
    { icon: Flame, title: 'Tandoor Kitchen', desc: 'Charcoal tandoori chicken, naan and roti made to order.' },
    { icon: Sparkles, title: 'Fresh & Hygienic', desc: 'Fresh, delicious and hygienic — the standard we cook to.' },
    { icon: Bike, title: 'Home Delivery', desc: 'Home delivery and home packing available around Devchuli.' },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <SectionHeading overline="Our Story" title="About Manna" />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative h-[400px] md:h-[560px] rounded-2xl overflow-hidden gold-border">
              <Image
                src={images.diningRoom}
                alt={`Indoor dining area at ${restaurant.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ filter: 'brightness(1.1)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-2 md:-right-6 glass-card p-5 md:p-6 rounded-2xl gold-border w-44 md:w-52">
              <div className="font-serif text-3xl md:text-4xl font-bold text-gradient-gold">
                {restaurant.address.city}
              </div>
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase mt-1">
                Ward 13, Daldale &middot; Nawalpur
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-[#c9a84c]/40 rounded-tl-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-balance">
              {heading}
            </h3>
            <div className="section-divider mb-8" />
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className={`text-muted-foreground leading-relaxed text-base md:text-lg text-pretty ${
                    i === paragraphs.length - 1 ? 'mb-10' : 'mb-6'
                  }`}
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <>
                <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg text-pretty">
                  {restaurant.name} is a local restaurant and tandoori kitchen on the Rampur Highway
                  at Devchuli-13, Daldale, in Nawalpur. We cook authentic Indian and Nepali food for
                  travellers stopping along the highway and for families from around the town.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg text-pretty">
                  Our kitchen covers the dishes people actually come back for — momo in eleven
                  varieties including jhol, afghani and tandoori momo, charcoal tandoori chicken,
                  naan and roti, chowmein, fried rice, thukpa, sadeko snacks and full khaja sets.
                  Everything is made to order in a clean kitchen, and our chef prepares the breads
                  fresh at the tandoor.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-10 text-base md:text-lg text-pretty">
                  Eat in at the restaurant, take your order away, or ask us about home delivery and
                  home packing around Devchuli. Simple, generous plates at everyday prices.
                </p>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="glass-card p-5 rounded-xl gold-border text-center"
                >
                  <v.icon size={22} className="text-[#c9a84c] mx-auto mb-3" />
                  <div className="text-xs font-semibold tracking-wide text-foreground mb-1.5">
                    {v.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{v.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** Atmosphere — three photographs of the restaurant itself. */
function Atmosphere() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const shots = [
    {
      src: images.storefront,
      alt: `${restaurant.name} shopfront on the Rampur Highway`,
      title: 'On the Highway',
      desc: 'Easy to find and easy to stop at, right on the Rampur Highway through Devchuli.',
    },
    {
      src: images.diningRoom,
      alt: `Indoor dining area at ${restaurant.name}`,
      title: 'Inside',
      desc: 'A simple, clean dining room with table seating for families and groups.',
    },
    {
      src: images.exteriorFlags,
      alt: `${restaurant.name} decorated with festival bunting`,
      title: 'Festival Days',
      desc: 'The restaurant dressed with bunting when the town is celebrating.',
    },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <SectionHeading
          overline="The Atmosphere"
          title="Our Restaurant"
          description="A roadside restaurant built for everyday eating — travellers breaking a journey, families out for momo, and groups sharing a khaja set."
        />

        <div ref={ref} className="grid md:grid-cols-3 gap-7 md:gap-8">
          {shots.map((shot, i) => (
            <motion.article
              key={shot.src}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group glass-card gold-border rounded-2xl overflow-hidden hover:border-[#c9a84c]/40 transition-all duration-500 hover:-translate-y-1.5"
            >
              <div className="relative h-64 md:h-72 overflow-hidden">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ filter: 'brightness(1.12)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="p-7">
                <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-[#c9a84c] transition-colors">
                  {shot.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {shot.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Philosophy — built from the three qualities printed on the menu board. */
function Philosophy() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const pillars = [
    {
      icon: Leaf,
      title: 'Fresh',
      desc: 'Dishes are cooked to order rather than held, so what reaches your table is made for you.',
    },
    {
      icon: UtensilsCrossed,
      title: 'Delicious',
      desc: 'Authentic Indian and Nepali flavours — momo, tandoori, sadeko and curry done properly.',
    },
    {
      icon: ShieldCheck,
      title: 'Hygienic',
      desc: 'A clean kitchen is the standard we hold ourselves to on every single service.',
    },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.03] blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <SectionHeading
          overline="What We Stand For"
          title="Our Philosophy"
          description={`Three words are printed on our menu board — ${restaurant.qualities.join(', ')}. They are the whole promise, and the tagline on our sign says the rest: "${restaurant.tagline}"`}
        />

        <div ref={ref} className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="glass-card gold-border rounded-2xl p-8 md:p-10 text-center hover:border-[#c9a84c]/40 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mx-auto mb-6">
                <p.icon size={26} className="text-[#c9a84c]" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4 text-gradient-gold">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Kitchen — chef photograph and the tandoor story. */
function Kitchen() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1"
          >
            <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
              In Our Kitchen
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mt-4 mb-6 text-balance">
              Fresh from the Tandoor
            </h2>
            <div className="section-divider mb-8" />
            <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg text-pretty">
              Our chef works the tandoor through service — stretching dough for naan and roti by hand
              and cooking it against the hot clay wall, so the bread reaches your table warm and
              blistered.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10 text-base md:text-lg text-pretty">
              The same tandoor gives our chicken roast, tandoori momo and grilled items their smoke
              and char. It is the part of the kitchen the restaurant is named for.
            </p>

            <div className="flex flex-wrap items-center gap-5 md:gap-6 mb-10">
              {restaurant.qualities.map((q, i) => (
                <div key={q} className="flex items-center gap-5 md:gap-6">
                  {i > 0 && <div className="w-px h-8 bg-border" aria-hidden="true" />}
                  <div className="text-base font-serif font-bold text-[#c9a84c] tracking-wide">
                    {q}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/chef"
              className="btn-outline-gold px-8 py-3.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-block"
            >
              Meet Our Chef
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative h-[400px] md:h-[540px] rounded-2xl overflow-hidden gold-border">
              <Image
                src={images.chef}
                alt={`Chef preparing fresh naan dough in the kitchen at ${restaurant.name}`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ filter: 'brightness(1.1)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b border-l border-[#c9a84c]/40 rounded-bl-2xl" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t border-r border-[#c9a84c]/40 rounded-tr-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** Location — address, services and directions. */
function Location({ info, hours }: { info?: RestaurantInfo; hours?: OpeningHours }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const openLines = hours ? formatOpeningLine(hours) : null
  const phones = [
    { display: info?.phoneReception || restaurant.phones.reception.display, label: restaurant.phones.reception.label },
    { display: info?.phoneChef || restaurant.phones.chef.display, label: restaurant.phones.chef.label },
    { display: info?.phoneAlt || restaurant.phones.alt.display, label: restaurant.phones.alt.label },
  ].filter((phone) => phone.display)

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          overline="Find Us"
          title="Our Location"
          description="We are on the Rampur Highway at Devchuli-13, Daldale, in Nawalpur district."
        />

        <div ref={ref} className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            <div className="glass-card gold-border rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-[#c9a84c]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-medium">
                    Address
                  </div>
                  <div className="text-sm text-foreground leading-relaxed">
                    {info?.addressLine1 || restaurant.address.line1}
                  </div>
                  <div className="text-sm text-foreground leading-relaxed">
                    {info?.addressLine2 || restaurant.address.line2}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    {restaurant.address.nepali}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    {restaurant.address.mapsLine}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card gold-border rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center shrink-0">
                  <Bike size={16} className="text-[#c9a84c]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-medium">
                    Services
                  </div>
                  <div className="text-sm text-foreground leading-relaxed">
                    {restaurant.services.join(' · ')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {openLines?.note || restaurant.hoursNote}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card gold-border rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-[#c9a84c]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-medium">
                    Phone
                  </div>
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
                </div>
              </div>
            </div>

            <a
              href={info?.mapsUrl || restaurant.maps.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-7 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
            >
              <Navigation size={14} />
              Get Directions
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="h-full min-h-[440px] rounded-2xl overflow-hidden gold-border relative">
              <iframe
                src={restaurant.maps.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map showing ${restaurant.name} in Devchuli, Nawalpur`}
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default function AboutPageContent({
  menu = staticMenu,
  info,
  hours,
  about,
}: {
  /** Live menu from the database; falls back to the printed-board data. */
  menu?: MenuCategory[]
  /** CMS-managed details; falls back to the verified static data. */
  info?: RestaurantInfo
  hours?: OpeningHours
  about?: { heading: string; body: string }
}) {
  const dishCount = menu.reduce((n, c) => n + c.items.length, 0)
  const name = info?.name || restaurant.name
  const subtitle = info?.subtitle || restaurant.subtitle

  return (
    <>
      <PageHero
        overline="Est. 2025 · Devchuli, Nawalpur"
        title="About Us"
        description={`${name} — ${subtitle.toLowerCase()} on the Rampur Highway, serving ${dishCount} dishes across ${menu.length} sections to travellers and families every day.`}
        image={images.storefront}
        imageAlt={`${name} shopfront`}
      />

      <Story content={about} />
      <Atmosphere />
      <Philosophy />
      <Kitchen />
      <Location info={info} hours={hours} />
    </>
  )
}
