/* eslint-disable react-refresh/only-export-components */
import { ArrowBigRightDash, PencilLine, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import currencies from '@/utils/currencies'
import { AccountOut } from '@/schemas/account'
import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { GetAccounts } from '@/services/account'
import { getToken } from '@/utils/token'
import { ErrorResponse } from '@/schemas/error'
import { QueryClient } from '@tanstack/react-query'
import { deleteAccount } from '@/api/account'


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
  const token = getToken();

  function delAccount(token: string, id: number) {
    const response = deleteAccount(token, id)
    return true;
  }

  return (
    <div className="mx-auto p-4 container">
      <div className='flex items-center gap-20 mb-6'>
        <h1 className="font-bold text-2xl">My Accounts</h1>
        <Link to="/dashboard" className='flex items-center gap-2 bg-blue-500 hover:bg-blue-700 p-2 rounded-md font-medium text-white'>
          Go to Dashboard
          <ArrowBigRightDash/>
        </Link>
      </div>
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle className="flex items-center gap-8 font-medium text-sm">
                {account.name}
                <PencilLine className='hover:text-blue-500 cursor-pointer size-5'/>
              </CardTitle>
              <p>{getCurrencyIcon(account.currency) || account.currency}</p>
            </CardHeader>
            <CardContent className='w-full'>
              <div>
                <div className="font-bold text-2xl">
                  {account.balance.toLocaleString(undefined, {
                    style: 'currency',
                    currency: account.currency,
                  })}
                </div>
                <div className='flex flex-row justify-between w-full'>
                  <p className="text-muted-foreground text-xs">
                    Current balance
                  </p>
                  <Trash2 onClick={() => delAccount(token, account.id)} className='text-red-600 hover:cursor-pointer size-4'/>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
          <Card>
            <CardContent className='flex justify-center items-center hover:shadow-lg p-6 w-full h-full'>
              <Plus className='text-gray-300 size-16'/>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}