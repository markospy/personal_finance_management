import { FinancialSummary } from "@/components/custom/financial-sumary";
import { TransactionModal } from "@/components/custom/TransactionModal";
import { Charts } from "@/components/custom/charts";
import { TransactionList } from "@/components/custom/transactions-list";
import { BudgetManagement } from "@/components/custom/budget-management";
import { FutureExpenses } from "@/components/custom/future-expenses";
import { CustomCategories } from "@/components/custom/custom-categories";
import { AccountSettings } from "@/components/custom/account-setting";
import { Support } from "@/components/custom/support";
import { useState } from "react";
import { GetMonthlySumary } from "@/services/statistic";
import { QueryClient } from "@tanstack/react-query";
import { GetAccounts } from "@/services/account";
import { redirect, useLoaderData } from "react-router-dom";
import { AccountForm } from "@/components/custom/AccountModal";

function isTokenExpired(token: string): boolean {
  // Decodifica el token para obtener su contenido
  const payload = JSON.parse(atob(token.split('.')[1]));

  // Obtiene la fecha de expiración
  const exp = payload.exp;

  // Comprueba si la fecha de expiración es menor que la fecha actual
  return exp < Math.floor(Date.now() / 1000);
}

export const loader = (queryClient: QueryClient) => async () => {
  const token = window.localStorage.getItem('token') as string;

  // Verificar si el token existe y no ha expirado
  if (token) {
    if (isTokenExpired(token)) {
      return redirect('/login');
    }
  } else {
    return redirect('/login');
  }

  const date = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };

  let accounts = null;
  let summary = null;

  // Intentar obtener las cuentas
  try {
    accounts = await queryClient.ensureQueryData(GetAccounts(token));
  } catch (error) {
    console.error('Error fetching accounts:', error);
    // accounts seguirá siendo null si hay un error
  }

  // Intentar obtener el resumen mensual
  try {
    summary = await queryClient.ensureQueryData(GetMonthlySumary(token, date));
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    // summary seguirá siendo null si hay un error
  }

  // Devolver el resultado, con summary y balance
  return {
    summary: {...summary},
    accounts: {...accounts},
  };
};



export function ReportMain() {
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const data = useLoaderData()
  console.log(data.accounts)


  const addTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
    setShowModal(false);
  };

  const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
  };

  if(isEmpty(data.accounts)) {
    return (
      <AccountForm />
    )
  }

  return (
    <main className="flex-1 p-6 bg-blue-50">
      <FinancialSummary data={data} />
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
  )
}