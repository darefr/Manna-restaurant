'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, MessageCircle, Bike, Flame, UtensilsCrossed } from 'lucide-react'
import PageHero from '@/components/PageHero'
import {
  menu as staticMenu,
  formatPrice,
  restaurant,
  images,
  signatureDishes,
  type MenuCategory,
} from '@/lib/restaurant'

/** Quick-jump chips to each category further down the page. */
function CategoryIndex({ menu }: { menu: MenuCategory[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="px-6 pb-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="glass-card gold-border rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-[10px] tracking-[0.35em] uppercase text-[#c9a84c] font-semibold text-center mb-6">
            Jump to a Section
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {menu.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className="px-4 md:px-5 py-2.5 rounded-full text-[10px] md:text-xs tracking-[0.15em] uppercase font-medium glass-card text-muted-foreground hover:text-[#c9a84c] gold-border hover:border-[#c9a84c]/40 transition-all duration-300"
              >
                {cat.label}
                <span className="ml-2 text-[#c9a84c]/70">{cat.items.length}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/** Three featured dishes, reusing the verified signature dish data. */
function FeaturedDishes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            Chef&apos;s Picks
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold mt-4 mb-6 text-balance">
            Featured Dishes
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-7 md:gap-8">
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
              <div className="p-6 md:p-7 flex flex-col flex-1">
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

/** One full category block: photo on one side, every priced item on the other. */
function CategoryBlock({ category, index }: { category: MenuCategory; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })
  const flip = index % 2 === 1

  return (
    <motion.section
      ref={ref}
      id={`cat-${category.id}`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="scroll-mt-28"
    >
      <div className="glass-card gold-border rounded-2xl overflow-hidden grid lg:grid-cols-5">
        {/* Photo */}
        <div
          className={`relative h-64 sm:h-80 lg:h-auto lg:min-h-[440px] lg:col-span-2 ${
            flip ? 'lg:order-2' : ''
          }`}
        >
          <Image
            src={category.image}
            alt={`${category.label} served at ${restaurant.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
            style={{ filter: 'brightness(1.1)' }}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent ${
              flip
                ? 'lg:bg-gradient-to-l lg:from-transparent lg:via-card/20 lg:to-card'
                : 'lg:bg-gradient-to-r lg:from-transparent lg:via-card/20 lg:to-card'
            }`}
          />
          <div className="absolute bottom-6 left-6 lg:top-8 lg:bottom-auto">
            <span className="font-serif text-3xl md:text-4xl font-bold text-foreground drop-shadow-lg">
              {category.label}
            </span>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#c9a84c] mt-2">
              {category.items.length} items
            </div>
          </div>
        </div>

        {/* Items */}
        <div className={`lg:col-span-3 p-6 sm:p-8 md:p-10 ${flip ? 'lg:order-1' : ''}`}>
          {category.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.5) }}
              className={`group flex items-start justify-between gap-4 py-4 border-b border-border/50 last:border-b-0 transition-all duration-300 ${
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
                {item.desc && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{item.desc}</p>
                )}
              </div>
              <div className="font-serif text-base md:text-lg font-bold text-[#c9a84c] whitespace-nowrap shrink-0">
                {formatPrice(item.price)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/** How to order — dine in, takeaway, delivery. All three are verified services. */
function HowToOrder() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  const ways = [
    {
      icon: UtensilsCrossed,
      title: 'Dine In',
      desc: 'Eat with us at the restaurant on the Rampur Highway in Devchuli-13, Daldale.',
    },
    {
      icon: Flame,
      title: 'Takeaway',
      desc: 'Home packing is available — call ahead and collect your order hot from the kitchen.',
    },
    {
      icon: Bike,
      title: 'Home Delivery',
      desc: 'Home delivery is available around Devchuli. Ask us when you place your order.',
    },
  ]

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            Three Ways to Enjoy
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold mt-4 mb-6 text-balance">
            How to Order
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 md:gap-8 mb-14">
          {ways.map((way, i) => (
            <motion.div
              key={way.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="glass-card gold-border rounded-2xl p-8 text-center hover:border-[#c9a84c]/40 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mx-auto mb-5">
                <way.icon size={22} className="text-[#c9a84c]" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3">{way.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{way.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
        >
          <Link
            href="/order"
            className="btn-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
          >
            <MessageCircle size={14} />
            Order on WhatsApp
          </Link>
          <a
            href={`tel:${restaurant.phones.reception.number}`}
            className="btn-outline-gold px-8 py-4 rounded-full text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2"
          >
            <Phone size={14} />
            {restaurant.phones.reception.display}
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default function MenuPageContent({
  menu = staticMenu,
}: {
  /** Live menu from the database; falls back to the printed-board data. */
  menu?: MenuCategory[]
}) {
  return (
    <>
      <PageHero
        overline={restaurant.subtitle}
        title="Our Menu"
        description="Every dish and every price below is taken directly from our in-restaurant menu board. Momo, tandoori, fried rice, chow mein, thukpa, sadeko snacks, khaja sets and sea food — all prices in Nepalese Rupees."
        image={images.menuBoardMain}
        imageAlt={`Printed menu board at ${restaurant.name}`}
      />

      <CategoryIndex menu={menu} />

      <FeaturedDishes />

      {/* Full menu, category by category */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute left-0 top-1/3 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.025] blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
              Full Price List
            </span>
            <h2 className="font-serif text-4xl md:text-6xl font-bold mt-4 mb-6 text-balance">
              Every Dish We Serve
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
            </div>
            <p className="text-muted-foreground mt-8 max-w-2xl mx-auto leading-relaxed text-pretty">
              {menu.reduce((n, c) => n + c.items.length, 0)} dishes across {menu.length} sections.
              Prices are as shown on our menu board and may change — please call to confirm
              availability.
            </p>
          </div>

          <div className="flex flex-col gap-10 md:gap-14">
            {menu.map((category, i) => (
              <CategoryBlock key={category.id} category={category} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Menu board photography */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#c9a84c] font-medium">
              From the Restaurant
            </span>
            <h3 className="font-serif text-3xl md:text-4xl font-bold mt-4">Our Menu Boards</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { src: images.menuBoardMain, alt: 'Printed menu board with momo and tandoori prices' },
              { src: images.menuBoardSecond, alt: 'Second printed menu board with rice and noodle prices' },
              { src: images.menuPoster, alt: 'Menu poster displayed inside the restaurant' },
            ].map((board) => (
              <div
                key={board.src}
                className="relative h-72 sm:h-80 rounded-2xl overflow-hidden gold-border"
              >
                <Image
                  src={board.src}
                  alt={board.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ filter: 'brightness(1.12)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowToOrder />
    </>
  )
}
