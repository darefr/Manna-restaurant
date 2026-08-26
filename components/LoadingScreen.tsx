'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setIsLoading(false), 400)
          return 100
        }
        return prev + Math.random() * 12 + 5
      })
    }, 80)
    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
        >
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#c9a84c] opacity-[0.04] blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Logo */}
            <div className="flex flex-col items-center">
              {/* Decorative ring */}
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full border border-[#c9a84c]/20"
                  style={{
                    borderTopColor: '#c9a84c',
                    borderRightColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderLeftColor: 'transparent',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#c9a84c] font-serif text-2xl font-bold">M</span>
                </div>
              </div>
              <span className="font-serif text-3xl sm:text-4xl font-bold tracking-[0.25em] text-gradient-gold">
                MANNA
              </span>
              <span className="text-[10px] tracking-[0.35em] text-muted-foreground uppercase mt-1 text-center">
                Restaurant &amp; Tandoori
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-48 flex flex-col items-center gap-3">
              <div className="w-full h-px bg-border overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#9a7a2e] via-[#e8c96a] to-[#9a7a2e]"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] tracking-widest text-muted-foreground">
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
