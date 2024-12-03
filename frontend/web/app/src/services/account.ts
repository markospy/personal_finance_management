import { getAccounts, getAccount } from '@/api/account';
import { queryOptions } from '@tanstack/react-query';


export function GetAccounts(token: string) {
    return queryOptions({
        queryKey: ['account', 'all'],
        queryFn: () => getAccounts(token)
    });
}


export function GetAccount(token: string, id: number) {
    return queryOptions({
        queryKey: ['account', id],
        queryFn: () => getAccount(token, id)
    });
}
