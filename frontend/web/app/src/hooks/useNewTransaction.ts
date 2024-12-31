import { createTransaction } from "@/api/transaction";
import { TransactionOut, TransactionIn } from "@/schemas/transaction";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export const useNewTransaction = (queryClient: QueryClient) => {
  const { toast } = useToast();

  const mutation = useMutation<TransactionOut, Error, {token: string, transaction: TransactionIn}>({
    mutationFn: ({token, transaction}: { token: string, transaction: TransactionIn}) => createTransaction(token, transaction),
    onSuccess: (data: TransactionOut) => {
      const date = new Date(data.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const dateKey = {"month": month, "year": year};
      queryClient.invalidateQueries({ queryKey: ["transaction"] });
      queryClient.invalidateQueries({ queryKey: ['monthlySumary', dateKey] });
      queryClient.invalidateQueries({ queryKey: ['monthlyIncomes', dateKey] });
      queryClient.invalidateQueries({ queryKey: ['monthlyExpenses', dateKey] });
      toast({ title: "Success", description: "Transaction added successfully", className:"bg-green-200 border-t-4 border-t-green-600" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, className:"bg-red-200 border-t-4 border-t-red-900" });
    }
  });

  return mutation;
}