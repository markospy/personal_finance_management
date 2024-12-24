import { AccountsCategories } from "@/routes/Report";
import { Card, CardContent } from "../ui/card";
import { TransactionModal } from "./TransactionModal";
import { QueryClient } from "@tanstack/react-query";



export default function AccountsSummary({ data, queryClient }:{data: AccountsCategories, queryClient: QueryClient}) {
  let balance: number = 0;
  if(data.accounts) {
    data.accounts.forEach((account) => balance+=account.balance)
  }

  return(
    <Card className="w-full h-fit max-w-4xl mx-auto">
      <CardContent className="pt-6">
      <div className="text-center animate-blurred-fade-in">
        <p className="text-sm font-medium text-gray-500">Saldo actual</p>
        <h2 className="text-3xl font-bold">${balance}</h2>
      </div>
      <TransactionModal data={data} queryClient={queryClient} />
      </CardContent>
    </Card>
  );
};