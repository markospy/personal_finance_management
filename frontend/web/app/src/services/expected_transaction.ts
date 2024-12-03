import { getExpTransactions, getExpTransaction } from '@/api/expected_transaction';
import { queryOptions } from '@tanstack/react-query';

export function GetExpTransactions(token: string) {
    return queryOptions({
        queryKey: ['expected transaction'],
        queryFn: () => getExpTransactions(token)
    });
}

export function GetExpTransaction(token: string, id: number) {
    return queryOptions({
        queryKey: ['expected transaction', id],
        queryFn: () => getExpTransaction(token, id)
    });
}