import { getTransaction, getTransactions } from "@/api/transaction";
import { queryOptions, keepPreviousData } from "@tanstack/react-query";


export function GetTransactions(token: string, page?: number, sizePage?: number) {
    return queryOptions({
        queryKey: ['transactions', page, sizePage],
        queryFn: () => getTransactions(token, page, sizePage),
        placeholderData: keepPreviousData,
    });
}

export function GetTransaction(token: string, id: number) {
    return queryOptions({
        queryKey: ['transactions', id],
        queryFn: () => getTransaction(token, id)
    });
}