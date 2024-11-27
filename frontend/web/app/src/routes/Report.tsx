import { FinancialSummary } from "@/components/custom/financial-sumary";
import { TransactionModal } from "@/components/custom/TransactionModal";
import { Charts } from "@/components/custom/Charts";
import { BudgetManagement } from "@/components/custom/budget-management";
import { FutureExpenses } from "@/components/custom/future-expenses";
import { CustomCategories } from "@/components/custom/custom-categories";
import { AccountSettings } from "@/components/custom/account-setting";
import { Support } from "@/components/custom/support";
import { GetMonthlyExpensesTryCatch, GetMonthlyIncomesTryCatch, GetMonthlySumaryTryCatch } from "@/services/statistic";
import { QueryClient } from "@tanstack/react-query";
import {  GetAccountsTryCatch } from "@/services/account";
import { redirect, useLoaderData } from "react-router-dom";
import { AccountForm } from "@/components/custom/AccountModal";
import { CategoryOut } from "@/schemas/category";
import { AccountOut } from "@/schemas/account";
import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic";
import { GetCategoriesTryCatch } from "@/services/category";

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

  const accounts: AccountOut[] | null = await GetAccountsTryCatch(token, queryClient)
  const categories: CategoryOut[] | null = await GetCategoriesTryCatch(token, queryClient)
  const summary: MonthlySumary | null = await GetMonthlySumaryTryCatch(token, date, queryClient)
  const summaryExpenses: MonthlyExpenses[] | null = await GetMonthlyExpensesTryCatch(token, date, queryClient)
  const summaryIncomes: MonthlyIncomes[] | null = await GetMonthlyIncomesTryCatch(token, date, queryClient)

  return {
    'summary': {...summary},
    'summaryExpenses': {...summaryExpenses},
    'summaryIncomes': {...summaryIncomes},
    'accounts': {...accounts},
    'categories': {...categories},
  };
};

export function ReportMain() {
  const data = useLoaderData()
  console.log(data)

  const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
  };

  if(isEmpty(data.accounts)) {
    return (
      <AccountForm />
    )
  }

  return (
    <main className="flex-1 pl-6 bg-blue-50">
      <Charts
        data={[data.accounts, data.summary, data.summaryExpenses, data.summaryIncomes]}
        title={["November Expenses", "November Incomes"]}
        label={["Expenses", "Incomes"]}
        dataKey={["totalAmount", "totalAmount"]}
        nameKey={["categoryName", "categoryName"]}
      />
      <FinancialSummary data={data} />
      <TransactionModal data={data} />
      {/* <TransactionList transactions={transactions} /> */}
      <BudgetManagement />
      <FutureExpenses />
      <CustomCategories />
      <AccountSettings />
      <Support />
    </main>
  )
}