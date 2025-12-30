'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FeeScenario {
  name: string;
  totalExpenseRatio: number;
  entryFee: number;
  color: string;
}

interface FeeCalculationResult {
  scenario: FeeScenario;
  year: number;
  grossValue: number;
  netValue: number;
  totalFees: number;
  feeImpact: number;
}

interface FeeComparisonChartProps {
  data: FeeCalculationResult[];
}

const FeeComparisonChart: React.FC<FeeComparisonChartProps> = ({ data }) => {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 p-3 rounded shadow-lg">
          <p className="font-medium">{`Rok: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatNumber(entry.value)} Kč`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Transformuj data pro graf
  const chartData = data.reduce((acc: any[], result) => {
    const existingYear = acc.find(item => item.year === result.year);
    if (existingYear) {
      existingYear[result.scenario.name] = result.netValue;
    } else {
      acc.push({
        year: result.year,
        [result.scenario.name]: result.netValue
      });
    }
    return acc;
  }, []);

  // Získej unikátní scénáře pro legenda
  const scenarios = data.reduce((acc: FeeScenario[], result) => {
    if (!acc.find(s => s.name === result.scenario.name)) {
      acc.push(result.scenario);
    }
    return acc;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Srovnání růstu portfolia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                className="text-muted-foreground"
              />
              <YAxis 
                className="text-muted-foreground"
                tickFormatter={formatNumber}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {scenarios.map((scenario) => (
                <Line
                  key={scenario.name}
                  type="monotone"
                  dataKey={scenario.name}
                  stroke={scenario.color}
                  strokeWidth={2}
                  name={scenario.name}
                  dot={{ fill: scenario.color, strokeWidth: 2, r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeComparisonChart;