/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { codes } from 'currency-codes-ts';
import { QueryClient } from "@tanstack/react-query";
import { Input, SelectCurrency } from "./Inputs";
import { DataProvider, MutationForm, WrapperForms } from "./WrapperForms";
import { ButtonShowForm } from "./ShowForm";
import { Wallet } from "lucide-react";
import { NewDataProps } from "@/schemas/utils";
import { AccountIn, AccountOut } from "@/schemas/account";
import { useNewAccount } from "@/hooks/useNewAccount";


export type action = 'Update' | 'Add';
interface Props {
  queryClient: QueryClient;
  viewHandler: (isLook: boolean) => void;
  action: action;
  mutation: MutationForm;
  defaulValue?: AccountOut | null;
  dataProvider: DataProvider
};


export const newAccount = async ({token, data}: NewDataProps) => {
  const account: {token: string, account: AccountIn} = {
    token: token,
    account : {
      currency: data.get('currency') as string,
      balance: parseFloat(data.get('balance') as string),
      name: data.get('name') as string
    }
  }
  return account;
}

export const updateAccount = async ({token, data, accountId}: NewDataProps) => {
  const account: {token: string, id?: number, account: AccountIn} = {
    token: token,
    id: accountId,
    account : {
      currency: data.get('currency') as string,
      balance: parseFloat(data.get('balance') as string),
      name: data.get('name') as string
    }
  }
  return account;
}


export function AccountForm({ queryClient, viewHandler, action, mutation, defaulValue, dataProvider }: Props) {
  const currencies = codes();
  const resetFn = mutation.reset;

  useEffect(() => {
    if (mutation.isSuccess) {
      viewHandler(false);
      resetFn()
    }

  }, [mutation.isSuccess, viewHandler, resetFn]);

  return (
      <WrapperForms
      title={`${action} Account`}
      mutation={mutation}
      action={action}
      dataProvider={dataProvider}
      onClick={() => viewHandler(false)}
      queryClient={queryClient}
      id={defaulValue?.id}
    >
      <>
        <Input
          title="Account Name"
          name="name"
          type="text"
          placeholder={action==='Add' ? "Account name" : `${defaulValue?.name}`}
          defaultValue={defaulValue?.name && `${defaulValue?.name}`}
          required={true}
        />
        <SelectCurrency
          title="Currency"
          name="currency"
          options={currencies}
          placeholder={defaulValue?.currency ? defaulValue?.currency : "Currency"}
        />
        <Input
          title="Balance"
          name="balance"
          type="number"
          placeholder={action==='Add' ? "Account amount": `${defaulValue?.balance}`}
          defaultValue={defaulValue?.balance && `${defaulValue?.balance}`}
          required={true}
        />
      </>
    </ WrapperForms>
  )
}

export function AccountAdd({ queryClient }: { queryClient: QueryClient }) {
  const [isOpen, setIsOpen] = useState(false);
  const addAccountMutation = useNewAccount(queryClient);

  return (
    <div className="flex justify-center items-center bg-gray-100 w-full h-full">
      <ButtonShowForm title="Add Accounts" onClick={() => setIsOpen(true)}>
        <Wallet />
      </ButtonShowForm>

      {isOpen && <AccountForm
        queryClient={queryClient}
        viewHandler={setIsOpen}
        action="Add" mutation={addAccountMutation}
        dataProvider={newAccount}
      />}
    </div>
  );
}