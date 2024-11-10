import { z } from "zod";

export const Frecuency = z.enum(["weekly", "biweekly", "monthly", "quarterly", "semiannual", "annual"])

const ExpTransactionIn = z.object({
    category_id: z.number().int(),
    amount: z.number().nonnegative("Must greater than zero"),
    date: z.date().optional(),
    frequency: Frecuency.optional(),
});

const ExpTransactionOut = ExpTransactionIn.extend({
    id: z.number().int(),
    date: z.date(),
});

const ExpTransactionUpdate = z.object({
    category_id: z.number().int().optional(),
    amount: z.number().nonnegative("Must greater than zero").optional(),
    date: z.date().optional().optional(),
    frequency: Frecuency.optional(),
});

export type ExpTransactionIn = z.infer<typeof ExpTransactionIn>
export type ExpTransactionOut = z.infer<typeof ExpTransactionOut>
export type ExpTransactionUpdate = z.infer<typeof ExpTransactionUpdate>