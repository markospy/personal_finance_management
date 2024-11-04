import { z } from 'zod';


const TransactionIn = z.object({
    category_id: z.number().int(),
    account_id: z.number().int(),
    amount: z.number().nonnegative(),
    date: z.date().optional().default(() => new Date()),
    comments: z.string().max(250).optional().nullable(),
});

const TransactionOut = TransactionIn.extend({
    id: z.number().int(),
    date: z.date(),
});

const TransactionUpdate = z.object({
    category_id: z.number().int().optional().nullable(),
    account_id: z.number().int(),
    amount: z.number().nonnegative().optional().nullable(),
    date: z.date().optional().default(() => new Date()),
    comments: z.string().max(250).optional().nullable(),
});

export type TransactionIn = z.infer<typeof TransactionIn>
export type TransactionOut = z.infer<typeof TransactionOut>
export type TransactionUpdate = z.infer<typeof TransactionUpdate>