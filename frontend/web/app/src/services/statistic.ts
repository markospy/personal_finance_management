import { getMonthlyExpenses, getMonthlyIncomes, getMonthlySumary } from "@/api/statistic";
import { DateIn } from "@/schemas/date";
import {  queryOptions } from "@tanstack/react-query";

export function GetMonthlySumary(token: string, date: DateIn) {
    return queryOptions({
        queryKey: ["monthlySumary", date],
        queryFn: () => getMonthlySumary(token, date),
    })
}

export function GetMonthlyExpenses(token: string, date: DateIn) {
    return queryOptions({
        queryKey: ["monthlyExpenses", date],
        queryFn: () => getMonthlyExpenses(token, date),
    })
}

export function GetMonthlyIncomes(token: string, date: DateIn) {
    return queryOptions({
        queryKey: ["monthlyIncomes", date],
        queryFn: () => getMonthlyIncomes(token, date),
    })
}