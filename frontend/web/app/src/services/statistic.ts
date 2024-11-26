import { getMonthlyExpenses, getMonthlyIncomes, getMonthlySumary, MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic";
import { DateIn } from "@/schemas/date";
import { QueryClient } from "@tanstack/react-query";

export function GetMonthlySumary(token: string, date: DateIn) {
    return {
        queryKey: ["monthlySumary", date],
        queryFn: () => getMonthlySumary(token, date),
    }
}

export function GetMonthlyExpenses(token: string, date: DateIn) {
    return {
        queryKey: ["monthlyExpenses", date],
        queryFn: () => getMonthlyExpenses(token, date),
    }
}

export function GetMonthlyIncomes(token: string, date: DateIn) {
    return {
        queryKey: ["monthlyIncomes", date],
        queryFn: () => getMonthlyIncomes(token, date),
    }
}

export async function GetMonthlySumaryTryCatch(token: string, date: DateIn, queryClient: QueryClient) {
    let summary: MonthlySumary | null = null;
    try {
        summary = await queryClient.ensureQueryData(GetMonthlySumary(token, date));
    } catch (error) {
    console.error('Error fetching monthly summary:', error);
    // summary seguirá siendo null si hay un error
    }
    return summary;
}

export async function GetMonthlyExpensesTryCatch(token: string, date: DateIn, queryClient: QueryClient) {
    let summaryExpenses: MonthlyExpenses[] | null = null;
    try {
        summaryExpenses = await queryClient.ensureQueryData(GetMonthlyExpenses(token, date));
    } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    // summary seguirá siendo null si hay un error
    }
    return summaryExpenses;
}


export async function GetMonthlyIncomesTryCatch(token: string, date: DateIn, queryClient: QueryClient) {
    let summaryIncomes: MonthlyIncomes[] | null = null;
    try {
        summaryIncomes = await queryClient.ensureQueryData(GetMonthlyIncomes(token, date));
    } catch (error) {
    console.error('Error fetching monthly incomes:', error);
    // summary seguirá siendo null si hay un error
    }
    return summaryIncomes;
}