import { GetMonthlyExpenses, GetMonthlyIncomes, GetMonthlySumary } from "@/services/statistic";
import {  GetAccounts } from "@/services/account";
import { redirect, useLoaderData, useSearchParams } from "react-router-dom";
import { AccountForm } from "@/components/custom/AccountModal";
import { CategoryOut } from "@/schemas/category";
import { AccountOut } from "@/schemas/account";
import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic";
import { GetCategories } from "@/services/category";
import { ErrorResponse } from "@/schemas/error";
import FinancialSummary from "@/components/custom/FinancialSummary";
import { QueryClient } from "@tanstack/react-query";
import { isAccount, isMonthlyExpenses, isMonthlyIncomes, isMonthlySummary } from "@/utils/guards";
import { useState } from "react";

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

function isTokenExpired(token: string): boolean {
  // Decodifica el token para obtener su contenido
  const payload = JSON.parse(atob(token.split('.')[1]));

  // Obtiene la fecha de expiración
  const exp = payload.exp;

  // Comprueba si la fecha de expiración es menor que la fecha actual
  return exp < Math.floor(Date.now() / 1000);
}

export const loader = (queryClient: QueryClient) => async ({ request }) => {
  const token = window.localStorage.getItem('token') as string;
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

export function ReportMain() {
  const data: LoaderData = useLoaderData()
  console.log(data)

  const sumaryData: SummaryData = {
    'summary': isMonthlySummary(data.summary) && data.summary,
    'summaryExpenses': isMonthlyExpenses(data.summaryExpenses) && data.summaryExpenses,
    'summaryIncomes': isMonthlyIncomes(data.summaryIncomes) && data.summaryIncomes,
  }

  if(isAccount(data.accounts)) {
    return (
      <AccountForm />
    )
  }

  return (
    <main className="flex-1 pl-6 bg-blue-50">
      <FinancialSummary
       data={sumaryData}
       label={["Expenses", "Incomes"]}
       dataKey={["totalAmount", "totalAmount"]}
       nameKey={["categoryName", "categoryName"]}
      />
    </main>
  )
}