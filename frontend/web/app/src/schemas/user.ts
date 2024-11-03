import { z } from "zod";

const userBase = z.object(
  {
    "name": z.string({required_error: "Name is required"}).min(2, 'Must be 2 or more characters long').max(50, 'Must be 50 or fewer characters long'),
    "email": z.string({required_error: "Email is required"}).email(),
  }
)

const userIn = userBase.merge(
  z.object(
    {
      "password": z.string({required_error: "Name is required"}).min(6, 'Must be 6 or more characters long')
    }
  )
)

const userOut = userBase.merge(
  z.object(
    {
      "id": z.number()
    }
  )
)

const userUpdate = z.object(
  {
    "name": z.string().min(2, 'Must be 2 or more characters long').max(50, 'Must be 50 or fewer characters long').optional(),
    "email": z.string().email().optional(),
    "password": z.string({required_error: "Name is required"}).min(6, 'Must be 6 or more characters long').optional()
  }
)


export type userIn = z.infer<typeof userIn>
export type userOut = z.infer<typeof userOut>
export type userUpdate = z.infer<typeof userUpdate>