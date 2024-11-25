import { getCategories, getCategory } from '@/api/category'
import { CategoryOut } from '@/schemas/category';
import { QueryClient } from '@tanstack/react-query';

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


export async function GetCategoriesTryCatch(token: string, queryClient: QueryClient) {
    let categories: CategoryOut[] | null = null;
    try {
        categories = await queryClient.ensureQueryData(GetCategories(token));
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
    return categories;
}