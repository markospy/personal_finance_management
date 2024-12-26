import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import './Spinner.css';
import { QueryClient, UseMutationResult } from "@tanstack/react-query";
import { getToken } from "@/utils/token";
import { TransactionIn } from "@/schemas/transaction";
import { AccountIn } from "@/schemas/account";
import { NewDataProps } from "@/schemas/utils";

type Transaction = UseMutationResult<TransactionIn, Error, {token: string, transaction: TransactionIn}, unknown>
type Account = UseMutationResult<AccountIn, Error, {token: string, account: AccountIn}, unknown>

type MutationData =
  | { token: string; transaction: TransactionIn }
  | { token: string; account: AccountIn };

type DataProvider = ({...props}: NewDataProps) => Promise<MutationData>;
interface Props {
  title: string;
  mutation: Transaction | Account;
  dataProvider: DataProvider
  children: React.ReactNode;
  onClick: () => void;
  queryClient: QueryClient;
}

export function WrapperForms({title, mutation, dataProvider, children, onClick, queryClient}:Props ) {
  return (
    <Card className="fixed z-50 inset-y-20 inset-x-1/3 bg-white rounded-lg shadow-lg p-2 max-w-md max-h-fit animate-slide-in-bottom">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const token = getToken();
            const data = new FormData(e.currentTarget);
            console.log(data);
            const mutationData = await dataProvider({queryClient, token, data});
            console.log(mutationData);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mutation.mutate(mutationData as any);
          }} >
          <>
            {children}
          </>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              onClick={onClick}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex gap-2 items-center bg-blue-500 text-white py-2 px-4 rounded"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <div className="spinner"/>}
              Create
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
