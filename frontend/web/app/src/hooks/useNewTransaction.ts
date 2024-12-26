import { createTransaction } from "@/api/transaction";
import { TransactionOut, TransactionIn } from "@/schemas/transaction";
import { QueryClient, useMutation } from "@tanstack/react-query";

export const useNewTransaction = (queryClient: QueryClient) => {
  const mutation = useMutation<TransactionOut, Error, {token: string, transaction: TransactionIn}>({
    mutationFn: ({token, transaction}: { token: string, transaction: TransactionIn}) => createTransaction(token, transaction),
    onSuccess: (data: TransactionOut) => {
      const date = new Date(data.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const dateKey = {"month": month, "year": year};
      queryClient.invalidateQueries({ queryKey: ['account', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySumary', dateKey] });
      queryClient.invalidateQueries({ queryKey: ['monthlyIncomes', dateKey] });
      queryClient.invalidateQueries({ queryKey: ['monthlyExpenses', dateKey] });
    }
  });

  return mutation;
}