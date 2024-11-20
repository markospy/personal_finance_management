import { queryOptions } from "@tanstack/react-query";
import { getMonthlySumary } from "@/api/statistic";
import { DateIn } from "@/schemas/date";

export function GetMonthlySumary(token: string, date: DateIn) {
    return queryOptions({
        queryKey: ["monthlySumary"],
        queryFn: () => getMonthlySumary(token, date),
    })
}