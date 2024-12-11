import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetTransactions } from "@/services/transaction";
import { getToken } from "@/utils/token";
import { CreditCard } from "lucide-react";
import { useState } from "react";

interface Props {
    page: number,
    sizePage: number
}


export const RecentTransactions = ({page, sizePage}: Props) => {
  const [query, setQuery] = useState<Record<string, number>>({
    page,
    sizePage,
  });

    const token = getToken();
    const transactions = GetTransactions(token, query.page, query.sizePage);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {transactions.map((transaction, index) => (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-gray-200 p-2 rounded-full mr-3">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                {transaction.amount > 0 ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};