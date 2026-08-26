'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Phone } from 'lucide-react'
import { restaurant } from '@/lib/restaurant'

// Custom Cursor
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    // Only on desktop
    if (window.matchMedia('(pointer: fine)').matches === false) return

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setTimeout(() => setRingPos({ x: e.clientX, y: e.clientY }), 80)
    }

    const handleOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      setIsHovering(el.closest('a,button,[role="button"]') !== null)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseover', handleOver)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseover', handleOver)
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div
        className="hidden lg:block fixed pointer-events-none z-[9999] rounded-full bg-[#c9a84c] transition-transform duration-75"
        style={{
          width: isHovering ? '16px' : '8px',
          height: isHovering ? '16px' : '8px',
          left: pos.x - (isHovering ? 8 : 4),
          top: pos.y - (isHovering ? 8 : 4),
          mixBlendMode: 'difference',
        }}
      />
      {/* Ring */}
      <div
        className="hidden lg:block fixed pointer-events-none z-[9998] rounded-full border border-[#c9a84c]/40 transition-all duration-200"
        style={{
          width: isHovering ? '50px' : '36px',
          height: isHovering ? '50px' : '36px',
          left: ringPos.x - (isHovering ? 25 : 18),
          top: ringPos.y - (isHovering ? 25 : 18),
        }}
      />
    </>
  )
}

// Back to top
function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full glass-dark border border-[#c9a84c]/30 flex items-center justify-center hover:border-[#c9a84c]/60 hover:bg-[#c9a84c]/10 transition-all duration-300 group"
          aria-label="Back to top"
        >
          <ArrowUp size={16} className="text-[#c9a84c] group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// Floating WhatsApp button
function WhatsAppButton() {
  return (
    <motion.a
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5, type: 'spring' }}
      href={`https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(
        `Hello ${restaurant.name}, I would like to book a table.`,
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center animate-pulse-gold shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
      aria-label="Contact us on WhatsApp"
    >
      {/* WhatsApp SVG icon */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </motion.a>
  )
}

// Floating call button — the fastest way to reach the restaurant
function CallButton() {
  return (
    <motion.a
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2.2, duration: 0.5, type: 'spring' }}
      href={`tel:${restaurant.phones.reception.number}`}
      className="fixed bottom-6 right-24 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl bg-[#c9a84c] text-background hover:bg-[#e8c96a] transition-colors"
      aria-label={`Call ${restaurant.name} on ${restaurant.phones.reception.display}`}
    >
      <Phone size={22} />
    </motion.a>
  )
}

export default function PremiumFeatures() {
  return (
    <>
      <CustomCursor />
      <BackToTop />
      <CallButton />
      <WhatsAppButton />
    </>
  )
}
