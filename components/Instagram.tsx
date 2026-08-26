'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { restaurant, images as assets } from '@/lib/restaurant'

const InstagramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const posts = [
  { src: assets.jholMomo, caption: 'Jhol momo, served hot in spiced broth.' },
  { src: assets.tandooriChicken, caption: 'Chicken roast straight from the tandoor.' },
  { src: assets.kotheyMomo, caption: 'Kothey momo, crisp on the bottom.' },
  { src: assets.khajaPlatterClose, caption: 'The chicken khaja set, built for sharing.' },
  { src: assets.chickenTikka, caption: 'Chicken tikka with charred capsicum and onion.' },
  { src: assets.friedRice, caption: 'Fried rice, topped with boiled egg.' },
]

export default function Instagram() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section id="instagram" className="py-32 md:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 md:mb-24"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <InstagramIcon size={20} className="text-[#c9a84c]" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#c9a84c] font-medium">Follow Our Story</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold mb-6 break-words">
            <a
              href={restaurant.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gradient-gold transition-all"
            >
              {restaurant.instagram.handle}
            </a>
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-muted-foreground mt-6">
            Tag us in your experience for a chance to be featured.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {posts.map((post, i) => (
            <motion.a
              key={i}
              href={restaurant.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer gold-border hover:border-[#c9a84c]/40 transition-all"
            >
              <Image
                src={post.src}
                alt={post.caption}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 16vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/70 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3">
                <InstagramIcon size={20} className="text-[#c9a84c] opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-[10px] text-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity leading-relaxed">
                  {post.caption}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href={restaurant.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs tracking-[0.2em] uppercase"
          >
            <InstagramIcon size={14} />
            Follow on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  )
}
