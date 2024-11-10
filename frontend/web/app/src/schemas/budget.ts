import { z } from 'zod';

// Validación personalizada para el Period
const Period = z.object({
  start_date: z.date(),
  end_date: z.date()
}).refine(
  (data) => (data.start_date && data.end_date) && data.start_date < data.end_date,
  { message: "Start date must be before end date" }
);

// Esquema que permite Period o null
const PeriodOrNull = Period.optional().nullish();

const BudgetIn = z.object({
  category_id: z.number().int(),
  amount: z.number().positive('It must be a number greater than zero'),
  period: Period
});

const BudgetOut = BudgetIn.extend({
  id: z.number().int(),
  user_id: z.number().int()
});

const BudgetUpdate = z.object({
  category_id: z.number().int().optional(),
  amount: z.number().positive('It must be a number greater than zero').optional(),
  period: PeriodOrNull
});

const BudgetStatus = z.object({
  category_id: z.number().int(),
  category_name: z.string(),
  budget_amount: z.number(),
  spent_amount: z.number(),
  remaining_amount: z.number(),
  is_exceeded: z.boolean()
});

export type BudgetIn = z.infer<typeof BudgetIn>;
export type BudgetOut = z.infer<typeof BudgetOut>;
export type BudgetUpdate = z.infer<typeof BudgetUpdate>;
export type BudgetStatus = z.infer<typeof BudgetStatus>;
export type Period = z.infer<typeof Period>;