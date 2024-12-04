import { GetMonthlyExpenses, GetMonthlyIncomes, GetMonthlySumary } from "@/services/statistic";
import {  GetAccounts } from "@/services/account";
import { redirect, useLoaderData } from "react-router-dom";
import { AccountForm } from "@/components/custom/AccountModal";
import { CategoryOut } from "@/schemas/category";
import { AccountOut } from "@/schemas/account";
import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic";
import { GetCategories } from "@/services/category";
import { ErrorResponse } from "@/schemas/error";
import FinancialSummary from "@/components/custom/FinancialSummary";
import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DateIn } from "@/schemas/date";
import { isAccount, isMonthlyExpenses, isMonthlyIncomes, isMonthlySummary } from "@/utils/guards";

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

  const accounts: AccountOut[] | ErrorResponse = await queryClient.ensureQueryData(GetAccounts(token))
  const categories: CategoryOut[] | ErrorResponse = await queryClient.ensureQueryData(GetCategories(token))
  const summary: MonthlySumary | ErrorResponse = await queryClient.ensureQueryData(GetMonthlySumary(token, date))
  const summaryExpenses: MonthlyExpenses[] | ErrorResponse = await queryClient.ensureQueryData(GetMonthlyExpenses(token, date))
  const summaryIncomes: MonthlyIncomes[] | ErrorResponse = await queryClient.ensureQueryData(GetMonthlyIncomes(token, date))

  return {
    'summary': {...summary},
    'summaryExpenses': {...summaryExpenses},
    'summaryIncomes': {...summaryIncomes},
    'accounts': {...accounts},
    'categories': {...categories},
  };
};

export function ReportMain() {
  const data: LoaderData = useLoaderData()
  console.log(data)
  const [date, setDate] = useState<DateIn>(
    {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
    }
  )

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
       dataKey={["Expenses", "Incomes"]}
       nameKey={["categoryName", "categoryName"]}
       date={date}
       onChangeDate={setDate}
      />
    </main>
  )
}



// TODO: [QUEDA PENDIENTE LOGRAR PASAR EL VALOR DEL ESTADO DEL OBJETO DATA A]
// TODO: [LA FUNCION LOADER PARA PARAMETRIZAR LOS FETCH DE LAS ESTADISTICAS]