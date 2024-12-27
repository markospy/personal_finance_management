/* eslint-disable react-refresh/only-export-components */
import { ArrowBigRightDash, PencilLine, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import currencies from '@/utils/currencies'
import { AccountOut } from '@/schemas/account'
import { Link, useLoaderData } from 'react-router-dom'
import { GetAccounts } from '@/services/account'
import { getToken } from '@/utils/token'
import { ErrorResponse } from '@/schemas/error'
import { QueryClient } from '@tanstack/react-query'
import { deleteAccount } from '@/api/account'
import { useToast } from "@/hooks/use-toast"
import { useState } from 'react'

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
  const [ showConfirm, setShowConfirm ] = useState(false);
  const [ accountToDelete, setAccountToDelete ] = useState({id:-1, name:''});
  const accounts: AccountOut[] = useLoaderData() as AccountOut[];
  const { toast } = useToast()
  const token = getToken();

  async function delAccount(token: string, id: number) {
    const response = await deleteAccount(token, id);
    if(typeof response !== 'string' && response.status) {
      return toast({title: "Error deleting account"})
    }
    if(response) {
      return toast({title: "Account deleted successfully"})
    }
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
                <PencilLine className={`hover:text-blue-500 cursor-pointer size-5 ${showConfirm && 'cursor-not-allowed hover:text-black'}`}/>
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
                  <Trash2 onClick={() => {
                      if(!showConfirm){
                        setShowConfirm(true);
                        setAccountToDelete({id: account.id, name: account.name});
                      }
                    }}
                    className={`text-red-600 cursor-pointer size-4 ${showConfirm && 'cursor-not-allowed'}`}
                  />
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
          {showConfirm && (
            <div className='top-0 left-0 fixed flex justify-center items-center w-full min-h-screen' >
              <div className='space-y-6 bg-red-100 p-6 rounded-md animate-slide-in-bottom align-middle'>
                <div className='flex gap-2'>
                  <TriangleAlert className='flex-none text-red-500'/>
                  <p className='font-medium text-red-500'>Do you confirm that you want to delete the account {accountToDelete.name}?</p>
                </div>
                <div className='flex justify-center gap-4'>
                  <button className='bg-gray-400 hover:bg-gray-600 p-2 rounded-md text-base text-white' onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button className="bg-red-400 hover:bg-red-600 p-2 rounded-md text-base text-white" onClick={async() => await delAccount(token, accountToDelete.id)}>Delete</button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}