import {getBudgets, getBudget} from '@/api/budget'

export function GetBudgets(token: string){
    return {
        queryKey: ['budget'],
        queryFn: () => getBudgets(token)
    }
}

export function GetBudget(token: string, id: number){
    return {
        queryKey: ['budget', id],
        queryFn: () => getBudget(token, id)
    }
}