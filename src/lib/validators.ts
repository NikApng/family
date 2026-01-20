import { z } from "zod"

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
})


export const photoSchema = z.object({
  title: z.string().trim().min(1),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (v) =>
        v.startsWith("http://") ||
        v.startsWith("https://") ||
        v.startsWith("/uploads/") ||
        v.startsWith("/images/"),
      "Укажи корректный URL: https://... или /uploads/... или /images/..."
    ),
})
