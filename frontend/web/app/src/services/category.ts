import { getCategories, getCategory } from '@/api/category'

export function GetCategories(token: string) {
    return {
        queryKey: ['categories'],
        queryFn: () => getCategories(token)
    }
}

export function GetCategory(token: string, id: number) {
    return {
        queryKey: ['categories', id],
        queryFn: () => getCategory(token, id)
    }
}