export const BudgetManagement = () => (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Budget Management</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Category 1</h3>
          <p>Budget: $500</p>
          <p>Spent: $300</p>
          <p>Remaining: $200</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Category 2</h3>
          <p>Budget: $400</p>
          <p>Spent: $150</p>
          <p>Remaining: $250</p>
        </div>
      </div>
    </div>
  );