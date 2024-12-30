/* eslint-disable react-refresh/only-export-components */
import { ArrowBigLeftDash } from 'lucide-react'

import { AccountOut } from '@/schemas/account'
import { Link, useLoaderData } from 'react-router-dom'
import { GetAccounts } from '@/services/account'
import { getToken } from '@/utils/token'
import { ErrorResponse } from '@/schemas/error'
import { QueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AccountForm, newAccount, updateAccount } from '@/components/custom/AccountModal'
import DestructionAlert from '@/components/custom/DestructionAlert'
import { useDeleteAccount } from '@/hooks/useDeleteAccount'
import { useNewAccount } from '@/hooks/useNewAccount'
import { useUpdateAccount } from '@/hooks/useUpdateAccount'
import { AccountsList } from '@/components/custom/AccountList'

export const loader = (queryClient: QueryClient) => async () => {
  const token = getToken();
  const accounts: AccountOut[] | ErrorResponse = await queryClient.ensureQueryData(GetAccounts(token));
  return accounts;
}




export default function UserAccounts({queryClient}:{queryClient:QueryClient}) {
  const [ showConfirm, setShowConfirm ] = useState(false);
  const [ accountSelect, setAccountselect ] = useState<AccountOut|null>(null);
  const [lookFormAdd, setLookFormAdd] = useState(false);
  const [lookFormUpdate, setLookFormUpdate] = useState(false);
  const accounts: AccountOut[] = useLoaderData() as AccountOut[];
  const token = getToken();

  const deleteAccountMutation = useDeleteAccount(queryClient);
  const addAccountMutation = useNewAccount(queryClient);
  const updateAccountMutation = useUpdateAccount(queryClient);

  return (
    <div className="mx-auto p-4 container">
      <div className='flex items-center gap-20 mb-6'>
        <h1 className="font-bold text-2xl">My Accounts</h1>
      </div>
      <div>
        <AccountsList
          accounts={accounts}
          selectAccount={setAccountselect}
          setLookFormUpdater={setLookFormUpdate}
          setLookFormAdd={setLookFormAdd}
          setLookConfirm={setShowConfirm}
          showConfirm={showConfirm}
        />
        {showConfirm && (
          <DestructionAlert
            id={accountSelect?.id}
            info={accountSelect?.name}
            description="Do you confirm that you want to delete the account"
            token={token}
            onAction={deleteAccountMutation.mutate}
            setShow={setShowConfirm}
          />
        )}
        {lookFormAdd && (
          <AccountForm
            queryClient={queryClient}
            viewHandler={setLookFormAdd}
            action='Add'
            mutation={addAccountMutation}
            dataProvider={newAccount}
          />
        )}
        {lookFormUpdate && (
          <AccountForm
            queryClient={queryClient}
            viewHandler={setLookFormUpdate}
            action='Update'
            mutation={updateAccountMutation}
            defaulValue={accountSelect}
            dataProvider={updateAccount}
          />
        )}
      </div>
      <Link to="/dashboard" className='flex items-center gap-2 bg-blue-500 hover:bg-blue-700 p-2 rounded-md max-w-44 font-medium text-white'>
        <ArrowBigLeftDash/>
        Go to Dashboard
      </Link>
    </div>
  )
}