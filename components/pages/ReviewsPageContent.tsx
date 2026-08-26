'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Utensils, MessageCircle, Camera as InstagramIcon } from 'lucide-react'
import PageHero from '@/components/PageHero'
import {
  restaurant,
  reviewThemes,
  images,
  menu as staticMenu,
  signatureDishes,
  formatPrice,
  type MenuCategory,
} from '@/lib/restaurant'

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

/**
 * Themes the restaurant is known for. The Google listing publishes no review
 * text, so no customer names or quotations are invented here.
 */
function Themes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute left-0 top-1/3 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.025] blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <SectionHeading
          overline="Why Guests Come Back"
          title="What We're Known For"
          description="Our Google listing does not publish written reviews, so rather than invent quotations we have set out honestly what guests keep coming back for."
        />

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reviewThemes.map((theme, i) => (
            <motion.div
              key={theme.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass-card gold-border rounded-2xl p-8 md:p-9 flex flex-col gap-5 hover:border-[#c9a84c]/35 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center">
                <Utensils size={18} className="text-[#c9a84c]" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold">{theme.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty">
                {theme.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Most-ordered plates, with real prices from the menu. */
function GuestFavourites() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <SectionHeading
          overline="Guest Favourites"
          title="What People Order"
          description="The three plates that define this kitchen, at the prices printed on our menu board."
        />

        <div ref={ref} className="grid md:grid-cols-3 gap-7 md:gap-8">
          {signatureDishes.map((dish, i) => (
            <motion.article
              key={dish.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group glass-card gold-border rounded-2xl overflow-hidden hover:border-[#c9a84c]/40 transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
            >
              <div className="relative h-60 md:h-64 overflow-hidden">
                <Image
                  src={dish.image}
                  alt={`${dish.name} at ${restaurant.name}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ filter: 'brightness(1.08)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <span className="absolute top-4 left-4 text-[8px] tracking-[0.2em] uppercase font-semibold px-3 py-1.5 rounded-full glass-dark text-[#c9a84c] border border-[#c9a84c]/30">
                  {dish.tag}
                </span>
              </div>
              <div className="p-7 flex flex-col flex-1">
                <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-[#c9a84c] transition-colors">
                  {dish.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1 text-pretty">
                  {dish.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="font-serif text-2xl font-bold text-gradient-gold">
                    {formatPrice(dish.price)}
                  </span>
                  <Link
                    href="/order"
                    className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] hover:underline"
                  >
                    Order
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Verified facts about the restaurant, presented as a stat band. */
function AtAGlance({ menu }: { menu: MenuCategory[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const momoCount = menu.find((c) => c.id === 'momo')?.items.length ?? 0
  const dishCount = menu.reduce((n, c) => n + c.items.length, 0)
  const prices = menu.flatMap((c) => c.items.map((i) => i.price))
  // Guard against an empty catalogue so the band never renders Infinity.
  const min = prices.length > 0 ? Math.min(...prices) : 0
  const max = prices.length > 0 ? Math.max(...prices) : 0

  const stats = [
    { value: String(dishCount), label: 'Dishes on the Menu' },
    { value: String(momoCount), label: 'Momo Varieties' },
    { value: String(menu.length), label: 'Menu Sections' },
    { value: `Rs. ${min}–${max}`, label: 'Price Range' },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto">
        <SectionHeading
          overline="The Numbers"
          title="At a Glance"
          description="Everything below is counted directly from our printed menu board."
        />

        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card gold-border rounded-2xl p-7 md:p-8 text-center hover:border-[#c9a84c]/40 transition-all duration-300"
            >
              <div className="font-serif text-3xl md:text-4xl font-bold text-gradient-gold">
                {stat.value}
              </div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mt-3 leading-relaxed">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Leave a review — links out to the real Google listing and Instagram. */
function LeaveAReview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <div ref={ref} className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative h-[340px] md:h-[440px] rounded-2xl overflow-hidden gold-border"
          >
            <Image
              src={images.storefront}
              alt={`${restaurant.name} shopfront in Devchuli`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ filter: 'brightness(1.12)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="flex items-center gap-1.5 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="text-[#c9a84c] fill-[#c9a84c]" />
              ))}
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-balance">
              Eaten With Us?
            </h2>
            <div className="section-divider mb-8" />
            <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg text-pretty">
              Reviews from real guests are the most useful thing for a small restaurant on a highway.
              If you have eaten with us, please leave your honest review on our Google listing — and
              read what others have said there too.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10 text-base md:text-lg text-pretty">
              You can also follow the kitchen day to day on Instagram at{' '}
              <span className="text-[#c9a84c]">{restaurant.instagram.handle}</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={restaurant.maps.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
              >
                <MapPin size={14} />
                Review on Google
              </a>
              <a
                href={restaurant.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
              >
                <InstagramIcon size={14} />
                Instagram
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default function ReviewsPageContent({
  menu = staticMenu,
}: {
  /** Live menu from the database; falls back to the printed-board data. */
  menu?: MenuCategory[]
}) {
  return (
    <>
      <PageHero
        overline="Guest Feedback"
        title="Reviews"
        description="What guests keep coming back to Manna Restaurant and Tandoori for — and where to read and leave the real reviews."
        image={images.khajaPlatter}
        imageAlt={`Chicken khaja set platter at ${restaurant.name}`}
      />

      <Themes />
      <GuestFavourites />
      <AtAGlance menu={menu} />
      <LeaveAReview />

      {/* Closing CTA */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-balance">
            Try It for Yourself
          </h2>
          <div className="section-divider mx-auto mb-8" />
          <p className="text-muted-foreground leading-relaxed mb-10 text-pretty">
            Order the jhol momo, the chicken roast or a full khaja set and tell us what you think.
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
    </>
  )
}
