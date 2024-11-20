export const FinancialSummary = () => (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Financial Summary</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Total Balance</h3>
          <p className="text-2xl">$10,000</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Total Income</h3>
          <p className="text-2xl">$5,000</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Total Expenses</h3>
          <p className="text-2xl">$3,000</p>
        </div>
      </div>
    </div>
  );