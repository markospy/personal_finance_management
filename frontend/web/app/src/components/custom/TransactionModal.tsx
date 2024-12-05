import { QueryClient } from "@tanstack/react-query";
import { Input, InputDate, InputTextTarea, SelectScrollable } from "./Inputs";
import { createTransaction } from "@/api/transaction";
import { WrapperForms } from "./WrapperForms";
import { ActionFunctionArgs } from "react-router-dom";
import { GetCategories } from "@/services/category";
import { GetAccounts } from "@/services/account";
import { TransactionIn } from "@/schemas/transaction";
import { useState } from "react";
import { ButtonShowForm } from "./ShowForm";
import { Plus } from "lucide-react";
import { AccountsCategories } from "@/routes/Report";
import { CategoryOut } from "@/schemas/category";
import { AccountOut } from "@/schemas/account";
import { ErrorResponse } from "@/schemas/error";
import { isAccount, isCategory } from "@/utils/guards";


export const action  = (queryClient: QueryClient) =>
  async ({ request }: ActionFunctionArgs) => {
    const token = window.localStorage.getItem('token') as string;
    const formData = await request.formData()
    const comment = formData.get('note') as string;
    let categoryId: number = 0;
    let accountId: number = 0;


    const categories: CategoryOut[] | ErrorResponse = await queryClient.ensureQueryData(GetCategories(token));
    if(isCategory(categories)) {
      const category = categories.find((category:CategoryOut)=> category.name === formData.get('category'));
      categoryId = category ? category.id : 0;
    }


    const accounts: AccountOut[] | ErrorResponse = await queryClient.ensureQueryData(GetAccounts(token));
    if(isAccount(accounts)) {
      const account = accounts.find((account:AccountOut) => account.name === formData.get('account'))
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
export function TransactionModal({ data }:{data: AccountsCategories}) {
  const [isOpen, setIsOpen] = useState(false);

  let categoriesExpenses: string[] = []
  let categoriesIncomes: string[] = []
  if(data.categories){
    const categories: CategoryOut[] = data.categories;
    categoriesExpenses = categories
    .filter(category => category.type==='expense')
    .map(category => category.name);

    categoriesIncomes = categories
    .filter(category => category.type==='income')
    .map(category => category.name);
  }


  const categories = {
    'incomes': categoriesIncomes,
    'expenses': categoriesExpenses
  }
  let accountsList: string[] = []
  if(data.accounts){
    const accounts: AccountOut[] = data.accounts;
    console.log(accounts)
    accountsList = accounts.map(account => account.name);
  }

  console.log(accountsList)

  return (
    <div className="h-full w-full flex items-center justify-center">
      <ButtonShowForm title="Add Transaction" onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
      </ButtonShowForm>

      {isOpen && (
        <WrapperForms title="Add Transaction" url="/transaction/new-transaction" onClick={() => setIsOpen(false)}>
          <>
            <Input title="Amount" name="amount" type="number" placeholder="Define the amount" required={true} />
            <SelectScrollable title="Category" name="category" options={categories} placeholder="Select a category" />
            <SelectScrollable title="Account" name="account" options={{'accounts': accountsList}} placeholder="Select an account" />
            <InputDate title="Date" name="date" />
            <InputTextTarea title="Notes" name="note" />
          </>
        </ WrapperForms>
      )}
    </div>
  );
};


// TODO: queda pendiente recargar el cache con la data de los incomes y expenses despues de cada transaccion.
// TODO: asu como cerrar el modal de agregar transaccion una vez se realice la transaccion.