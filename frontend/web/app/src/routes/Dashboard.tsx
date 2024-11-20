import { FinancialSummary } from "@/components/custom/financial-sumary";
import { Sidebar } from "@/components/custom/Slidebar";
import { useState } from "react";
import { TransactionModal } from "@/components/custom/transaction-modal";
import { Charts } from "@/components/custom/charts";
import { TransactionList } from "@/components/custom/transactions-list";
import { BudgetManagement } from "@/components/custom/budget-management";
import { FutureExpenses } from "@/components/custom/future-expenses";
import { CustomCategories } from "@/components/custom/custom-categories";
import { AccountSettings } from "@/components/custom/account-setting";
import { Support } from "@/components/custom/support";
import { GetMonthlySumary } from "@/services/statistic";
import { QueryClient } from "@tanstack/react-query";
import { useLoaderData } from "react-router-dom";
import { GetAccounts } from "@/services/account";


export const loader = (queryClient: QueryClient) => async () => {
  const token = window.localStorage.getItem('token') as string;
  const date = {
    year: new Date().getFullYear(),
    month: new Date().getMonth()+1,
  };
  const sumary =  await queryClient.fetchQuery(GetMonthlySumary(token, date));
  const accounts = await queryClient.fetchQuery(GetAccounts(token));
  let balance: number = 0;
  accounts.forEach(account => balance += account.balance)
  return {
    ...sumary,
    balance
  }
}


export const DashboardCenter = () => {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const sumary = useLoaderData()
  console.log(sumary)

  const addTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <FinancialSummary sumary={sumary} />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => setShowModal(true)}
          >
            Add Transaction
          </button>
          {showModal && <TransactionModal onClose={() => setShowModal(false)} onSave={addTransaction} />}
          <Charts />
          <TransactionList transactions={transactions} />
          <BudgetManagement />
          <FutureExpenses />
          <CustomCategories />
          <AccountSettings />
          <Support />
        </main>
      </div>
    </div>
  );
};
