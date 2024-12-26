import { QueryClient, useMutation } from "@tanstack/react-query";
import { Input, InputDate, InputTextTarea, SelectScrollable } from "./Inputs";
import { createTransaction } from "@/api/transaction";
import { WrapperForms } from "./WrapperForms";
import { GetCategories } from "@/services/category";
import { GetAccounts } from "@/services/account";
import { TransactionIn, TransactionOut } from "@/schemas/transaction";
import { useEffect, useState } from "react";
import { ButtonShowForm } from "./ShowForm";
import { Plus } from "lucide-react";
import { AccountsCategories } from "@/routes/Report";
import { CategoryOut } from "@/schemas/category";
import { AccountOut } from "@/schemas/account";
import { ErrorResponse } from "@/schemas/error";
import { isAccount, isCategory } from "@/utils/guards";


interface TransactionModalProps {
  data: AccountsCategories;
  queryClient: QueryClient
}

export interface TransactionForm  {
  amount: string,
  category: string,
  account: string,
  date: string,
  comment: string
}

export interface NewTransactionProps{
  queryClient: QueryClient;
  token: string;
  data: FormData
}

const newTransaction = async ({queryClient, token, data}: NewTransactionProps) => {
  console.log('Hola')
  const categoryForm = data.get('category') as string;
  const accountForm = data.get('account') as string;
  const amountForm = Number(data.get('amount'));
  const dateForm = new Date(data.get('date') as string);
  const commentForm = data.get('comment') as string;


  let categoryId: number = 0;
  let accountId: number = 0;

  const categories: CategoryOut[] | ErrorResponse = await queryClient.ensureQueryData(GetCategories(token));
  if (isCategory(categories)) {
    const category = categories.find((category: CategoryOut) => category.name === categoryForm);
    categoryId = category ? category.id : 0;
  } else {
    throw new Error("Failed to fetch categories");
  }

  const accounts: AccountOut[] | ErrorResponse = await queryClient.ensureQueryData(GetAccounts(token));
  if (isAccount(accounts)) {
    const account = accounts.find((account: AccountOut) => account.name === accountForm);
    accountId = account ? account.id : 0;
  } else {
    throw new Error("Failed to fetch accounts");
  }

  const transaction: { token: string, transaction: TransactionIn } = {
    'token': token,
    'transaction': {
      'amount': amountForm,
      'category_id': categoryId,
      'account_id': accountId,
      'date': dateForm,
      'comments': commentForm ? commentForm: undefined,
    }
  };

  return transaction;
};

const useNewTransacion = (queryClient: QueryClient) => {
  const mutation = useMutation<TransactionOut, Error, {token: string, transaction: TransactionIn}>({
    mutationFn: ({token, transaction}: { token: string, transaction: TransactionIn}) => createTransaction(token, transaction),
    onSuccess: async (data: TransactionOut) => {
      const date = new Date(data.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const dateKey = {"month": month, "year": year};
      await queryClient.invalidateQueries({ queryKey: ['account', 'all'] });
      await queryClient.invalidateQueries({ queryKey: ['monthlySumary', dateKey] });
      await queryClient.invalidateQueries({ queryKey: ['monthlyIncomes', dateKey] });
      await queryClient.invalidateQueries({ queryKey: ['monthlyExpenses', dateKey] });
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

  // Efecto para cerrar el modal cuando la mutación es exitosa
  useEffect(() => {
    if (mutation.isSuccess) {
      setIsOpen(false);
    }
  }, [mutation.isSuccess]);

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


// TODO: queda pendiente actualizar la UI con la data de los incomes y expenses despues de cada transaccion.
