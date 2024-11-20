import { getUser } from "../api/user";


export function GetUser(token: string) {
    return {
        queryKey: ['user', 'me'],
        queryFn: () => getUser(token),
        staleTime: Infinity,
        gcTime: Infinity,
    }
}