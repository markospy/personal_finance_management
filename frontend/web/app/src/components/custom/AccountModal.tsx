import { useState } from "react";
import { codes } from 'currency-codes-ts';
import { ActionFunctionArgs } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { createAccount } from "@/api/account";
import { Input, SelectCurrency } from "./Inputs";
import { WrapperForms } from "./WrapperForms";
import { ButtonShowForm } from "./ShowForm";

// eslint-disable-next-line react-refresh/only-export-components
export const action  = (queryClient: QueryClient) =>
  async ({ request }: ActionFunctionArgs) => {
    const token = window.localStorage.getItem('token') as string;
    const formData = await request.formData()
    const account = {
      currency: formData.get('currency') as string,
      balance: parseFloat(formData.get('balance') as string),
      name: formData.get('name') as string
    }
    await createAccount(token, account)
    await queryClient.invalidateQueries({ queryKey: ['account', 'all'] })
    return null
  }


export function AccountForm() {
  const [isOpen, setIsOpen] = useState(false);


  const currencies = codes();

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <ButtonShowForm title="Add Accounts" onClick={() => setIsOpen(true)} />

      {isOpen && (
        <WrapperForms title="Add Account" url="/account/new-account">
          <>
            <Input title="Account Name" name="name" type="text" placeholder="Account name" required={true} />
            <SelectCurrency title="Currency" name="currency" options={currencies} placeholder="Account currency" />
            <Input title="Balance" name="balance" type="number" placeholder="Account amount" required={true} />
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </div>
          </>
        </ WrapperForms>
      )}
    </div>
  );
}