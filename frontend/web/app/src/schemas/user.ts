/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";

const userBase = z.object(
  {
    "name": z.string({required_error: 'Name is required'}).min(2, 'Must be 2 or more characters long').max(50, 'Must be 50 or fewer characters long'),
    "email": z.string({required_error: "Email is required"}).email(),
  }
)

export const zodUserIn = userBase.merge(
  z.object(
    {
      "password": z.string({required_error: 'Password is required'}).min(6, 'Must be 6 or more characters long')
    }
  )
)

const zodUserOut = userBase.merge(
  z.object(
    {
      "id": z.number().int()
    }
  )
)

const zodUserUpdate = z.object(
  {
    "name": z.string().min(2, 'Must be 2 or more characters long').max(50, 'Must be 50 or fewer characters long').optional(),
    "email": z.string().email().optional(),
    "password": z.string({required_error: 'Name is required'}).min(6, 'Must be 6 or more characters long').optional()
  }
)


export type UserIn = z.infer<typeof zodUserIn>
export type UserOut = z.infer<typeof zodUserOut>
export type UserUpdate = z.infer<typeof zodUserUpdate>