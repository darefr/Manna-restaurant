'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { MapPin, Star, Utensils } from 'lucide-react'
import { restaurant, reviewThemes } from '@/lib/restaurant'

/**
 * The Google listing for this restaurant does not publish review text, so this
 * section deliberately shows what the restaurant is known for rather than
 * invented customer names or quotations. Guests are linked to Google to read
 * and leave the real reviews.
 */
export default function Reviews() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section id="reviews" className="py-32 md:py-44 px-6 relative overflow-hidden">
      {/* Background */}
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
            Why Guests Come Back
          </span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mt-4 mb-6 text-balance">
            What We&apos;re Known For
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-pretty">
            Read what real guests say — and add your own review — on our Google listing.
          </p>
        </motion.div>

        {/* Theme cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewThemes.map((theme, i) => (
            <motion.div
              key={theme.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass-card gold-border rounded-2xl p-7 flex flex-col gap-4 hover:border-[#c9a84c]/35 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center">
                <Utensils size={16} className="text-[#c9a84c]" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">{theme.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{theme.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Google listing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 glass-card gold-border rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-[#c9a84c]" />
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Been to {restaurant.shortName}?
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Ratings and reviews live on our Google Maps listing.
              </div>
            </div>
          </div>
          <a
            href={restaurant.maps.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold px-7 py-3 rounded-full text-xs tracking-[0.2em] uppercase inline-flex items-center gap-2 shrink-0"
          >
            <MapPin size={14} />
            View on Google
          </a>
        </motion.div>
      </div>
    </section>
  )
}
