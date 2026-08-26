'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  name: string
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  onComplete?: (code: string) => void
}

/**
 * Six-box OTP entry with the behaviour people expect:
 *  - auto-advance and auto-focus
 *  - Backspace moves back through empty boxes
 *  - arrow-key navigation
 *  - full-code paste into any box
 *  - the joined value is submitted via one hidden input
 */
export default function OtpInput({
  name,
  length = 6,
  disabled = false,
  autoFocus = true,
  onComplete,
}: Props) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''))
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  const code = digits.join('')

  useEffect(() => {
    if (code.length === length && !digits.includes('')) onComplete?.(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const setAt = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '')
    if (!cleaned) {
      setAt(index, '')
      return
    }

    // Typing or pasting several digits fills forward from this box.
    if (cleaned.length > 1) {
      setDigits((prev) => {
        const next = [...prev]
        for (let offset = 0; offset < cleaned.length && index + offset < length; offset += 1) {
          next[index + offset] = cleaned[offset]
        }
        return next
      })
      const target = Math.min(index + cleaned.length, length - 1)
      refs.current[target]?.focus()
      return
    }

    setAt(index, cleaned)
    if (index < length - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (digits[index]) {
        setAt(index, '')
      } else if (index > 0) {
        setAt(index - 1, '')
        refs.current[index - 1]?.focus()
      }
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    event.preventDefault()
    handleChange(index, pasted.slice(0, length - index))
  }

  return (
    <div>
      <input type="hidden" name={name} value={code} />
      <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="Verification code">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element
            }}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={(event) => event.currentTarget.select()}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1}`}
            maxLength={length}
            className="h-13 w-11 rounded-lg border border-[#c9a84c]/25 bg-[#0d0d0d] text-center font-serif text-xl text-foreground outline-none transition-all focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/25 disabled:opacity-50 sm:h-15 sm:w-13 sm:text-2xl"
            style={{ height: '3.25rem' }}
          />
        ))}
      </div>
    </div>
  )
}
