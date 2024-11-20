import { getAccounts } from '@/api/account';


export function GetAccounts(token: string) {
    return {
        queryKey: ['account', 'all'],
        queryFn: () => getAccounts(token)
    }
}