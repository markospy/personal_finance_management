export const TransactionList = ({ transactions }) => (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index} className="p-4 border-b">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{transaction.category}</p>
                <p className="text-gray-600">{transaction.date}</p>
              </div>
              <div>
                <p className="font-semibold">${transaction.amount}</p>
                <p className="text-gray-600">{transaction.notes}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );