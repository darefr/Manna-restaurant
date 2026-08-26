'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

/**
 * Tall, immersive header used at the top of every dedicated page.
 * Reuses the homepage design language: gold overline, serif display title,
 * centred divider and a darkened photographic backdrop.
 */
export default function PageHero({
  overline,
  title,
  description,
  image,
  imageAlt,
}: {
  overline: string
  title: string
  description: string
  image: string
  imageAlt: string
}) {
  return (
    <section className="relative min-h-[62vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 px-6">
      {/* Photographic backdrop */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          style={{ filter: 'brightness(1.18) contrast(1.04) saturate(1.06)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <div className="hidden sm:block h-px w-12 bg-gradient-to-r from-transparent to-[#c9a84c]" />
          <span className="text-[9px] sm:text-[10px] tracking-[0.35em] sm:tracking-[0.45em] text-[#c9a84c] uppercase font-medium text-balance">
            {overline}
          </span>
          <div className="hidden sm:block h-px w-12 bg-gradient-to-l from-transparent to-[#c9a84c]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="font-serif font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-balance"
        >
          <span className="gold-shimmer-text">{title}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base md:text-lg text-muted-foreground leading-relaxed mt-8 max-w-2xl mx-auto text-pretty"
        >
          {description}
        </motion.p>
      </div>
    </section>
  )
}
