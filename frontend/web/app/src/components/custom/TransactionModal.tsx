import { QueryClient } from "@tanstack/react-query";
import { Input, InputDate, InputTextTarea, SelectScrollable } from "./Inputs";
import { createTransaction } from "@/api/transaction";
import { WrapperForms } from "./WrapperForms";
import { ActionFunctionArgs } from "react-router-dom";
import { GetCategoriesTryCatch } from "@/services/category";
import { GetAccountsTryCatch } from "@/services/account";
import { TransactionIn } from "@/schemas/transaction";
import { useState } from "react";
import { ButtonShowForm } from "./ShowForm";

export const action  = (queryClient: QueryClient) =>
  async ({ request }: ActionFunctionArgs) => {
    const token = window.localStorage.getItem('token') as string;
    const formData = await request.formData()
    const comment = formData.get('note') as string;
    let categoryId: number = 0;
    let accountId: number = 0;


    const categories = await GetCategoriesTryCatch(token, queryClient);
    if(categories) {
      const category = categories.find(category => category.name === formData.get('category'));
      categoryId = category ? category.id : 0;
    }


    const accounts = await GetAccountsTryCatch(token, queryClient);
    if(accounts) {
      const account = accounts.find(account => account.name === formData.get('account'))
      accountId = account ? account.id : 0;
    }


    const transaction: TransactionIn = {
      amount: parseFloat(formData.get('amount') as string),
      category_id: categoryId,
      account_id: accountId,
      date: new Date(formData.get('date') as string),
      comments: comment ? comment : undefined,
    }
    await createTransaction(token, transaction)
    await queryClient.resetQueries({ queryKey: ['account', 'all'] })
    await queryClient.resetQueries({
      queryKey: ['monthlySumary',
        {
          year: new Date().getFullYear(),
          month: new Date().getMonth()+1
        }
      ],
    })
    return null
  }


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TransactionModal({ data }: {data: any}) {
  const [isOpen, setIsOpen] = useState(false);

  const categoriesExpenses = Object.values(data.categories)
  .filter(category => category.type==='expense')
  .map(category => category.name);

  const categoriesIncomes = Object.values(data.categories)
  .filter(category => category.type==='income')
  .map(category => category.name);

  const categories = {
    'incomes': categoriesIncomes,
    'expenses': categoriesExpenses
  }

  const accounts = Object.values(data.accounts).map(account => account.name);


  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <ButtonShowForm title="Add Transaction" onClick={() => setIsOpen(true)} />

      {isOpen && (
        <WrapperForms title="Add Transaction" url="/transaction/new-transaction">
          <>
            <Input title="Amount" name="amount" type="number" placeholder="Define the amount" required={true} />
            <SelectScrollable title="Category" name="category" options={categories} placeholder="Select a category" />
            <SelectScrollable title="Account" name="account" options={{'accounts': accounts}} placeholder="Select an account" />
            <InputDate title="Date" name="date" />
            <InputTextTarea title="Notes" name="note" />
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setIsOpen(false)}
              >
                  Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </>
        </ WrapperForms>
      )};
    </div>
  );
};