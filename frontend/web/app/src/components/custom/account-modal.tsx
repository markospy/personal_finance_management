import { useState } from "react";
import { codes } from 'currency-codes-ts';
import { ActionFunctionArgs, useFetcher  } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { createAccount } from "@/api/account";

// eslint-disable-next-line react-refresh/only-export-components
export const action  = (queryClient: QueryClient) =>
  async ({ request }: ActionFunctionArgs) => {
    console.log(23)
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
  const fetcher = useFetcher();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('');
  const [balance, setBalance] = useState('');

  const currencies = codes();

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => setIsOpen(true)}
    >
      Add Account
    </button>

    {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Account</h2>
            <fetcher.Form method="post" action="/account/new-account">
              <div className="mb-4">
                <label className="block text-gray-700">Account Name</label>
                <input
                  name="name"
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Currency</label>
                <input
                  name="currency"
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  list="currencies"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                />
                <datalist id="currencies">
                  {currencies.map((cur, index) => (
                      <option key={index} value={cur} />
                  ))}
                </datalist>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Balance</label>
                <input
                  name="balance"
                  type="number"
                  className="w-full px-3 py-2 border rounded"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  required
                  step={1000}
                  min={0}
                />
              </div>
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
            </fetcher.Form>
          </div>
        </div>
      )}
    </div>
  );
}