'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Flame, Phone, MessageCircle, Hand, Soup, Drumstick } from 'lucide-react'
import PageHero from '@/components/PageHero'
import {
  restaurant,
  images,
  signatureDishes,
  formatPrice,
  menu as staticMenu,
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

/** Chef introduction — the real chef photograph beside the kitchen story. */
function ChefIntro({ menu }: { menu: MenuCategory[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute right-0 top-1/3 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.03] blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Chef photograph */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative h-[440px] md:h-[620px] rounded-2xl overflow-hidden gold-border">
              <Image
                src={images.chef}
                alt={`Chef stretching fresh naan dough at the tandoor in ${restaurant.name}`}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ filter: 'brightness(1.12)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>

            {/* Floating credential card — uses the verified kitchen phone line */}
            <div className="absolute -bottom-6 -right-2 md:-right-6 glass-card p-5 md:p-6 rounded-2xl gold-border w-52 md:w-60">
              <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1.5">
                {restaurant.phones.chef.label}
              </div>
              <a
                href={`tel:${restaurant.phones.chef.number}`}
                className="font-serif text-lg md:text-xl font-bold text-gradient-gold hover:underline"
              >
                {restaurant.phones.chef.display}
              </a>
              <div className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                Call the kitchen directly
              </div>
            </div>

            <div className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-[#c9a84c]/40 rounded-tl-2xl" />
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
              Meet the Kitchen
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4 mb-6 text-balance">
              The Hands Behind the Tandoor
            </h2>
            <div className="section-divider mb-8" />

            <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg text-pretty">
              Our chef runs the tandoor through every service. Dough for naan and roti is stretched
              by hand and slapped against the hot clay wall, so the bread comes out warm, blistered
              and ready to go straight to your table.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg text-pretty">
              The same tandoor is what gives our chicken roast, tandoori momo and grilled items their
              smoke and char. It is the part of the kitchen this restaurant is named for, and it is
              working from the moment we open.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10 text-base md:text-lg text-pretty">
              Alongside the tandoor, the kitchen turns out momo in eleven varieties, fried rice, chow
              mein, thukpa, sadeko snacks and full khaja sets — {' '}
              {menu.reduce((n, c) => n + c.items.length, 0)} dishes in all, each one cooked to order.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={`tel:${restaurant.phones.chef.number}`}
                className="btn-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
              >
                <Phone size={14} />
                Call the Kitchen
              </a>
              <Link
                href="/menu"
                className="btn-outline-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center"
              >
                See the Full Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** How the kitchen works — three verified practices. */
function FoodPhilosophy() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const principles = [
    {
      icon: Hand,
      title: 'Made by Hand',
      desc: 'Momo are filled and folded in the kitchen, and naan and roti dough is stretched by hand before it meets the tandoor.',
    },
    {
      icon: Flame,
      title: 'Cooked over Charcoal',
      desc: 'The tandoor runs on charcoal. It is what puts the smoke into our chicken roast, tandoori momo and grilled plates.',
    },
    {
      icon: Soup,
      title: 'Cooked to Order',
      desc: 'Nothing sits waiting. Every plate is started when you order it, which is why fresh is the first word on our menu board.',
    },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <SectionHeading
          overline="How We Cook"
          title="Food Philosophy"
          description={`"${restaurant.tagline}" — the line on our sign, and the way the kitchen is run.`}
        />

        <div ref={ref} className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {principles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="glass-card gold-border rounded-2xl p-8 md:p-9 hover:border-[#c9a84c]/40 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mb-6">
                <p.icon size={22} className="text-[#c9a84c]" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-4">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Signature dishes — the chef's three showcase plates. */
function SignatureDishesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.025] blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <SectionHeading
          overline="From the Chef"
          title="Signature Dishes"
          description="Three plates that show what this kitchen does best — all on the menu, at the prices on our board."
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
              <div className="relative h-64 md:h-72 overflow-hidden">
                <Image
                  src={dish.image}
                  alt={`${dish.name} prepared at ${restaurant.name}`}
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
                <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
                  {dish.category}
                </div>
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

/** A wider look at what leaves the kitchen. */
function FromTheKitchen() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const plates = [
    { src: images.kotheyMomo, alt: 'Pan-fried kothey momo with chilli chutney' },
    { src: images.chickenTikka, alt: 'Chicken tikka with capsicum and onion' },
    { src: images.chickenWings, alt: 'Chicken hot wings in chilli sauce' },
    { src: images.friedRice, alt: 'Fried rice topped with boiled egg' },
    { src: images.octopusChilli, alt: 'Octopus chilli from the sea food menu' },
    { src: images.curry, alt: 'Curry served at the restaurant' },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <SectionHeading
          overline="Off the Pass"
          title="From the Kitchen"
          description="A closer look at the plates our chef sends out during a normal service."
        />

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {plates.map((plate, i) => (
            <motion.div
              key={plate.src}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="relative h-52 sm:h-64 md:h-72 rounded-2xl overflow-hidden gold-border group"
            >
              <Image
                src={plate.src}
                alt={plate.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
                style={{ filter: 'brightness(1.1)' }}
              />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/gallery"
            className="btn-outline-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
          >
            <Drumstick size={14} />
            See the Full Gallery
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function ChefPageContent({
  menu = staticMenu,
}: {
  /** Live menu from the database; falls back to the printed-board data. */
  menu?: MenuCategory[]
}) {
  return (
    <>
      <PageHero
        overline="The Tandoor Kitchen"
        title="Our Chef"
        description="The tandoor is the heart of this restaurant. Meet the kitchen behind the momo, the charcoal grills and the breads that come out warm all day."
        image={images.chef}
        imageAlt={`Chef at the tandoor in ${restaurant.name}`}
      />

      <ChefIntro menu={menu} />
      <FoodPhilosophy />
      <SignatureDishesSection />
      <FromTheKitchen />

      {/* Closing CTA */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-balance">
            Let the Kitchen Cook for You
          </h2>
          <div className="section-divider mx-auto mb-8" />
          <p className="text-muted-foreground leading-relaxed mb-10 text-pretty">
            Send your order through WhatsApp and we will confirm it with you directly, or call the
            kitchen if you would rather talk it through.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              href="/order"
              className="btn-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} />
              Order on WhatsApp
            </Link>
            <a
              href={`tel:${restaurant.phones.chef.number}`}
              className="btn-outline-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
            >
              <Phone size={14} />
              {restaurant.phones.chef.display}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
