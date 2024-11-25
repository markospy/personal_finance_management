import { getMonthlySumary, MonthlySumary } from "@/api/statistic";
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
        queryKey: ["monthlySumary", date],
        queryFn: () => getMonthlySumary(token, date),
    }
}

export function GetMonthlyIncomes(token: string, date: DateIn) {
    return {
        queryKey: ["monthlySumary", date],
        queryFn: () => getMonthlySumary(token, date),
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