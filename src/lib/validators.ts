import { z } from "zod"

export const bookingSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(5),
    email: z.string().email().optional().or(z.literal("")),
    message: z.string().max(2000).optional().or(z.literal("")),
})
