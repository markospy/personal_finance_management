import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import './Spinner.css';
import { QueryClient, UseMutationResult } from "@tanstack/react-query";
import { NewTransactionProps } from "./TransactionModal";
import { getToken } from "@/utils/token";
import { TransactionIn } from "@/schemas/transaction";

type Mutations = UseMutationResult<TransactionIn, Error, [string, TransactionIn], unknown>
type Data = Promise<{token: string, transaction: TransactionIn}>;

interface Props {
  title: string;
  mutation: Mutations;
  dataProvider: ({...props}: NewTransactionProps) => Data;
  children: React.ReactNode;
  onClick: () => void;
  queryClient: QueryClient;
}

export function WrapperForms({title, mutation, dataProvider, children, onClick, queryClient}:Props ) {

  return (
    <Card className="fixed z-50 inset-y-20 inset-x-1/3 bg-white rounded-lg shadow-lg p-2 max-w-md max-h-fit">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={async (e) => {
            e.preventDefault();
            const token = getToken();
            // Accede a los datos del formulario
            const formData = new FormData(e.target);

            // Aquí puedes convertir formData a un objeto si es necesario
            const data = Object.fromEntries(formData.entries());
            console.log(data);

            const mutationData = await dataProvider({queryClient, token, data});
            console.log(mutationData)
            mutation.mutate(mutationData)
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