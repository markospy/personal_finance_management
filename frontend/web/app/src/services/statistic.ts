import { getMonthlySumary } from "@/api/statistic";
import { DateIn } from "@/schemas/date";

export function GetMonthlySumary(token: string, date: DateIn) {
    return {
        queryKey: ["monthlySumary"],
        queryFn: () => getMonthlySumary(token, date),
    }
}