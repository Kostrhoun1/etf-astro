'use client';

import React from "react";
import type { SimulationResult } from "@/types/monteCarlo";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  AreaChart,
  XAxis,
  YAxis,
  Area,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface MonteCarloChartProps {
  results: SimulationResult[];
}

const chartConfig = {
  percentile5: { label: "Pesimistický (5%)", color: "#fca5a5" },
  percentile25: { label: "Konzervativní (25%)", color: "#fdba74" },
  percentile50: { label: "Realistický (50%)", color: "#60a5fa" },
  percentile75: { label: "Optimistický (75%)", color: "#86efac" },
  percentile95: { label: "Velmi optimistický (95%)", color: "#4ade80" },
  mean: { label: "Průměr", color: "#64748b" },
};

export const MonteCarloChart: React.FC<MonteCarloChartProps> = ({ results }) => {
  console.log("MonteCarloChart rendering with results:", results);
  
  if (!results || results.length === 0) {
    console.log("No results available for chart");
    return null;
  }

  // Formátování Y osa v Kč
  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="w-full h-[440px] pb-8">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <AreaChart data={results} margin={{ top: 16, right: 24, left: 60, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="year" 
            tickFormatter={(year) => `${year}. rok`}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#94a3b8" }}
            axisLine={{ stroke: "#94a3b8" }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            width={80}
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#94a3b8" }}
            axisLine={{ stroke: "#94a3b8" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelKey="year"
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  chartConfig[name as keyof typeof chartConfig]?.label || name
                ]}
                labelFormatter={(year) => `${year}. rok`}
              />
            }
          />
          <ChartLegend 
            content={<ChartLegendContent nameKey="dataKey" />}
            wrapperStyle={{ paddingTop: "20px" }}
          />
          <Area
            type="monotone"
            dataKey="percentile5"
            stroke={chartConfig.percentile5.color}
            fill={chartConfig.percentile5.color}
            fillOpacity={0.13}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="percentile25"
            stroke={chartConfig.percentile25.color}
            fill={chartConfig.percentile25.color}
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="percentile50"
            stroke={chartConfig.percentile50.color}
            fill={chartConfig.percentile50.color}
            fillOpacity={0.22}
            strokeWidth={3}
          />
          <Area
            type="monotone"
            dataKey="percentile75"
            stroke={chartConfig.percentile75.color}
            fill={chartConfig.percentile75.color}
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="percentile95"
            stroke={chartConfig.percentile95.color}
            fill={chartConfig.percentile95.color}
            fillOpacity={0.13}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="mean"
            stroke={chartConfig.mean.color}
            fill="none"
            strokeDasharray="6 3"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default MonteCarloChart;