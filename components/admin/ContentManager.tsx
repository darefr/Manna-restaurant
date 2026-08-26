'use client'

import { useActionState } from 'react'

import {
  saveAboutContentAction,
  saveOpeningHoursAction,
  saveRestaurantInfoAction,
  type CmsActionState,
} from '@/app/actions/admin-cms'
import type { OpeningHours, RestaurantInfo } from '@/lib/settings'

const initial: CmsActionState = { status: 'idle' }

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[#c9a84c]'

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = 'text',
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  type?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  )
}

function Status({ state }: { state: CmsActionState }) {
  if (state.status === 'error') return <p className="text-sm text-red-300">{state.message}</p>
  if (state.status === 'success')
    return <p className="text-sm text-emerald-300">{state.message}</p>
  return null
}

function SaveButton({ pending, label = 'Save changes' }: { pending: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-lg bg-[#c9a84c] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
    >
      {pending ? 'Saving…' : label}
    </button>
  )
}

export default function ContentManager({
  info,
  hours,
  about,
}: {
  info: RestaurantInfo
  hours: OpeningHours
  about: { heading: string; body: string }
}) {
  const [infoState, infoAction, infoPending] = useActionState(saveRestaurantInfoAction, initial)
  const [hoursState, hoursAction, hoursPending] = useActionState(saveOpeningHoursAction, initial)
  const [aboutState, aboutAction, aboutPending] = useActionState(saveAboutContentAction, initial)

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------ restaurant details */}
      <form
        action={infoAction}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-5"
      >
        <h2 className="font-serif text-lg text-beige">Restaurant details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" defaultValue={info.name} />
          <Field label="Tagline" name="tagline" defaultValue={info.tagline} />
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Subtitle
            </span>
            <textarea
              name="subtitle"
              rows={2}
              defaultValue={info.subtitle}
              className={`${inputClass} resize-none`}
            />
          </label>

          <Field label="Address line 1" name="addressLine1" defaultValue={info.addressLine1} />
          <Field label="Address line 2" name="addressLine2" defaultValue={info.addressLine2} />

          <Field label="Reception phone" name="phoneReception" defaultValue={info.phoneReception} />
          <Field label="Chef phone" name="phoneChef" defaultValue={info.phoneChef} />
          <Field label="Alternate phone" name="phoneAlt" defaultValue={info.phoneAlt} />
          <Field label="WhatsApp number" name="whatsapp" defaultValue={info.whatsapp} />

          <Field label="Contact email" name="email" type="email" defaultValue={info.email} />
          <Field label="Instagram URL" name="instagram" defaultValue={info.instagram} />
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Google Maps directions URL
            </span>
            <input name="mapsUrl" defaultValue={info.mapsUrl} className={inputClass} />
          </label>
        </div>

        <Status state={infoState} />
        <SaveButton pending={infoPending} />
      </form>

      {/* ---------------------------------------------------- opening hours */}
      <form
        action={hoursAction}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-5"
      >
        <h2 className="font-serif text-lg text-beige">Opening hours</h2>

        <div className="flex flex-col gap-2">
          {hours.days.map((day) => (
            <div
              key={day.day}
              className="grid grid-cols-[7rem_1fr_1fr_auto] items-center gap-3 rounded-lg border border-white/5 px-3 py-2"
            >
              <span className="text-sm text-beige">{day.day}</span>
              <input
                type="time"
                name={`${day.day}-open`}
                defaultValue={day.open}
                aria-label={`${day.day} opening time`}
                className={inputClass}
              />
              <input
                type="time"
                name={`${day.day}-close`}
                defaultValue={day.close}
                aria-label={`${day.day} closing time`}
                className={inputClass}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  name={`${day.day}-closed`}
                  defaultChecked={day.closed}
                  className="h-4 w-4 accent-[#c9a84c]"
                />
                Closed
              </label>
            </div>
          ))}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Public note
          </span>
          <input
            name="note"
            defaultValue={hours.note}
            placeholder="Open daily for lunch and dinner"
            className={inputClass}
          />
        </label>

        <Status state={hoursState} />
        <SaveButton pending={hoursPending} />
      </form>

      {/* ----------------------------------------------------- about content */}
      <form
        action={aboutAction}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-5"
      >
        <h2 className="font-serif text-lg text-beige">About section</h2>

        <Field label="Heading" name="heading" defaultValue={about.heading} />

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Body</span>
          <textarea
            name="body"
            rows={6}
            defaultValue={about.body}
            placeholder="Tell guests the Manna story…"
            className={`${inputClass} resize-y`}
          />
        </label>

        <Status state={aboutState} />
        <SaveButton pending={aboutPending} />
      </form>
    </div>
  )
}
