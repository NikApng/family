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
    url: z.string().url(),
    title: z.string().optional().or(z.literal("")),
})
