import { getTransactions } from "@/api/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryOut } from "@/schemas/category";
import { ErrorResponse } from "@/schemas/error";
import { TransactionOut } from "@/schemas/transaction";
import { GetCategories } from "@/services/category";
import { isCategory, isTransaction } from "@/utils/guards";
import { getToken } from "@/utils/token";
import { keepPreviousData, QueryClient, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CreditCard, ListEnd, ListStart, PencilLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

function getCategoryType(transaction: TransactionOut, categories: CategoryOut[] | ErrorResponse | null) {
  if (categories !== null) {
    if (isCategory(categories)){
      const category: CategoryOut | undefined = categories.find((category) => category.id == transaction.category_id);
      return category?.type;
    }
  }
  return
}

export const RecentTransactions = ({sizePage, queryClient}: {sizePage: number, queryClient: QueryClient}) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(sizePage);
  const token = getToken();
  // Usar useQuery para obtener las transacciones
  const { isPending, isError, error, data, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['transactions', page, pageSize],
    queryFn: () => getTransactions(token, page, pageSize),
    placeholderData: keepPreviousData,
  });

  const [categories, setCategories] = useState<CategoryOut[] | ErrorResponse | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await queryClient.ensureQueryData(GetCategories(token));
      setCategories(result);
    };

    fetchCategories();
  }, [token, queryClient]);


  // Manejo de estados de carga y error
  if (isPending) {
    return <div>Cargando...</div>;
  }

  if (isError) {
    return <div>`Error al cargar las transacciones: ${error.message}.`</div>;
  }

  if(isTransaction(data.transactions)){
    const transactions = data.transactions;
    const idMax = transactions[0].id;
    const pageSizes = [5, 10, 15, 20, 30, 50, 'Todas'];
    return (
      <Card className="mx-auto w-full max-w-4xl h-fit">
        <CardHeader className="pb-4 animate-blurred-fade-in">
          <CardTitle className="mb-2 font-bold text-2xl">Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent className="animate-blurred-fade-in">
          <div className="flex flex-col gap-4 border-gray-200 bg-gray-50 border-b">
            <select
              value={pageSize === data.totalTransactions ? 'Todas' : pageSize}
              onChange={(e) => {
                const newSize = e.target.value === 'Todas' ? data.totalTransactions : parseInt(e.target.value);
                setPageSize(newSize);
                setPage(1);
              }}
              className="border-gray-200 p-2 pl-4 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-gray-700 text-sm focus:outline-none"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size === 'Todas' ? 'Todas las transacciones' : `${size} transacciones`}
                </option>
              ))}
            </select>
          </div>
          <ul className="mt-4 rounded-lg max-h-screen overflow-y-auto scroll-smooth">
            {transactions.map(transaction => (
              <li key={transaction.id} className={`${getCategoryType(transaction, categories) === 'income' ? "bg-green-50" : "bg-red-50"} flex justify-between items-center py-2 px-4`}>
                <div className="flex items-center gap-10">
                  <div className="flex items-center">
                    <div className="bg-gray-200 mr-3 p-2 rounded-full">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.comments}</p>
                      <p className="text-gray-500 text-sm">{new Date(transaction.date).toLocaleString()}</p>
                    </div>
                  </div>
                  {(page===1 && transaction.id === idMax) && (
                    <div className="flex gap-4">
                      <PencilLine className="hover:text-blue-500 cursor-pointer size-5"/>
                      <Trash2 className="text-red-500 cursor-pointer size-5"/>
                    </div>
                  )}
                </div>
                <span className={getCategoryType(transaction, categories) === 'income' ? "text-green-600" : "text-red-600"}>
                  {getCategoryType(transaction, categories) === 'income' ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          {pageSize!==data.totalTransactions &&
            <div className="flex justify-around items-center">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className={`flex px-4 py-2 ${page === 1 ? 'text-transparent' : 'text-gray-600'}`}
              >
                <ListStart className="mr-2"/> To Start
              </button>
              <div className="flex justify-center items-center gap-4 space-x-2 border-gray-200 bg-gray-50 p-2 border-t">
                <button
                  onClick={() => setPage((old) => old - 1)}
                  disabled={page === 1}
                  className={`flex px-4 py-2 text-white rounded-md ${isFetching && 'text-sm text-gray-500'} ${page === 1 ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  <ChevronLeft /> Back
                </button>
                <span className="font-medium text-gray-500 text-lg">
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
              <button
                onClick={() => {
                  if (!isPlaceholderData && (data.totalPages > data.pageCurrent)) {
                    setPage(data.totalPages);
                  }
                }}
                disabled={isPlaceholderData || !(data.totalPages > data.pageCurrent)}
                className={`flex px-4 py-2 ${isPlaceholderData || !(data.totalPages > data.pageCurrent) ? 'text-transparent' : 'text-gray-600'}`}
              >
                To End <ListEnd className="ml-2"/>
              </button>
            </div>
          }
        </CardContent>
      </Card>
    );
  };
};