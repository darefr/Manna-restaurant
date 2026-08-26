'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ZoomIn, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { images as assets, restaurant } from '@/lib/restaurant'

/** Matches `GalleryShot` from the CMS gallery data layer. */
export type Shot = {
  id: string
  src: string
  alt: string
  group: 'restaurant' | 'food' | 'chef' | 'events'
}

/** A responsive photo grid. `feature` gives the first tile a larger span. */
function PhotoGrid({
  shots,
  offset,
  onOpen,
  feature = false,
}: {
  shots: Shot[]
  offset: number
  onOpen: (index: number) => void
  feature?: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] sm:auto-rows-[220px]"
    >
      {shots.map((shot, i) => (
        <motion.button
          key={shot.src}
          type="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.6) }}
          onClick={() => onOpen(offset + i)}
          aria-label={`Open image: ${shot.alt}`}
          className={`relative rounded-xl overflow-hidden cursor-pointer group gold-border hover:border-[#c9a84c]/40 transition-all duration-300 ${
            feature && i === 0 ? 'col-span-2 row-span-2' : ''
          }`}
        >
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ filter: 'brightness(1.08)' }}
          />
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center border border-[#c9a84c]/40">
                <ZoomIn size={18} className="text-[#c9a84c]" />
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function SectionHeading({
  overline,
  title,
  description,
}: {
  overline: string
  title: string
  description: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="text-center mb-14 md:mb-16"
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
      <p className="text-muted-foreground mt-8 max-w-2xl mx-auto leading-relaxed text-pretty">
        {description}
      </p>
    </motion.div>
  )
}

export default function GalleryPageContent({ shots = [] }: { shots?: Shot[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // "The Restaurant" covers the venue and the kitchen team; everything else
  // (food, events) belongs in the second section, matching the original split.
  const restaurantShots = shots.filter(
    (shot) => shot.group === 'restaurant' || shot.group === 'chef',
  )
  const foodShots = shots.filter((shot) => shot.group === 'food' || shot.group === 'events')
  const allShots = [...restaurantShots, ...foodShots]

  const count = allShots.length
  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(
    () => setLightboxIndex((p) => (p !== null && count > 0 ? (p - 1 + count) % count : null)),
    [count],
  )
  const next = useCallback(
    () => setLightboxIndex((p) => (p !== null && count > 0 ? (p + 1) % count : null)),
    [count],
  )

  // Keyboard controls for the lightbox.
  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, close, prev, next])

  return (
    <>
      <PageHero
        overline="Restaurant & Food Photography"
        title="Our Gallery"
        description={`${allShots.length} photographs taken at ${restaurant.name} — our shopfront, dining room, the tandoor kitchen and the dishes we cook every day.`}
        image={assets.exteriorWide}
        imageAlt={`Street view of ${restaurant.name}`}
      />

      {/* The restaurant */}
      {restaurantShots.length > 0 && (
        <section className="py-20 md:py-28 px-6 relative overflow-hidden">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[800px] h-64 rounded-full bg-[#c9a84c] opacity-[0.025] blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              overline="Where We Are"
              title="The Restaurant"
              description="Our shopfront on the Rampur Highway, the dining room inside, and the kitchen where every order is cooked to order."
            />
            <PhotoGrid shots={restaurantShots} offset={0} onOpen={setLightboxIndex} feature />
          </div>
        </section>
      )}

      {/* The food */}
      {foodShots.length > 0 && (
        <section className="py-20 md:py-28 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-charcoal/40" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

          <div className="relative max-w-7xl mx-auto">
            <SectionHeading
              overline="From Our Kitchen"
              title="The Food"
              description="Momo in every variety, charcoal tandoori, fried rice, chow mein, sadeko snacks, full khaja sets and sea food — photographed as it leaves our kitchen."
            />
            <PhotoGrid
              shots={foodShots}
              offset={restaurantShots.length}
              onOpen={setLightboxIndex}
              feature
            />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-balance">
            Hungry Yet?
          </h2>
          <div className="section-divider mx-auto mb-8" />
          <p className="text-muted-foreground leading-relaxed mb-10 text-pretty">
            Everything you see here is on our menu. Send us your order on WhatsApp, or browse the
            full price list first.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              href="/order"
              className="btn-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} />
              Order on WhatsApp
            </Link>
            <Link
              href="/menu"
              className="btn-outline-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && allShots[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/95 flex items-center justify-center p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full glass-dark flex items-center justify-center border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors z-10"
              onClick={close}
              aria-label="Close lightbox"
            >
              <X size={18} />
            </button>

            <button
              className="absolute left-3 md:left-8 w-10 h-10 rounded-full glass-dark flex items-center justify-center border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="absolute right-3 md:right-8 w-10 h-10 rounded-full glass-dark flex items-center justify-center border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl h-[68vh] md:h-[75vh] rounded-2xl overflow-hidden gold-border"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allShots[lightboxIndex].src}
                alt={allShots[lightboxIndex].alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 text-center text-[10px] sm:text-xs tracking-widest text-muted-foreground uppercase">
              {allShots[lightboxIndex].alt} — {lightboxIndex + 1} / {allShots.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
