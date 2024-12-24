import { QueryClient, useMutation } from "@tanstack/react-query";
import { Input, InputDate, InputTextTarea, SelectScrollable } from "./Inputs";
import { createTransaction } from "@/api/transaction";
import { WrapperForms } from "./WrapperForms";
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface NewTransaction {
  token: string;
  transaction: TransactionIn;
}

interface TransactionModalProps {
  data: AccountsCategories;
  queryClient: QueryClient
}

interface TransactionForm  {
  amount: string,
  category: string,
  account: string,
  date: string,
  comment: string
}

export interface NewTransactionProps{
  queryClient: QueryClient;
  token: string;
  data: TransactionForm
}

const newTransaction = async ({queryClient, token, data}: NewTransactionProps) => {
  console.log('Hola')
  let categoryId: number = 0;
  let accountId: number = 0;

  const categories: CategoryOut[] | ErrorResponse = await queryClient.ensureQueryData(GetCategories(token));
  if (isCategory(categories)) {
    const category = categories.find((category: CategoryOut) => category.name === data.category);
    categoryId = category ? category.id : 0;
  } else {
    throw new Error("Failed to fetch categories");
  }

  const accounts: AccountOut[] | ErrorResponse = await queryClient.ensureQueryData(GetAccounts(token));
  if (isAccount(accounts)) {
    const account = accounts.find((account: AccountOut) => account.name === data.account);
    accountId = account ? account.id : 0;
  } else {
    throw new Error("Failed to fetch accounts");
  }

  const transaction: NewTransaction = {
    'token': token,
    'transaction': {
      'amount': parseFloat(data.amount as string),
      'category_id': categoryId,
      'account_id': accountId,
      'date': new Date(data.date as string),
      'comments': data.comment ? data.comment : undefined,
    }
  };

  delay(3000);
  return transaction;
};

const useNewTransacion = (queryClient: QueryClient) => {
  const mutation = useMutation({
    mutationFn: ({token, transaction}: NewTransaction) => createTransaction(token, transaction),
    onSuccess: async (data: TransactionIn) => {
      const date = new Date(data.date);
      console.log(date)
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      console.log(month);
      console.log(year);
      const dateKey = { "month": month, "year": year};
      await queryClient.refetchQueries({ queryKey: ['account', 'all'] });
      await queryClient.refetchQueries({ queryKey: ['monthlySumary', dateKey] });
      await queryClient.refetchQueries({ queryKey: ['monthlyIncomes', dateKey] });
      await queryClient.refetchQueries({ queryKey: ['monthlyExpenses', dateKey] });
    }
  });

  return mutation;
}

export function TransactionModal({ data, queryClient }: TransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mutation = useNewTransacion(queryClient);

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
    accountsList = accounts.map(account => account.name);
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <ButtonShowForm title="Add Transaction" onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
      </ButtonShowForm>

      {isOpen && (
        <WrapperForms
          title="Add Transaction"
          mutation={mutation}
          dataProvider={newTransaction}
          onClick={() => setIsOpen(false)}
          queryClient={queryClient}
        >
          <>
            <Input title="Amount" name="amount" type="number" placeholder="Define the amount" required={true} />
            <SelectScrollable title="Category" name="category" options={categories} placeholder="Select a category" />
            <SelectScrollable title="Account" name="account" options={{'accounts': accountsList}} placeholder="Select an account" />
            <InputDate title="Date" name="date" />
            <InputTextTarea title="Notes" name="comment" />
          </>
        </ WrapperForms>
      )}
    </div>
  );
};


// TODO: queda pendiente recargar el cache con la data de los incomes y expenses despues de cada transaccion.
// TODO: asu como cerrar el modal de agregar transaccion una vez se realice la transaccion.