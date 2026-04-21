"use client"

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react"
import { PersonalDataConsent } from "@/components/PersonalDataConsent"
import { formatCisPhone, getCisPhoneValidationError } from "@/lib/phoneMasks"

type BookingFormField = "name" | "phone" | "email" | "message" | "personalDataConsent"

type BookingFormErrors = Partial<Record<BookingFormField, string>>

export type BookingFormState = {
  ok: boolean
  message: string
  fieldErrors?: BookingFormErrors
} | null

type BookingFormProps = {
  action: (state: BookingFormState, formData: FormData) => Promise<BookingFormState>
  formToken: string
}

const baseFieldClass =
  "h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"

const invalidFieldClass = "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100"

function getFieldClass(error?: string, extra = "") {
  return [baseFieldClass, error ? invalidFieldClass : "", extra].filter(Boolean).join(" ")
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null

  return (
    <p id={id} className="text-xs font-medium text-rose-600">
      {children}
    </p>
  )
}

export function BookingForm({ action, formToken }: BookingFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [state, formAction, isPending] = useActionState(action, null)
  const [errors, setErrors] = useState<BookingFormErrors>({})

  useEffect(() => {
    if (!state?.ok) return

    formRef.current?.reset()
  }, [state])

  function clearError(name: keyof BookingFormErrors) {
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const phoneInput = event.currentTarget.elements.namedItem("phone")
    if (phoneInput instanceof HTMLInputElement) {
      phoneInput.value = formatCisPhone(phoneInput.value)
    }

    const formData = new FormData(event.currentTarget)
    const nextErrors: BookingFormErrors = {}
    const name = String(formData.get("name") ?? "").trim()
    const phone = String(formData.get("phone") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const phoneError = getCisPhoneValidationError(phone)

    if (!name) nextErrors.name = "Укажите имя"
    if (phoneError) nextErrors.phone = phoneError
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Укажите корректный email"
    if (!formData.get("personalDataConsent")) {
      nextErrors.personalDataConsent = "Подтвердите согласие на обработку персональных данных"
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length) {
      event.preventDefault()
    }
  }

  const visibleErrors = { ...(state?.fieldErrors ?? {}), ...errors }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      onSubmit={onSubmit}
      className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-7"
    >
      <input type="hidden" name="formToken" value={formToken} />
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="booking-company">Company</label>
        <input id="booking-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor="booking-name" className="text-xs font-semibold text-gray-600">
              Имя
            </label>
            <input
              id="booking-name"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              placeholder="Как к вам обращаться"
              className={getFieldClass(visibleErrors.name)}
              aria-invalid={Boolean(visibleErrors.name)}
              aria-describedby={visibleErrors.name ? "booking-name-error" : undefined}
              onChange={() => clearError("name")}
            />
            <FieldError id="booking-name-error">{visibleErrors.name}</FieldError>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="booking-phone" className="text-xs font-semibold text-gray-600">
              Телефон
            </label>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              maxLength={24}
              placeholder="+7, +375 или другой СНГ"
              className={getFieldClass(visibleErrors.phone)}
              aria-required="true"
              aria-invalid={Boolean(visibleErrors.phone)}
              aria-describedby={visibleErrors.phone ? "booking-phone-error" : undefined}
              onChange={(event) => {
                event.currentTarget.value = formatCisPhone(event.currentTarget.value)
                clearError("phone")
              }}
              onBlur={(event) => {
                event.currentTarget.value = formatCisPhone(event.currentTarget.value)
              }}
            />
            <FieldError id="booking-phone-error">{visibleErrors.phone}</FieldError>
          </div>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="booking-email" className="text-xs font-semibold text-gray-600">
            Email
          </label>
          <input
            id="booking-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={120}
            placeholder="Необязательно"
            className={getFieldClass(visibleErrors.email)}
            aria-invalid={Boolean(visibleErrors.email)}
            aria-describedby={visibleErrors.email ? "booking-email-error" : undefined}
            onChange={() => clearError("email")}
          />
          <FieldError id="booking-email-error">{visibleErrors.email}</FieldError>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="booking-message" className="text-xs font-semibold text-gray-600">
            Сообщение
          </label>
          <textarea
            id="booking-message"
            name="message"
            maxLength={1000}
            placeholder="Коротко опишите ситуацию, если хотите"
            className="min-h-32 rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="grid gap-1.5">
          <PersonalDataConsent
            className={visibleErrors.personalDataConsent ? "is-invalid border-rose-300 bg-rose-50/80" : ""}
          />
          <FieldError id="booking-consent-error">{visibleErrors.personalDataConsent}</FieldError>
        </div>

        {state?.message ? (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              state.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
            role="status"
            aria-live="polite"
          >
            {state.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isPending ? "Отправка..." : "Отправить заявку"}
        </button>

        <div className="text-xs leading-relaxed text-gray-600">
          Мы бережно относимся к вашим данным. Можно обращаться анонимно.
        </div>
      </div>
    </form>
  )
}
