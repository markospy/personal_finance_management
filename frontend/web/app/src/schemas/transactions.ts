import { z } from 'zod';


const TransactionIn = z.object({
    category_id: z.number().int(),
    account_id: z.number().int(),
    amount: z.number().nonnegative(),
    date: z.date().optional().default(() => new Date()),
    comments: z.string().max(250).optional(),
});

const TransactionOut = TransactionIn.extend({
    id: z.number().int(),
    date: z.date(),
});

const TransactionUpdate = z.object({
    category_id: z.number().int().optional(),
    account_id: z.number().int().optional(),
    amount: z.number().nonnegative().optional(),
    date: z.date().default(() => new Date()).optional(),
    comments: z.string().max(250).optional(),
});

export type TransactionIn = z.infer<typeof TransactionIn>
export type TransactionOut = z.infer<typeof TransactionOut>
export type TransactionUpdate = z.infer<typeof TransactionUpdate>