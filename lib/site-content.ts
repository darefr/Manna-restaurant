import type { OpeningHours } from './settings'

/**
 * Presentation helpers shared by the public components that render
 * CMS-managed restaurant details. Pure functions only — safe to import from
 * both server and client components.
 */

/** Builds a `tel:` target from a CMS-entered number, keeping a safe default. */
export function phoneHref(display: string | undefined, fallback: string): string {
  const digits = (display ?? '').replace(/[^\d+]/g, '')
  return digits.length >= 7 ? digits : fallback
}

/** Formats a 24-hour "HH:MM" value as a friendly 12-hour time. */
function formatTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim())
  if (!match) return value.trim()

  const hour = Number(match[1])
  const minute = match[2]
  if (!Number.isFinite(hour) || hour > 23) return value.trim()

  const suffix = hour >= 12 ? 'pm' : 'am'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return minute === '00' ? `${display}${suffix}` : `${display}:${minute}${suffix}`
}

export type OpeningSummary = {
  /** Short headline, e.g. "Open daily 10am – 9pm" or "Open daily". */
  headline: string
  /** Free-text note from the CMS, shown underneath. */
  note: string
  /** Per-day breakdown, empty when the admin has not filled the schedule in. */
  days: Array<{ day: string; label: string; closed: boolean }>
}

/**
 * Turns CMS opening hours into display strings. When no times have been
 * entered the original "Open daily" headline and note are preserved, so the
 * public site reads exactly as before until an admin fills the schedule in.
 */
export function formatOpeningLine(hours: OpeningHours): OpeningSummary {
  const days = (hours.days ?? []).map((entry) => ({
    day: entry.day,
    label: entry.closed
      ? 'Closed'
      : entry.open && entry.close
        ? `${formatTime(entry.open)} – ${formatTime(entry.close)}`
        : '',
    closed: entry.closed,
  }))

  const filled = days.filter((entry) => entry.label)
  const openDays = days.filter((entry) => !entry.closed && entry.label)

  // Every open day shares the same window — collapse to a single line.
  const uniqueWindows = new Set(openDays.map((entry) => entry.label))
  const headline =
    filled.length === 0
      ? 'Open daily'
      : openDays.length === 0
        ? 'Currently closed'
        : uniqueWindows.size === 1 && openDays.length === days.length
          ? `Open daily ${openDays[0].label}`
          : 'See our weekly hours'

  return { headline, note: hours.note ?? '', days: filled.length > 0 ? days : [] }
}
