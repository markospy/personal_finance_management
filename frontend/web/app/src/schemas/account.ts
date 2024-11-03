import { z } from "zod";
import { codes } from "currency-codes-ts";

const validCurrencyCodes = codes().map(currency => currency);

const CurrencyCodeSchema = z.enum(validCurrencyCodes);

const AccountIn = z.object(
  {
    currency: CurrencyCodeSchema,
    balance: z.number().positive('It must be a number greater than zero').default(0),
    name: z.string({required_error: 'Name is required'}).max(50, 'Must be 50 or fewer characters long')
  }
)


const AccountOut = AccountIn.merge(
  z.object({
    id: z.number(),
    userId: z.number()
  })
)

export type AccountIn = z.infer<typeof AccountIn>
export type AccountOut = z.infer<typeof AccountOut>
