export const Charts = () => (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Charts and Visualizations</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Expense Distribution</h3>
          <img src="https://placehold.co/300x200" alt="Pie chart showing expense distribution by category" />
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold">Income vs Expenses</h3>
          <img src="https://placehold.co/300x200" alt="Bar chart comparing income and expenses" />
        </div>
      </div>
    </div>
  );