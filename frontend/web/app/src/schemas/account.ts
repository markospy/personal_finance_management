import { z } from "zod";
import { codes } from "currency-codes-ts";

const validCurrencyCodes = codes().map(currency => String(currency));

if (validCurrencyCodes.length === 0) {
    throw new Error("No se encontraron códigos de moneda válidos.");
}

// Convertir a un arreglo mutable y asegurar que tiene al menos un elemento
const CurrencyCodeSchema = z.enum([validCurrencyCodes[0], ...validCurrencyCodes.slice(1)]);

const AccountIn = z.object(
  {
    currency: CurrencyCodeSchema,
    balance: z.number().positive('It must be a number greater than zero').default(0),
    name: z.string({required_error: 'Name is required'}).max(50, 'Must be 50 or fewer characters long')
  }
)

const AccountOut = AccountIn.merge(
  z.object({
    id: z.number().int(),
    userId: z.number().int()
  })
)

// Esquema para la actualización de una cuenta (todas las propiedades son opcionales)
const AccountUpdate = AccountIn.partial();

export type AccountIn = z.infer<typeof AccountIn>
export type AccountOut = z.infer<typeof AccountOut>
export type AccountUpdate = z.infer<typeof AccountUpdate>

