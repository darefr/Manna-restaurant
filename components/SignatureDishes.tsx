'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { signatureDishes, formatPrice, restaurant } from '@/lib/restaurant'

type Dish = (typeof signatureDishes)[number]

function DishCard({ dish, index }: { dish: Dish; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="group relative glass-card rounded-2xl overflow-hidden gold-border hover:border-[#c9a84c]/40 transition-all duration-500 hover:-translate-y-2 hover:gold-glow flex flex-col"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={dish.image}
          alt={`${dish.name} at ${restaurant.name}`}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className="text-[9px] tracking-[0.25em] uppercase font-semibold px-3 py-1.5 rounded-full bg-[#c9a84c] text-background">
            {dish.tag}
          </span>
        </div>

        {/* Category */}
        <div className="absolute top-4 right-4">
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground glass-dark px-3 py-1.5 rounded-full">
            {dish.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-gradient-gold transition-all">
            {dish.name}
          </h3>
          <span className="font-serif text-xl font-bold text-[#c9a84c] shrink-0">
            {formatPrice(dish.price)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{dish.description}</p>

        {/* Divider */}
        <div className="section-divider mb-5" />

        <a
          href={`tel:${restaurant.phones.reception.number}`}
          className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#c9a84c] hover:gap-3 transition-all duration-300"
        >
          <Phone size={13} />
          <span>Call to Order</span>
        </a>
      </div>
    </motion.div>
  )
}

export default function SignatureDishes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section id="signature" className="py-32 md:py-44 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#c9a84c] opacity-[0.03] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 md:mb-24"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            What We Are Known For
          </span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mt-4 mb-6 text-balance">
            Signature Dishes
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto leading-relaxed text-pretty">
            Steamed and fried momo, charcoal tandoori and generous sharing platters — cooked fresh
            to order in our kitchen on the Rampur Highway.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {signatureDishes.map((dish, i) => (
            <DishCard key={dish.id} dish={dish} index={i} />
          ))}
        </div>

        {/* View full menu CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/menu"
            className="btn-outline-gold px-8 py-3.5 rounded-full text-xs tracking-[0.2em] uppercase w-full sm:w-auto inline-block"
          >
            Explore Full Menu
          </Link>
          <Link
            href="/order"
            className="btn-gold px-8 py-3.5 rounded-full text-xs tracking-[0.2em] uppercase w-full sm:w-auto inline-block"
          >
            Order on WhatsApp
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
