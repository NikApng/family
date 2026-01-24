import { z } from "zod"

function isValidImageUrl(value: string) {
  const v = String(value ?? "").trim()
  if (!v) return false

  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/uploads/") || v.startsWith("/images/")
}

const imageUrlMessage = "Укажи корректный URL: https://... или /uploads/... или /images/..."

export const bookingSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
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
