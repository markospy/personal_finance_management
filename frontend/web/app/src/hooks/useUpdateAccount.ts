import { updateAccount } from "@/api/account"; // Asegúrate de importar la función updateAccount
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast"; // Asegúrate de tener un hook para mostrar notificaciones
import { AccountIn, AccountOut } from "@/schemas/account"; // Asegúrate de importar los tipos de cuenta

export const useUpdateAccount = (queryClient: QueryClient) => {
  const { toast } = useToast();

  const mutation = useMutation<AccountOut, Error, { token: string; id: number; account: AccountIn }>({
    mutationFn: ({ token, id, account }) => updateAccount(token, id, account),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account', 'all'] }); // Invalida las consultas relacionadas con las cuentas
      toast({ title: "Success", description: "Account updated successfully", className: "bg-green-200" });
      return data; // Devuelve los datos de la cuenta actualizada
    },
    onError: () => {
      toast({ title: "Error", description: "Error updating account", className: "bg-red-200" });
    }
  });

  return mutation;
};