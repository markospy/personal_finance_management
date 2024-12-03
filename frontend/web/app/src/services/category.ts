import { getCategories, getCategory } from '@/api/category'
import { queryOptions } from '@tanstack/react-query'


export function GetCategories(token: string) {
    return queryOptions({
        queryKey: ['categories'],
        queryFn: () => getCategories(token)
    })
}

export function GetCategory(token: string, id: number) {
    return queryOptions({
        queryKey: ['categories', id],
        queryFn: () => getCategory(token, id)
    })
}
