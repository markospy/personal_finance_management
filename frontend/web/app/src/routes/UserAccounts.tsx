/* eslint-disable react-refresh/only-export-components */
import { ArrowBigRightDash, PencilLine, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import currencies from '@/utils/currencies'
import { AccountOut } from '@/schemas/account'
import { Link, useLoaderData } from 'react-router-dom'
import { GetAccounts } from '@/services/account'
import { getToken } from '@/utils/token'
import { ErrorResponse } from '@/schemas/error'
import { QueryClient } from '@tanstack/react-query'


export const loader = (queryClient: QueryClient) => async () => {
  const token = getToken();
  const accounts: AccountOut[] | ErrorResponse = await queryClient.ensureQueryData(GetAccounts(token));
  return accounts;
}


// Función auxiliar para obtener el icono de la moneda
const getCurrencyIcon = (currency: string) => {
  const coin = currencies.currencies.find(coin => coin.codigo === currency);
  return coin ? coin?.simbolo : undefined;
}

export default function UserAccounts() {
  const accounts: AccountOut[] = useLoaderData() as AccountOut[];

  return (
    <div className="container mx-auto p-4">
      <div className='flex items-center gap-20 mb-6'>
        <h1 className="text-2xl font-bold">My Accounts</h1>
        <Link to="/dashboard" className='flex items-center gap-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700 font-medium'>
          Go to Dashboard
          <ArrowBigRightDash/>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-8">
                {account.name}
                <PencilLine className='size-5 cursor-pointer hover:text-blue-500'/>
              </CardTitle>
              <p>{getCurrencyIcon(account.currency) || account.currency}</p>
            </CardHeader>
            <CardContent className='w-full'>
              <div>
                <div className="text-2xl font-bold">
                  {account.balance.toLocaleString(undefined, {
                    style: 'currency',
                    currency: account.currency,
                  })}
                </div>
                <div className='w-full flex flex-row justify-between'>
                  <p className="text-xs text-muted-foreground">
                    Current balance
                  </p>
                  <Trash2 className='text-red-600 size-4 hover:cursor-pointer'/>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}