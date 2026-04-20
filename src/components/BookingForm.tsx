"use client"

import { useState, type FormEvent } from "react"
import { PersonalDataConsent } from "@/components/PersonalDataConsent"
import { formatCisPhone, getCisPhoneValidationError } from "@/lib/phoneMasks"

type BookingFormProps = {
  action: (formData: FormData) => void | Promise<void>
}

type BookingFormErrors = Partial<Record<"name" | "phone" | "email" | "personalDataConsent", string>>

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

export function BookingForm({ action }: BookingFormProps) {
  const [errors, setErrors] = useState<BookingFormErrors>({})

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

  return (
    <form action={action} noValidate onSubmit={onSubmit} className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-7">
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
              className={getFieldClass(errors.name)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "booking-name-error" : undefined}
              onChange={() => clearError("name")}
            />
            <FieldError id="booking-name-error">{errors.name}</FieldError>
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
              className={getFieldClass(errors.phone)}
              aria-required="true"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "booking-phone-error" : undefined}
              onChange={(event) => {
                event.currentTarget.value = formatCisPhone(event.currentTarget.value)
                clearError("phone")
              }}
              onBlur={(event) => {
                event.currentTarget.value = formatCisPhone(event.currentTarget.value)
              }}
            />
            <FieldError id="booking-phone-error">{errors.phone}</FieldError>
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
            className={getFieldClass(errors.email)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "booking-email-error" : undefined}
            onChange={() => clearError("email")}
          />
          <FieldError id="booking-email-error">{errors.email}</FieldError>
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
            className={errors.personalDataConsent ? "is-invalid border-rose-300 bg-rose-50/80" : ""}
          />
          <FieldError id="booking-consent-error">{errors.personalDataConsent}</FieldError>
        </div>

        <button className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow">
          Отправить заявку
        </button>

        <div className="text-xs leading-relaxed text-gray-600">
          Мы бережно относимся к вашим данным. Можно обращаться анонимно.
        </div>
      </div>
    </form>
  )
}
