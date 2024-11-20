export const FutureExpenses = () => (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Future Expenses</h2>
      <ul>
        <li className="p-4 border-b">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Expense 1</p>
              <p className="text-gray-600">Due Date: 2023-12-01</p>
            </div>
            <div>
              <p className="font-semibold">$100</p>
            </div>
          </div>
        </li>
        <li className="p-4 border-b">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Expense 2</p>
              <p className="text-gray-600">Due Date: 2023-12-15</p>
            </div>
            <div>
              <p className="font-semibold">$200</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );