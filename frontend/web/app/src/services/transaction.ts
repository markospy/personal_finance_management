import { getTransaction, getTransactions } from "@/api/transaction";
import { queryOptions } from "@tanstack/react-query";


export function GetTransactions(token: string) {
    return queryOptions({
        queryKey: ['transactions'],
        queryFn: () => getTransactions(token)
    });
}

export function GetTransaction(token: string, id: number) {
    return queryOptions({
        queryKey: ['transactions', id],
        queryFn: () => getTransaction(token, id)
    });
}