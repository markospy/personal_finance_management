import { queryOptions } from "@tanstack/react-query";
import { getUser } from "../api/user";


export function GetUser(token: string) {
    return queryOptions({
        queryKey: ['user', 'me'],
        queryFn: () => getUser(token),
        staleTime: Infinity,
        gcTime: Infinity,
    });
}