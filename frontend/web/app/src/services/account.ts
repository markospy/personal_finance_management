import { getAccounts, getAccount } from '@/api/account';
import { AccountOut } from '@/schemas/account';
import { QueryClient } from '@tanstack/react-query';


export function GetAccounts(token: string) {
    return {
        queryKey: ['account', 'all'],
        queryFn: () => getAccounts(token)
    }
}


export function GetAccount(token: string, id: number) {
    return {
        queryKey: ['account', id],
        queryFn: () => getAccount(token, id)
    }
}


export async function GetAccountsTryCatch(token: string, queryClient: QueryClient) {
    let accounts: AccountOut[] | null = null;
    try {
        accounts = await queryClient.ensureQueryData(GetAccounts(token));
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
    return accounts;
}