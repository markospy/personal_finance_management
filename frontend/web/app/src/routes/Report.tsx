/* eslint-disable react-refresh/only-export-components */
import { GetMonthlyExpenses, GetMonthlyIncomes, GetMonthlySumary } from "@/services/statistic";
import {  GetAccounts } from "@/services/account";
import { ActionFunctionArgs, redirect, useLoaderData } from "react-router-dom";
import { AccountForm } from "@/components/custom/AccountModal";
import { CategoryOut } from "@/schemas/category";
import { AccountOut } from "@/schemas/account";
import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic";
import { GetCategories } from "@/services/category";
import { ErrorResponse } from "@/schemas/error";
import TransactionsSummary from "@/components/custom/TransactionsSummary";
import { QueryClient } from "@tanstack/react-query";
import { isAccount, isCategory, isMonthlyExpenses, isMonthlyIncomes, isMonthlySummary } from "@/utils/guards";
import AccountsSummary from "@/components/custom/AccountsSummary";
import { RecentTransactions } from "../components/custom/Transactions";
import { getToken } from "@/utils/token";

interface LoaderData {
  summary: MonthlySumary | ErrorResponse;
  summaryExpenses: MonthlyExpenses[] | ErrorResponse;
  summaryIncomes: MonthlyIncomes[] | ErrorResponse;
  accounts: AccountOut[] | ErrorResponse;
  categories: CategoryOut[] | ErrorResponse;
}

interface SummaryData {
  summary: MonthlySumary | false;
  summaryExpenses: MonthlyExpenses[] | false;
  summaryIncomes: MonthlyIncomes[] | false;
}

export interface AccountsCategories {
  accounts: AccountOut[] | false;
  categories: CategoryOut[] | false;
}

function isTokenExpired(token: string): boolean {
  // Decodifica el token para obtener su contenido
  const payload = JSON.parse(atob(token.split('.')[1]));

  // Obtiene la fecha de expiración
  const exp = payload.exp;

  // Comprueba si la fecha de expiración es menor que la fecha actual
  return exp < Math.floor(Date.now() / 1000);
}

export const loader = (queryClient: QueryClient) => async ({ request }: ActionFunctionArgs) => {
  const token = getToken() as string;
  // Verificar si el token existe y no ha expirado
  if (token) {
    if (isTokenExpired(token)) {
      return redirect('/login');
    }
  } else {
    return redirect('/login');
  };
  const url = new URL(request.url);
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");
  console.log(year)
  let date = {
    'month': Number(month),
    'year': Number(year)
  };
  if (!year||Number(year)==0) {
    date = {
      'month': Number(month),
      'year': new Date().getFullYear(),
    };
  };
  if (!month) {
    date = {
      ...date,
      'month': new Date().getMonth()+1,
    };
  };

  console.log(date);

  const accounts: AccountOut[] | ErrorResponse = await queryClient.ensureQueryData(GetAccounts(token));
  const categories: CategoryOut[] | ErrorResponse = await queryClient.ensureQueryData(GetCategories(token));
  const summary: MonthlySumary | ErrorResponse = await queryClient.ensureQueryData(GetMonthlySumary(token, date));
  const summaryExpenses: MonthlyExpenses[] | ErrorResponse = await queryClient.ensureQueryData(GetMonthlyExpenses(token, date));
  const summaryIncomes: MonthlyIncomes[] | ErrorResponse = await queryClient.ensureQueryData(GetMonthlyIncomes(token, date));

  return {
    'summary': summary,
    'summaryExpenses': summaryExpenses,
    'summaryIncomes': summaryIncomes,
    'accounts': accounts,
    'categories': categories,
  };
};

export function ReportMain({queryClient}:{queryClient:QueryClient}) {
  const data = useLoaderData() as LoaderData;
  console.log(data)

  const sumaryData: SummaryData = {
    'summary': isMonthlySummary(data.summary) && data.summary,
    'summaryExpenses': isMonthlyExpenses(data.summaryExpenses) && data.summaryExpenses,
    'summaryIncomes': isMonthlyIncomes(data.summaryIncomes) && data.summaryIncomes,
  }

  const accountCategories: AccountsCategories = {
    'accounts': isAccount(data.accounts) && data.accounts,
    'categories': isCategory(data.categories) && data.categories,
  }
  console.log(data.accounts)
  console.log(isCategory(data.categories))
  console.log(accountCategories)

  if(!isAccount(data.accounts) && data.accounts.status == 500) {
    throw new Error('Tenemos problemas con el servidor. Intente mas tarde.')
  }

  if(!isAccount(data.accounts)) {
    return (
      <AccountForm queryClient={queryClient}/>
    )
  }

  return (
    <main className="flex flex-col flex-1 gap-2 pl-4 bg-blue-50">
      <AccountsSummary data={accountCategories} queryClient={queryClient}/>
      <TransactionsSummary
       data={sumaryData}
       label={["Expenses", "Incomes"]}
       dataKey={["totalAmount", "totalAmount"]}
       nameKey={["categoryName", "categoryName"]}
      />
      <RecentTransactions sizePage={5} queryClient={queryClient} />
    </main>
  )
}