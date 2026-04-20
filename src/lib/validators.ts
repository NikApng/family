import { z } from "zod"
import { isValidImageUrl } from "@/lib/imageUrl"

const imageUrlMessage = "Укажи корректный URL: https://... или /uploads/... или /images/..."

export const bookingSchema = z.object({
  name: z.string().trim().min(1),
  phone: z
    .string()
    .trim()
    .min(1, "Номер телефона обязателен")
    .refine((value) => value.replace(/\D/g, "").length >= 10, "Укажите телефон полностью"),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
  personalDataConsent: z.preprocess((v) => {
    if (typeof v === "boolean") return v

    const str = String(v ?? "").trim().toLowerCase()
    return str === "true" || str === "on" || str === "1"
  }, z.boolean().refine((v) => v, "Необходимо согласие на обработку персональных данных")),
})

export const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  place: z.string().optional().or(z.literal("")),
  imageUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => {
      const url = String(v ?? "").trim()
      if (!url) return true
      return isValidImageUrl(url)
    }, imageUrlMessage),
})

export const photoSchema = z.object({
  title: z.string().trim().min(1),
  imageUrl: z.string().trim().refine((v) => isValidImageUrl(v), imageUrlMessage),
})

export const serviceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  sortOrder: z.coerce.number().int().optional().default(0),
  isPublished: z.boolean().optional().default(true),
  blocks: z
    .array(
      z.object({
        title: z.string().optional().or(z.literal("")),
        text: z.string().optional().or(z.literal("")),
      }),
    )
    .optional()
    .default([]),
})

const ratingSchema = z.preprocess((v) => {
  if (v === null || v === undefined) return null
  if (typeof v === "number") return v
  const str = String(v).trim()
  if (!str) return null
  if (str.toLowerCase() === "null") return null
  const n = Number(str)
  return Number.isFinite(n) ? n : v
}, z.number().int().min(1).max(5).finite().nullable())

const isAnonymousSchema = z.preprocess((v) => {
  if (typeof v === "boolean") return v

  const str = String(v ?? "").trim().toLowerCase()
  if (str === "true" || str === "on" || str === "1") return true

  return false
}, z.boolean())

const personalDataConsentSchema = z.preprocess((v) => {
  if (typeof v === "boolean") return v

  const str = String(v ?? "").trim().toLowerCase()
  return str === "true" || str === "on" || str === "1"
}, z.boolean().refine((v) => v, "Необходимо согласие на обработку персональных данных"))

export const reviewCreateSchema = z.object({
  text: z.string().trim().min(20).max(1000),
  name: z.string().trim().max(60).optional().or(z.literal("")),
  isAnonymous: isAnonymousSchema.optional().default(false),
  rating: ratingSchema.optional().default(null),
  website: z.string().optional().or(z.literal("")),
  personalDataConsent: personalDataConsentSchema,
})
