import { z } from "zod";

const DateInZod = z.object(
    {
        year: z.number().
        optional().
        default(new Date().getUTCFullYear()),
        month: z.number().
        min(1, 'Must be one number between 1 and 12').
        max(12, 'Must be one number between 1 and 12').
        optional().
        default(new Date().getMonth()),
    }
)

export type DateIn = z.infer<typeof DateInZod>