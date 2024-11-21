import { getAccounts, getAccount } from '@/api/account';


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