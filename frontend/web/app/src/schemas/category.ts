import { z } from "zod";

export const TransactionType = z.enum(['expense', 'income']);

const CategoryIn = z.object(
	{
		name: z.string({required_error: 'Name is required'}).max(50, 'Must be 50 or fewer characters long'),
		type: TransactionType,
	}
)

const CategoryOut = CategoryIn.merge(
	z.object({
    id: z.number().int(),
		isGlobal: z.boolean(),
    userId: z.number().int()
	})
)

export type CategoryIn = z.infer<typeof CategoryIn>
export type CategoryOut = z.infer<typeof CategoryOut>