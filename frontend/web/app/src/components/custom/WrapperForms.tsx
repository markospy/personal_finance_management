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

export type MutationForm = Transaction | Account;

type MutationData =
  | { token: string; transaction: TransactionIn }
  | { token: string; account: AccountIn };

type DataProvider = ({...props}: NewDataProps) => Promise<MutationData>;
interface Props {
  title: string;
  mutation: MutationForm;
  dataProvider: DataProvider
  children: React.ReactNode;
  onClick: () => void;
  queryClient: QueryClient;
}

export function WrapperForms({title, mutation, dataProvider, children, onClick, queryClient}:Props ) {
  return (
    <div className="top-0 left-0 z-50 fixed flex justify-center items-center bg-blue-50 w-full min-h-screen animate-fade-in">
      <Card className="bg-white shadow-lg p-2 rounded-lg min-w-[360px] max-h-fit animate-slide-in-bottom">
        <CardHeader>
          <CardTitle className="font-bold text-2xl text-blue-900">{title}</CardTitle>
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
                className="bg-gray-500 mr-2 px-4 py-2 rounded text-white"
                onClick={onClick}
                disabled={mutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded text-white"
                disabled={mutation.isPending}
              >
                {mutation.isPending && <div className="spinner"/>}
                Create
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
