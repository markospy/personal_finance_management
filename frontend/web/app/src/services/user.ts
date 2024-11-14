import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/user";


export function GetUser(token: string) {
    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: () => getUser(token),
        staleTime: Infinity,
        gcTime: Infinity,
    })
}