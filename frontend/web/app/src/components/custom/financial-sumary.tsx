type Sumary = {
  totalBalance: number;
  totalIncomes: number;
  totalExpenses: number
};

export function FinancialSummary({ sumary }) {
  const currentMonth = new Date().toLocaleString('En', { month: 'long' });

  return (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">{currentMonth} Incomes and Expenses</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Total Balance of Account</h3>
          <p className="text-2xl">${sumary.total_balance}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Total Income</h3>
          <p className="text-2xl">${sumary.total_incomes}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Total Expenses</h3>
          <p className="text-2xl">${sumary.total_expenses}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Net balance of the month</h3>
          <p className="text-2xl">${sumary.total_incomes - sumary.total_expenses}</p>
        </div>
      </div>
    </div>
  );
};