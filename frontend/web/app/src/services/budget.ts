import {getBudgets, getBudget} from '@/api/budget'
import { queryOptions } from '@tanstack/react-query'

export function GetBudgets(token: string){
  return queryOptions({
    queryKey: ['budget'],
    queryFn: () => getBudgets(token)
  })
}

export function GetBudget(token: string, id: number){
  return queryOptions({
    queryKey: ['budget', id],
    queryFn: () => getBudget(token, id)
  })
}