'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Phone, Utensils } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { heroSlides, restaurant } from '@/lib/restaurant'

const SLIDE_DURATION = 5000

export default function Hero() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length)
    }, SLIDE_DURATION)
    return () => clearInterval(id)
  }, [])

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen md:min-h-[105vh] lg:min-h-[112vh] flex items-center justify-center overflow-hidden py-28"
    >
      {/* Cinematic background slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.6, ease: 'easeInOut' },
              scale: { duration: SLIDE_DURATION / 1000 + 1.6, ease: 'linear' },
            }}
            className="absolute inset-0"
          >
            <Image
              src={heroSlides[index].src}
              alt={heroSlides[index].alt}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="100vw"
              // Lifts the photography without blowing out highlights, so the
              // food and shopfront detail stay readable behind the overlay.
              style={{ filter: 'brightness(1.32) contrast(1.05) saturate(1.08)' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Multi-layer overlay keeps the type legible while letting more of the
            photograph show through than before. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/45 to-background/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-transparent to-background/55" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full bg-[#c9a84c]"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              boxShadow: '0 0 6px 2px rgba(201,168,76,0.6)',
            }}
            animate={{ y: [-20, 20, -20], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="hidden sm:block h-px w-12 bg-gradient-to-r from-transparent to-[#c9a84c]" />
          <span className="text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] text-[#c9a84c] uppercase font-medium text-balance">
            {restaurant.subtitle}
          </span>
          <div className="hidden sm:block h-px w-12 bg-gradient-to-l from-transparent to-[#c9a84c]" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-serif font-bold leading-[0.95] tracking-tight text-balance mb-6"
        >
          <span className="block gold-shimmer-text text-7xl sm:text-8xl md:text-9xl lg:text-[150px] xl:text-[170px]">
            Manna
          </span>
          <span className="block text-foreground text-2xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 md:mt-4 tracking-[0.05em]">
            Restaurant and Tandoori
          </span>
        </motion.h1>

        {/* Location + tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-3 tracking-wide text-pretty"
        >
          {restaurant.tagline}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-xs md:text-base text-[#c9a84c]/90 tracking-[0.2em] uppercase mb-14 md:mb-16"
        >
          {restaurant.address.line1} &middot; {restaurant.address.line2}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/menu"
            className="btn-gold px-10 py-4.5 rounded-full text-sm md:text-base font-semibold tracking-[0.2em] uppercase w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center gap-2"
          >
            <Utensils size={16} />
            View Our Menu
          </Link>
          <a
            href={`tel:${restaurant.phones.reception.number}`}
            className="btn-outline-gold px-10 py-4.5 rounded-full text-sm md:text-base font-semibold tracking-[0.2em] uppercase w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            Call to Order
          </a>
        </motion.div>

        {/* Verified facts bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 md:mt-24 flex flex-wrap items-center justify-center gap-10 md:gap-20"
        >
          {[
            { value: '11', label: 'Momo Varieties' },
            { value: 'Rs. 110+', label: 'Everyday Plates' },
            { value: 'Home', label: 'Delivery Available' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-3xl md:text-5xl font-bold text-gradient-gold">{stat.value}</div>
              <div className="text-[9px] md:text-[11px] tracking-[0.2em] text-muted-foreground uppercase mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}: ${slide.alt}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? 'w-8 bg-[#c9a84c]' : 'w-1.5 bg-[#c9a84c]/35 hover:bg-[#c9a84c]/60'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => scrollTo('#signature')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-[#c9a84c] transition-colors"
        aria-label="Scroll down"
      >
        <span className="text-[9px] tracking-[0.4em] uppercase">Discover</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-[#c9a84c]" />
        </motion.div>
      </motion.button>
    </section>
  )
}
