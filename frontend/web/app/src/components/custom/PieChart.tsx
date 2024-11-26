"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
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
    title: string;
    description?: string;
    label: string;
    chartData: any;
    nameKey: string;
    dataKey: string;
}

interface Info {
    dataArray: any;
    nameKey: string;
    label: string;
}

function capitalizeFirstLetter(string: string) {
    if (!string) return string; // Manejar el caso de cadena vacía
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createConfig({dataArray, nameKey, label}: Info) {
    // Esta funcion sirve para crear el objeto chartConfig
    let chartConfig = {}
    dataArray.map((data, index) => {
      chartConfig[data[nameKey]] = {
          label: capitalizeFirstLetter(data[nameKey]),
          color: `hsl(var(--chart-${index+1}))`
      };
  });
  chartConfig[label] = {label};

  return chartConfig;
};

export function PieChartCustom({title, description, label, chartData, dataKey, nameKey}: InfoChart) {
  const dataArray = Object.values(chartData)
  // La siguiente linea es para agregar la propiedad fill, la cual es necesaria para darle color a cada una las variables representadas en el grafico
  dataArray.map(data => data['fill'] = `var(--color-${data['categoryName']})`)


  const total = React.useMemo(() => {
    return dataArray.map(data => data[dataKey]).reduce((acc, curr) => acc + curr, 0)
  }, [dataArray, dataKey])

  const chartConfig = createConfig({dataArray, nameKey, label}) satisfies ChartConfig

  return (
    <Card className="flex flex-col ">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
                          {total.toLocaleString()}
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
    </Card>
  )
}