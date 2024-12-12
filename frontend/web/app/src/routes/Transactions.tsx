import { getTransactions } from "@/api/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isTransaction } from "@/utils/guards";
import { getToken } from "@/utils/token";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { useState } from "react";

interface Props {
  sizePage: number,
}


export const RecentTransactions = ({sizePage}: Props) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(sizePage);
  const token = getToken();
  // Usar useQuery para obtener las transacciones
  const { isPending, isError, error, data, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['transactions', page, pageSize],
    queryFn: () => getTransactions(token, page, pageSize),
    placeholderData: keepPreviousData,
  });

  // Manejo de estados de carga y error
  if (isPending) {
    return <div>Cargando...</div>;
  }

  if (isError) {
    return <div>`Error al cargar las transacciones: ${error.message}.`</div>;
  }

  if(isTransaction(data.transactions)){
    const transactions = data.transactions;
    const pageSizes = [5, 10, 15, 20, 30, 50, 'Todas'];
    return (
      <Card className="w-full h-fit max-w-4xl mx-auto">
        <CardHeader className="pb-4 animate-blurred-fade-in">
          <CardTitle className="text-2xl font-bold mb-2">Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent className="animate-blurred-fade-in">
          <div className="flex flex-col gap-4 bg-gray-50 border-b border-gray-200">
            <select
              value={pageSize === data.totalTransactions ? 'Todas' : pageSize}
              onChange={(e) => {
                const newSize = e.target.value === 'Todas' ? data.totalTransactions : parseInt(e.target.value);
                setPageSize(newSize);
                setPage(1);
              }}
              className="w-full p-2 pl-4 text-sm text-gray-700 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size === 'Todas' ? 'Todas las transacciones' : `${size} transacciones`}
                </option>
              ))}
            </select>
          </div>
          <ul className="space-y-4 my-4 overflow-y-auto max-h-screen scroll-smooth pr-2">
            {transactions.map(transaction => (
              <li key={transaction.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-gray-200 p-2 rounded-full mr-3">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.comments}</p>
                    <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleString()}</p>
                  </div>
                </div>
                <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                  {transaction.amount > 0 ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          {pageSize!==data.totalTransactions &&
            <div className="flex items-center justify-center gap-4 p-2 bg-gray-50 border-t border-gray-200 space-x-2">
              <button 
                onClick={() => setPage((old) => old - 1)}
                disabled={page === 1}
                className={`flex px-4 py-2 text-white rounded-md ${isFetching && 'text-sm text-gray-500'} ${page === 1 ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                <ChevronLeft /> Back
              </button>
              <span className="text-lg font-medium text-gray-500">
                {page}/{data.totalPages}
              </span>
              <button
                onClick={() => {
                  if (!isPlaceholderData && (data.totalPages > data.pageCurrent)) {
                    setPage((old) => old + 1);
                  }
                }}
                disabled={isPlaceholderData || !(data.totalPages > data.pageCurrent)}
                className={`flex px-4 py-2 text-white rounded-md ${isPlaceholderData || !(data.totalPages > data.pageCurrent) ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                Next <ChevronRight />
              </button>
            </div>
          }
        </CardContent>
      </Card>
    );
  };
};