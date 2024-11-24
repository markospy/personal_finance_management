import { MonthlySumary } from "@/api/statistic";
import { AccountOut } from "@/schemas/account";


type Data = {
  summary: MonthlySumary,
  accounts: AccountOut[]
};

function CardInfo({title, data}: {title: string, data:string}) {
  return (
    <div className="p-4 bg-blue-900 rounded flex flex-col-reverse justify-between items-center shadow-blue-900 shadow-md">
      <h3 className="text-sm font-medium text-white">{title}</h3>
      <p className="text-2xl text-white">{data}</p>
    </div>
  );
};

export function FinancialSummary({ data }: {data: Data}) {
  const currentMonth = new Date().toLocaleString('En', { month: 'long' });
  // Calcular el balance si accounts no es null
  console.log(data)
  let balance = 0;
  if (data.accounts) {
    Object.values(data.accounts).map(account => balance += account.balance);
  }

  const balanceAccount = balance ? `$ ${balance}` : `$ 0`
  const totalIncomes = data.summary?.totalIncomes ? `$ ${data.summary?.totalIncomes}` : '-';
  const totalExpenses = data.summary?.totalExpenses ? `$ ${data.summary?.totalExpenses}` : '-';
  const netBalance = (data.summary?.totalIncomes & data.summary?.totalExpenses) ?
    `$ ${data.summary?.totalIncomes - data.summary?.totalExpenses}` : '-'

  return (
    <div className="bg-blue-100 p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-blue-900">{currentMonth} Incomes and Expenses</h2>
      <div className="grid grid-cols-4 gap-4">
        <CardInfo title="Total Balance of Account" data={balanceAccount} />
        <CardInfo title="Total Incomes" data={totalIncomes} />
        <CardInfo title="Total Expenses" data={totalExpenses} />
        <CardInfo title="Net balance of the month" data={netBalance} />
      </div>
    </div>
  );
};