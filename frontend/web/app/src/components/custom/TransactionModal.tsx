import { QueryClient } from "@tanstack/react-query";
import { Input, InputDate, InputTextTarea, SelectScrollable } from "./Inputs";
import { createTransaction } from "@/api/transaction";
import { WrapperForms } from "./WrapperForms";
import { ActionFunctionArgs } from "react-router-dom";
import { GetCategories } from "@/services/category";
import { GetAccounts } from "@/services/account";

export const action  = (queryClient: QueryClient) =>
  async ({ request }: ActionFunctionArgs) => {
    const token = window.localStorage.getItem('token') as string;
    const formData = await request.formData()
    const comment = formData.get('note') as string;
    let categoryId: number = 0;
    let accountId: number = 0;

    try {
      const categories = await queryClient.ensureQueryData(GetCategories(token));
      categoryId = categories.filter(category => category.name === formData.get('category')).map(category => category.id)[0]
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      // categories seguirá siendo null si hay un error
    }

    try {
      const accounts = await queryClient.ensureQueryData(GetAccounts(token));
      accountId = accounts.filter(account => account.name === formData.get('account')).map(account => account.id)[0]
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // accounts seguirá siendo null si hay un error
    }

    const transaction = {
      amount: formData.get('amount'),
      category_id: categoryId,
      account_id: accountId,
      date: formData.get('date'),
      comments: comment ? comment : null,
    }

    await createTransaction(token, transaction)
    await queryClient.invalidateQueries({ queryKey: ['account', 'all'] })
    await queryClient.invalidateQueries({ queryKey: ['monthlySumary'] })
    return null
  }


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TransactionModal({ onClose, data }: {onClose: () => void, data: any}) {

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
    <WrapperForms title="Add Transaction" url="/transaction/new-transaction">
      <>
        <Input title="Amount" name="amount" type="number" placeholder="Define the amount" required={true} />
        <SelectScrollable title="Category" name="category" options={categories} description="Select a category" />
        <SelectScrollable title="Account" name="account" options={{'accounts': accounts}} description="Select an account" />
        <InputDate title="Date" name="date" />
        <InputTextTarea title="Notes" name="note" />
        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            onClick={onClose}
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
  );
};