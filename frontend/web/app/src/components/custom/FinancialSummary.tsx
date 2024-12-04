"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  ResponsiveContainer } from 'recharts'
import { ChartContainer } from "@/components/ui/chart"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic"
import { PieChartCustom } from "./PieChart"
import { DateIn } from "@/schemas/date"
import { Dispatch, SetStateAction } from "react"
import { isMonthlyExpenses, isMonthlyIncomes } from "@/utils/guards"

interface Data {
  summary: MonthlySumary | false;
  summaryExpenses: MonthlyExpenses[] | false;
  summaryIncomes: MonthlyIncomes[] | false;
}

interface ChartsInfo {
  data: Data;
  label: string[];
  dataKey: string[];
  nameKey: string[];
  date: DateIn;
  onChangeDate: Dispatch<SetStateAction<DateIn>>;
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const currentYear = new Date().getFullYear()
const years = Array.from({length: 5}, (_, i) => currentYear - i)

export default function FinancialSummary({data, label, dataKey, nameKey, date, onChangeDate}: ChartsInfo) {
  let netBalance: number = 0;
  if(isMonthlyExpenses(data.summaryExpenses) && isMonthlyIncomes(data.summaryIncomes)){
    const totalIncomes: number = (typeof data.summary !== 'boolean') ? data.summary.totalIncomes : 0
    const totalExpenses: number = (typeof data.summary !== 'boolean') ? data.summary.totalExpenses : 0
    netBalance = totalIncomes - totalExpenses
  }

  const handleMonthChange = (value: string) => {
    onChangeDate(date => ({
      ...date,
      month: months.indexOf(value)
    }));
  };

  const handleYearChange = (value: string) => {
    onChangeDate(date => ({
      ...date,
      year: parseInt(value)
    }));
  };

  console.log(data)
  console.log(date)
  return (
    <Card className="w-full h-80 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Dashboard Financiero</CardTitle>
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-4">
            <Select
              value={months[date.month]}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={date.year.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecciona un año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className={`flex items-center ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span className="text-2xl font-bold mr-2">
              {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toLocaleString()}
            </span>
            {netBalance >= 0 ? <ArrowUpIcon size={24} /> : <ArrowDownIcon size={24} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between">
        <ChartContainer
          config={{
            income: {
              label: "Ingresos",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="w-1/2"
        >
          <ResponsiveContainer width="100%" height={300}>
            { Object.keys(data.summaryExpenses).length ? (
              <PieChartCustom
                label={label[0]}
                dataKey={dataKey[0]}
                nameKey={nameKey[0]}
                chartData={data.summaryExpenses}
              />
            ) : (
              <span>No hay datos de gastos disponibles</span>
            )}
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer
          config={{
            expenses: {
              label: "Gastos",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="w-1/2"
        >
          <ResponsiveContainer width="100%" height={300}>
            { Object.keys(data.summaryIncomes).length != 0 ? (
              <PieChartCustom
                label={label[1]}
                dataKey={dataKey[1]}
                nameKey={nameKey[1]}
                chartData={data.summaryIncomes}
              />
            ) : (
              <span>No hay datos de ingresos disponibles</span>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

