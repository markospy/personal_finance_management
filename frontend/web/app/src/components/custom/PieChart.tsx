"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface InfoChart {
    label: string;
    chartData: object;
    nameKey: string;
    dataKey: string;
}

interface Info {
    dataArray: Record<string, string|number>[];
    nameKey: string;
    label: string;
}

function capitalizeFirstLetter(str: string) {
  if (typeof str !== 'string') {
      throw new Error('Input must be a string');
  }

  if (!str) return str; // Handle empty string case
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createConfig({dataArray, nameKey, label}: Info) {
    // Esta funcion sirve para crear el objeto chartConfig
    const chartConfig: Record<string, Record<string, string>> = {}
    dataArray.map((data, index) => {
      chartConfig[data[nameKey]] = {
          label: capitalizeFirstLetter(data[nameKey] as string),
          color: `hsl(var(--chart-${index+1}))`
      };
  });
  chartConfig[label] = {label};

  return chartConfig;
};

export function PieChartCustom({label, chartData, dataKey, nameKey}: InfoChart) {
  const dataArray: Record<string, string|number>[] = Object.values(chartData)
  // La siguiente linea es para agregar la propiedad fill, la cual es necesaria para darle color a cada una las variables representadas en el grafico
  dataArray.map((data: object ) => data['fill'] = `var(--color-${data['categoryName']})`)


  const total = React.useMemo(() => {
    return dataArray.map((data: object ) => data[dataKey]).reduce((acc, curr) => acc + curr, 0)
  }, [dataArray, dataKey])

  const chartConfig = createConfig({dataArray, nameKey, label}) satisfies ChartConfig

  console.log((chartConfig))
  console.log(dataArray)
  console.log(total)

  return (
    <div>
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg font-normal">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={dataArray}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {`$${total}`}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {label}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </div>
  )
}