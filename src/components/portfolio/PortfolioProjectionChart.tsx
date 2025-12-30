import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from '../ui/badge';
import { TargetIcon, ClockIcon, TrendingUpIcon } from '../ui/icons';
import { calculatePortfolioProjection, formatCurrency, formatPercentage } from '../../utils/portfolioProjectionEngine';

interface PortfolioProjectionChartProps {
  portfolioName: string;
  riskLevel: number;
  defaultMonthlyAmount: number;
  initialAmount?: number;
  expectedReturn: number;
}

export const PortfolioProjectionChart: React.FC<PortfolioProjectionChartProps> = ({
  portfolioName,
  riskLevel,
  defaultMonthlyAmount,
  initialAmount = 0,
  expectedReturn
}) => {
  const projectionData = useMemo(() => {
    return calculatePortfolioProjection({
      initialAmount,
      monthlyContribution: defaultMonthlyAmount,
      riskLevel,
      timeHorizonYears: 20,
      portfolioType: portfolioName,
      expectedReturn: expectedReturn
    });
  }, [initialAmount, defaultMonthlyAmount, riskLevel, portfolioName, expectedReturn]);

  // Transformace dat pro chart (pouze každý 12. měsíc = roky)
  const chartData = projectionData.dataPoints
    .filter((point, index) => index % 4 === 0) // Každý 4. bod (kvartály)
    .map(point => ({
      year: point.year,
      'Pesimistický': Math.round(point.pessimistic / 1000),
      'Realistický': Math.round(point.realistic / 1000),
      'Optimistický': Math.round(point.optimistic / 1000),
      'Příspěvky': Math.round(point.contributions / 1000)
    }));

  const formatTooltipValue = (value: number, name: string) => {
    return [`${value} tis. Kč`, name];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="w-5 h-5 text-violet-600" />
          Projekce růstu portfolia
        </CardTitle>
        <CardDescription>
          Odhad vývoje vašeho portfolia{initialAmount > 0 ? ` se vstupní investicí ${formatCurrency(initialAmount)}` : ''} při měsíčních příspěvcích {formatCurrency(defaultMonthlyAmount)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Klíčové metriky */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-800">Realistický scénář</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(projectionData.finalValues.realistic)}
            </div>
            <div className="text-sm text-green-600">
              za 20 let ({formatPercentage(projectionData.averageAnnualReturns.realistic)} ročně)
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Celkové příspěvky</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(projectionData.finalValues.totalContributions)}
            </div>
            <div className="text-sm text-blue-600">
              {initialAmount > 0 ? `${formatCurrency(initialAmount)} vstupní + ` : ''}20 let × {formatCurrency(defaultMonthlyAmount)}/měsíc
            </div>
          </div>

          <div className="bg-violet-50 p-4 rounded-lg border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className="w-4 h-4 text-violet-600" />
              <span className="font-semibold text-violet-800">Zhodnocení</span>
            </div>
            <div className="text-2xl font-bold text-violet-900">
              {formatCurrency(projectionData.finalValues.realistic - projectionData.finalValues.totalContributions)}
            </div>
            <div className="text-sm text-violet-600">
              čistý zisk z investování
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}. rok`}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value} tis.`}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={(label) => `${label}. rok`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="Příspěvky"
                stackId="1"
                stroke="#6b7280"
                fill="#6b7280"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="Pesimistický"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="Realistický"
                stackId="3"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="Optimistický"
                stackId="4"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Scénáře */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Scénáře vývoje:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {projectionData.scenarios.map((scenario, index) => (
              <div key={scenario.name} className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={
                    scenario.name === 'Optimistický' ? 'border-violet-500 text-violet-700' :
                    scenario.name === 'Realistický' ? 'border-green-500 text-green-700' :
                    'border-red-500 text-red-700'
                  }
                >
                  {scenario.name}
                </Badge>
                <span className="text-sm text-gray-600">
                  {formatPercentage(scenario.annualReturn)} ročně
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Upozornění:</strong> Tyto projekce jsou pouze odhady založené na historických datech. 
          Skutečné výnosy se mohou lišit. Minulé výsledky nejsou zárukou budoucích výnosů.
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioProjectionChart;