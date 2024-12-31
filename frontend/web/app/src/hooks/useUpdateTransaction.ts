import { useMutation, QueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { TransactionOut, TransactionUpdate } from "@/schemas/transaction";
import { updateTransaction } from "@/api/transaction";

export const useUpdateTransaction = (queryClient: QueryClient) => {
  const { toast } = useToast();

  const mutation = useMutation<TransactionOut, Error, {token: string, id: number, transaction: TransactionUpdate}>({
    mutationFn: ({token, id, transaction}) => updateTransaction(token, id, transaction),
    onSuccess: (data: TransactionOut) => {
      const date = new Date(data.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const dateKey = {"month": month, "year": year};
      queryClient.invalidateQueries({ queryKey: ["transaction"] });
      queryClient.invalidateQueries({ queryKey: ['monthlySumary', dateKey] });
      queryClient.invalidateQueries({ queryKey: ['monthlyIncomes', dateKey] });
      queryClient.invalidateQueries({ queryKey: ['monthlyExpenses', dateKey] });
      toast({ title: "Success", description: "Transaction updated successfully", className:"bg-green-200 border-t-4 border-t-green-600" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, className:"bg-red-200 border-t-4 border-t-red-900" });
    }
  });

  return mutation;
}