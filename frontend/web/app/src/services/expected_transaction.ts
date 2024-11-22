import { getExpTransactions, getExpTransaction } from '@/api/expected_transaction';

export function GetExpTransactions(token: string) {
    return {
        queryKey: ['expected transaction'],
        queryFn: () => getExpTransactions(token)
    }
}

export function GetExpTransaction(token: string, id: number) {
    return {
        queryKey: ['expected transaction', id],
        queryFn: () => getExpTransaction(token, id)
    }
}