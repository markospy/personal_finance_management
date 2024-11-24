import { QueryClient } from "@tanstack/react-query";
import { Input, InputDate, InputTextTarea } from "./Inputs";
import { createTransaction } from "@/api/transaction";
import { CategoryOut } from "@/schemas/category";
import { AccountOut } from "@/schemas/account";
import { WrapperForms } from "./WrapperForms";
import { GetAccounts } from "@/services/account";
import { GetCategories } from "@/services/category";
import { ActionFunctionArgs } from "react-router-dom";

export const action  = (queryClient: QueryClient) =>
  async ({ request }: ActionFunctionArgs) => {
    const token = window.localStorage.getItem('token') as string;
    const formData = await request.formData()
    const transaction = {
      amount: formData.get('amount') as string,
      category_id: formData.get('category_id') as string,
      account_id: formData.get('account_id') as string,
      date: formData.get('date') as string,
      comments: formData.get('note') as string,
    }
    console.log(transaction)
    await createTransaction(token, transaction)
    await queryClient.invalidateQueries({ queryKey: ['account', 'all'] })
    return null
  }

export const loader = (queryClient: QueryClient) => async () => {
  const token = window.localStorage.getItem('token') as string
  let categories: CategoryOut[] = [];
  let accounts: AccountOut[] = [];
  try {
    categories = queryClient.ensureQueryData(GetCategories(token));
  } catch {
    console.log("Error al encontrar las categorias")
  }

  try {
    accounts = queryClient.ensureQueryData(GetAccounts(token));
  } catch {
    console.log("Error al encontrar las cuentas")
  }

  return {
    categories: {...categories},
    accounts: {...accounts}
  }
}

export const TransactionModal = ({ onClose }: {onClose: () => void}) => {

    return (
      <WrapperForms title="Add Transaction" url="/transaction/new-transaction">
        <>
          <Input title="Amount" name="amount" type="number" required={true} />
          <Input title="Account" name="account_id" type="text" required={true} />
          <Input title="Category" name="category_id" type="text" required={true} />
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