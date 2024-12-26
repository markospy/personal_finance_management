import { createAccount } from "@/api/account";
import { AccountIn, AccountOut } from "@/schemas/account";
import { QueryClient, useMutation } from "@tanstack/react-query";


export const useNewAccount = (queryClient: QueryClient) => {
    const mutation = useMutation<AccountOut, Error, {token: string, account: AccountIn}>({
        mutationFn: ({token, account}: {token: string, account: AccountIn}) => createAccount(token, account),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['account', 'all'] });
        },
    })
    return mutation;
}