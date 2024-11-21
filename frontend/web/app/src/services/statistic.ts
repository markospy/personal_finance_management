import { getMonthlySumary } from "@/api/statistic";
import { DateIn } from "@/schemas/date";

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