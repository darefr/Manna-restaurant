'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { Flame, Sparkles, Bike } from 'lucide-react'
import { restaurant, images } from '@/lib/restaurant'

const values = [
  {
    icon: Flame,
    title: 'Tandoor Kitchen',
    desc: 'Charcoal tandoori chicken, naan and roti made to order.',
  },
  {
    icon: Sparkles,
    title: 'Fresh & Hygienic',
    desc: 'Fresh, delicious and hygienic — the standard we cook to.',
  },
  {
    icon: Bike,
    title: 'Home Delivery',
    desc: 'Home delivery and home packing available around Devchuli.',
  },
]

export default function About({
  content,
}: {
  /** CMS-managed about copy; blank fields keep the original story below. */
  content?: { heading: string; body: string }
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const heading = content?.heading?.trim() || 'About Manna'
  // Blank lines separate paragraphs, matching the admin content editor.
  const paragraphs = (content?.body ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <section id="about" className="py-32 md:py-44 px-6 relative overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 md:mb-24"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            Our Story
          </span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mt-4 mb-6 text-balance">
            {heading}
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24 md:mb-28">
          {/* Left: Restaurant image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative h-[380px] md:h-[500px] rounded-2xl overflow-hidden gold-border">
              <Image
                src={images.diningRoom}
                alt={`Indoor dining area at ${restaurant.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-2 md:-right-6 glass-card p-5 md:p-6 rounded-2xl gold-border w-44 md:w-48">
              <div className="font-serif text-3xl md:text-4xl font-bold text-gradient-gold">
                {restaurant.address.city}
              </div>
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase mt-1">
                Ward 13, Daldale &middot; Nawalpur
              </div>
            </div>
            {/* Gold accent line */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-[#c9a84c]/40 rounded-tl-2xl" />
          </motion.div>

          {/* Right: Story */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className={`text-muted-foreground leading-relaxed text-base text-pretty ${
                    i === paragraphs.length - 1 ? 'mb-8' : 'mb-6'
                  }`}
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <>
                <p className="text-muted-foreground leading-relaxed mb-6 text-base text-pretty">
                  {restaurant.name} is a local restaurant and tandoori kitchen on the Rampur Highway
                  at Devchuli-13, Daldale, in Nawalpur. We cook authentic Indian and Nepali food for
                  travellers stopping along the highway and for families from around the town.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 text-base text-pretty">
                  Our kitchen covers the dishes people actually come back for — momo in eleven
                  varieties including jhol, afghani and tandoori momo, charcoal tandoori chicken,
                  naan and roti, chowmein, fried rice, thukpa, sadeko snacks and full khaja sets.
                  Everything is made to order in a clean kitchen, and our chef prepares the breads
                  fresh at the tandoor.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8 text-base text-pretty">
                  Eat in at the restaurant, take your order away, or ask us about home delivery and
                  home packing around Devchuli. Simple, generous plates at everyday prices.
                </p>
              </>
            )}

            {/* Values */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="glass-card p-4 rounded-xl gold-border text-center"
                >
                  <v.icon size={20} className="text-[#c9a84c] mx-auto mb-2" />
                  <div className="text-xs font-semibold tracking-wide text-foreground mb-1">{v.title}</div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed">{v.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Kitchen section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Kitchen text */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1"
          >
            <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
              In Our Kitchen
            </span>
            <h3 className="font-serif text-3xl md:text-5xl font-bold mt-3 mb-6 text-balance">
              Fresh from
              <br />
              the Tandoor
            </h3>
            <div className="section-divider mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4 text-pretty">
              Our chef works the tandoor through service — stretching dough for naan and roti by
              hand and cooking it against the hot clay wall, so the bread reaches your table warm
              and blistered.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
              The same tandoor gives our chicken roast, tandoori momo and grilled items their smoke
              and char. It is the part of the kitchen the restaurant is named for.
            </p>

            <div className="flex flex-wrap items-center gap-5 md:gap-6">
              {restaurant.qualities.map((q, i) => (
                <div key={q} className="flex items-center gap-5 md:gap-6">
                  {i > 0 && <div className="w-px h-8 bg-border" aria-hidden="true" />}
                  <div className="text-sm font-serif font-bold text-[#c9a84c] tracking-wide">{q}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Chef image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative h-[380px] md:h-[480px] rounded-2xl overflow-hidden gold-border">
              <Image
                src={images.chef}
                alt={`Chef preparing fresh naan dough in the kitchen at ${restaurant.name}`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            {/* Decorative corner */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b border-l border-[#c9a84c]/40 rounded-bl-2xl" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t border-r border-[#c9a84c]/40 rounded-tr-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
