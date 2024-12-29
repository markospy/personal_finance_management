"use client"

import montonDeDinero from '../../assets/monton_de_dinero.png';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  ResponsiveContainer } from 'recharts'
import { ChartContainer } from "@/components/ui/chart"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { MonthlyExpenses, MonthlyIncomes, MonthlySumary } from "@/api/statistic"
import { PieChartCustom } from "./PieChart"
import { DateIn } from "@/schemas/date"
import { useState } from "react"
import { isMonthlyExpenses, isMonthlyIncomes } from "@/utils/guards"
import { useNavigate, useSearchParams } from "react-router-dom"

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
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const currentYear = new Date().getFullYear()
const years = Array.from({length: 5}, (_, i) => currentYear - i)

const NoDataComponent = ({ message }:{ message:string }) => {
  return (
    <div className="relative flex flex-col items-center">
      <span className='top-1/2 absolute font-medium text-gray-300 text-xs'>{message}</span>
      <img
        src={montonDeDinero}
        alt="Imagen de bolsa con signo de dinero llena de monedas de oro, rodeada de otras tantas monedas de oro y un fajo de dolares americanos"
        className='opacity-20 animate-sink size-72'
      />
    </div>
  );
};

export default function TransactionsSummary({data, label, dataKey, nameKey}: ChartsInfo) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const year = Number(searchParams.get('year'));
  const month = Number(searchParams.get('month'));
  const [date, setDate] = useState<DateIn>(
    {
      year: year > 2000 ? year : new Date().getFullYear(),
      month: month > 2000 ? month : new Date().getMonth()+1,
    }
  )
  console.log(date)
  let netBalance: number = 0;
  if(isMonthlyExpenses(data.summaryExpenses) && isMonthlyIncomes(data.summaryIncomes)){
    const totalIncomes: number = (typeof data.summary !== 'boolean') ? data.summary.totalIncomes : 0
    const totalExpenses: number = (typeof data.summary !== 'boolean') ? data.summary.totalExpenses : 0
    netBalance = totalIncomes - totalExpenses
  }

  const handleMonthChange = (value: string) => {
    setDate(date => ({
      ...date,
      month: months.indexOf(value)+1
    }));
    console.log(value);
    console.log(`/dashboard/?year=${date.year}&month=${months.indexOf(value)+1}`);
    navigate(`/dashboard/?year=${date.year}&month=${months.indexOf(value)+1}`);
  };

  const handleYearChange = (value: string) => {
    setDate(date => ({
      ...date,
      year: parseInt(value)
    }));
    console.log(`/dashboard/?year=${value}&month=${date.month}`);
    navigate(`/dashboard/?year=${value}&month=${date.month}`);
  };



  console.log(data)
  console.log(date)
  return (
    <Card className="mx-auto pb-12 w-full max-w-4xl h-fit">
      <CardHeader className="pb-4 animate-blurred-fade-in">
        <CardTitle className="mb-2 font-bold text-2xl">Resumen Mensual</CardTitle>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Select
              value={months[date.month-1]}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={months[index]}>{months[index]}</SelectItem>
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
          {(data.summaryExpenses && data.summaryIncomes) ?
            <div className={`flex items-center ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span className="mr-2 font-bold text-2xl">
                {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toLocaleString()}
              </span>
              {netBalance >= 0 ? <ArrowUpIcon size={24} /> : <ArrowDownIcon size={24} />}
            </div> :
            <></>
          }
        </div>
      </CardHeader>
      <CardContent className="flex justify-between animate-blurred-fade-in">
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
            { data.summaryExpenses ? (
              <PieChartCustom
                label={label[0]}
                dataKey={dataKey[0]}
                nameKey={nameKey[0]}
                chartData={data.summaryExpenses as MonthlyExpenses[]}
              />
            ) : (
              <NoDataComponent message='No hay datos de gastos disponibles' />
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
            { data.summaryIncomes ? (
              <PieChartCustom
                label={label[1]}
                dataKey={dataKey[1]}
                nameKey={nameKey[1]}
                chartData={data.summaryIncomes as MonthlyIncomes[]}
              />
            ) : (
              <NoDataComponent message='No hay datos de ingresos disponibles' />
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}