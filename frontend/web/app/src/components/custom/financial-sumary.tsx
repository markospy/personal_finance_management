import { MonthlySumary } from "@/api/statistic";
import { AccountOut } from "@/schemas/account";


type Data = {
  sumary: MonthlySumary,
  accounts: AccountOut[]
};

export function FinancialSummary({ data }: {data: Data}) {
  const currentMonth = new Date().toLocaleString('En', { month: 'long' });
  // Calcular el balance si accounts no es null
  console.log(data)
  let balanceAccount = 0;
  if (data.accounts) {
    Object.values(data.accounts).map(account => balanceAccount += account.balance);
  }
  const totalIncomes = data.summary?.totalIncomes ? `$ ${data.summary?.totalIncomes}` : '-';
  const totalExpenses = data.summary?.totalExpenses ? `$ ${data.summary?.totalExpenses}` : '-';
  const netBalance = (data.summary?.totalIncomes & data.summary?.totalExpenses) ?
    `$ ${data.summary?.totalIncomes - data.summary?.totalExpenses}` : '-'

  return (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">{currentMonth} Incomes and Expenses</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gray-100 rounded flex flex-col justify-between">
          <h3 className="text-lg font-semibold">Total Balance of Account</h3>
          <p className="text-2xl">${balanceAccount}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded flex flex-col justify-between">
          <h3 className="text-lg font-semibold">Total Income</h3>
          <p className="text-2xl">{totalIncomes}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded flex flex-col justify-between">
          <h3 className="text-lg font-semibold">Total Expenses</h3>
          <p className="text-2xl">{totalExpenses}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded flex flex-col justify-between">
          <h3 className="text-lg font-semibold">Net balance of the month</h3>
          <p className="text-2xl">{netBalance}</p>
        </div>
      </div>
    </div>
  );
};