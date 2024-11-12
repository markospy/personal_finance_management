import { useQuery, useMutation } from "@tanstack/react-query";
import { createUser, getUser } from "../api/user";
import { UserIn } from "../schemas/user";


export function CreateUser() {
    const mutate = useMutation(
        {
            mutationFn: (user: UserIn) => createUser(user),
        });
    return mutate;
}

export function GetUser(token: string) {
    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: () => getUser(token),
        staleTime: Infinity,
        gcTime: Infinity,
    })
}