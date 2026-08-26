'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

/** A photograph as rendered by this grid — matches `GalleryShot` from the CMS. */
export type GalleryTeaserShot = { id: string; src: string; alt: string }

export default function Gallery({ shots = [] }: { shots?: GalleryTeaserShot[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // First tile stays the large feature tile, preserving the original layout.
  const images = shots.map((shot, i) => ({
    ...shot,
    span: i === 0 ? 'md:col-span-2 md:row-span-2' : '',
  }))

  if (images.length === 0) return null

  const openLightbox = (i: number) => setLightboxIndex(i)
  const closeLightbox = () => setLightboxIndex(null)
  const prev = () => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0))
  const next = () => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0))

  return (
    <section id="gallery" className="py-32 md:py-44 px-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-64 rounded-full bg-[#c9a84c] opacity-[0.025] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 md:mb-24"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            Restaurant &amp; Food
          </span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mt-4 mb-6">Our Gallery</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto leading-relaxed text-pretty">
            Photographs taken at the restaurant — our shopfront, dining room, tandoor kitchen and
            the dishes we serve every day.
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px]">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              onClick={() => openLightbox(i)}
              className={`relative rounded-xl overflow-hidden cursor-pointer group gold-border hover:border-[#c9a84c]/40 transition-all duration-300 ${img.span}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center border border-[#c9a84c]/40">
                    <ZoomIn size={18} className="text-[#c9a84c]" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full glass-dark flex items-center justify-center border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors z-10"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={18} />
            </button>

            {/* Prev / Next */}
            <button
              className="absolute left-4 md:left-8 w-10 h-10 rounded-full glass-dark flex items-center justify-center border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="absolute right-4 md:right-8 w-10 h-10 rounded-full glass-dark flex items-center justify-center border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl h-[70vh] rounded-2xl overflow-hidden gold-border"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex].src}
                alt={images[lightboxIndex].alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </motion.div>

            {/* Caption */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest text-muted-foreground uppercase">
              {images[lightboxIndex].alt} — {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
