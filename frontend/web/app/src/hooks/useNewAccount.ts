import { createAccount } from "@/api/account";
import { AccountIn, AccountOut } from "@/schemas/account";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";


export const useNewAccount = (queryClient: QueryClient) => {
  const { toast } = useToast()

  const mutation = useMutation<AccountOut, Error, {token: string, account: AccountIn}>({
    mutationFn: ({token, account}: {token: string, account: AccountIn}) => createAccount(token, account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'all'] });
      toast({ title: "Success", description: "Account added successfully", className:"bg-green-200 border-t-4 border-t-green-600" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, className:"bg-red-200 border-t-4 border-t-red-900" });
    }
  })
  return mutation;
}