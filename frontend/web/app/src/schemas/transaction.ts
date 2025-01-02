import { z } from 'zod';


const TransactionIn = z.object({
    category_id: z.number().int(),
    account_id: z.number().int(),
    amount: z.number().positive('It must be a number greater than zero'),
    date: z.date().optional().default(() => new Date()),
    comments: z.string().max(250).optional(),
});

const TransactionOut = TransactionIn.extend({
    id: z.number().int(),
    date: z.date(),
});

const TransactionUpdate = TransactionIn.partial();

export type TransactionIn = z.infer<typeof TransactionIn>
export type TransactionOut = z.infer<typeof TransactionOut>
export type TransactionUpdate = z.infer<typeof TransactionUpdate>