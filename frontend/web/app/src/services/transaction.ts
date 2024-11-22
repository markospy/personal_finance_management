import { getTransaction, getTransactions } from "@/api/transaction";


export function GetTransactions(token: string) {
    return {
        querKey: ['transactions'],
        queryFn: () => getTransactions(token)
    }
}

export function GetTransaction(token: string, id: number) {
    return {
        querKey: ['transactions', id],
        queryFn: () => getTransaction(token, id)
    }
}