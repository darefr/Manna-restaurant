'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Phone } from 'lucide-react'
import {
  menu as staticMenu,
  formatPrice,
  restaurant,
  type MenuCategory,
  type MenuItem as MenuItemType,
} from '@/lib/restaurant'

function MenuItem({ item, index }: { item: MenuItemType; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className={`group flex items-start justify-between gap-4 py-4 border-b border-border/50 transition-all duration-300 ${
        item.soldOut ? 'opacity-55' : 'hover:border-[#c9a84c]/30'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h4
            className={`font-serif text-base md:text-lg font-semibold text-foreground transition-colors ${
              item.soldOut ? 'line-through decoration-1' : 'group-hover:text-[#c9a84c]'
            }`}
          >
            {item.name}
          </h4>
          {item.soldOut ? (
            <span className="text-[8px] tracking-[0.2em] uppercase font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              Sold out
            </span>
          ) : (
            item.tag && (
              <span className="text-[8px] tracking-[0.2em] uppercase font-semibold px-2.5 py-1 rounded-full bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/25">
                {item.tag}
              </span>
            )
          )}
        </div>
        {item.desc && <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{item.desc}</p>}
      </div>
      <div className="font-serif text-base md:text-lg font-bold text-[#c9a84c] whitespace-nowrap shrink-0">
        {formatPrice(item.price)}
      </div>
    </motion.div>
  )
}

export default function Menu({
  menu = staticMenu,
}: {
  /** Live menu from the database; falls back to the printed-board data. */
  menu?: MenuCategory[]
}) {
  const [activeId, setActiveId] = useState(menu[0]?.id ?? '')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const active = menu.find((c) => c.id === activeId) ?? menu[0]

  // Nothing to show if every category was hidden in the CMS.
  if (!active) return null

  return (
    <section id="menu" className="py-32 md:py-44 px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.025] blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 md:mb-24"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            Indian &amp; Nepali Kitchen
          </span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mt-4 mb-6">Our Menu</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto leading-relaxed text-pretty">
            All prices in Nepalese Rupees, as listed on our in-restaurant menu board. Dine in, take
            away, or ask about home delivery around Devchuli.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-12 flex-wrap"
        >
          {menu.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveId(cat.id)}
              aria-pressed={activeId === cat.id}
              className={`px-4 md:px-5 py-2.5 rounded-full text-[10px] md:text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300 ${
                activeId === cat.id
                  ? 'bg-[#c9a84c] text-background shadow-lg shadow-[#c9a84c]/20'
                  : 'glass-card text-muted-foreground hover:text-[#c9a84c] gold-border hover:border-[#c9a84c]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Menu panel */}
        <div className="glass-card rounded-2xl gold-border overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-5"
            >
              {/* Category photo */}
              <div className="relative h-48 md:h-auto md:col-span-2 min-h-[220px]">
                <Image
                  src={active.image}
                  alt={`${active.label} served at ${restaurant.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent md:bg-gradient-to-r md:from-transparent md:via-card/20 md:to-card" />
                <div className="absolute bottom-4 left-5 md:top-5 md:bottom-auto">
                  <span className="font-serif text-2xl font-bold text-foreground drop-shadow-lg">
                    {active.label}
                  </span>
                  <div className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mt-1">
                    {active.items.length} items
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="md:col-span-3 p-6 md:p-8">
                {active.items.map((item, i) => (
                  <MenuItem key={item.name} item={item} index={i} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer note */}
          <div className="px-6 md:px-8 py-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground tracking-wide text-center sm:text-left">
              Prices as shown on our menu board and may change. Please call to confirm availability.
            </p>
            <a
              href={`tel:${restaurant.phones.reception.number}`}
              className="btn-gold px-6 py-2.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center gap-2 shrink-0"
            >
              <Phone size={13} />
              Order Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
