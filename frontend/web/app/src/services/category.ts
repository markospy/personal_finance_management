import { getCategories, getCategory } from '@/api/category'

export function GetCategories(token: string) {
    return {
        queryKey: ['Categories'],
        queryFn: () => getCategories(token)
    }
}

export function GetCategory(token: string, id: number) {
    return {
        queryKey: ['Categories', id],
        queryFn: () => getCategory(token, id)
    }
}