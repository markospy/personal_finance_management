import { deleteAccount } from "@/api/account"; // Asegúrate de importar la función deleteAccount
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast"; // Asegúrate de tener un hook para mostrar notificaciones

export const useDeleteAccount = (queryClient: QueryClient) => {
  const { toast } = useToast();

  const mutation = useMutation<string, Error, { token: string; id: number }>({
    mutationFn: ({ token, id }) => deleteAccount(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'all'] });
      toast({ title: "Success", description: "Account deleted successfully", className: "bg-green-200" });
    },
    onError: () => {
      toast({ title: "Error", description: "Error deleting account", className: "bg-red-200" });
    }
  });

  return mutation;
};