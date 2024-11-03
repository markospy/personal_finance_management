import { z } from "zod";

const userBase = z.object(
  {
    "name": z.string().min(2, 'Must be 2 or more characters long').max(50, 'Must be 50 or fewer characters long'),
    "email": z.string().email(),
  }
)

const userIn = userBase.merge(
  z.object(
    {
      "password": z.string().min(6, 'Must be 6 or more characters long')
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

export type userIn = z.infer<typeof userIn>
export type userOut = z.infer<typeof userOut>
