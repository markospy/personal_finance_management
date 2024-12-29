import { deleteUser  } from "@/api/user";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/AuthProvider";

export const useDeleteUser  = (queryClient: QueryClient) => {
  const { toast } = useToast();
  const { logout} = useAuth();

  const mutation = useMutation<string, Error, { token: string }>({
    mutationFn: ({ token }) => deleteUser (token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'all'] });
      queryClient.removeQueries()
      logout()
      toast({ title: "Success", description: "User  deleted successfully", className: "bg-green-200" });
    },
    onError: () => {
      toast({ title: "Error", description: "Error deleting user", className: "bg-red-200" });
    }
  });

  return mutation;
};