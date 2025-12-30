'use client';

import React from 'react';
import type { ETF } from '@/types/etf';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPercentage } from '@/utils/csvParser';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ETFPerformanceTableProps {
  etf: ETF;
}

const ETFPerformanceTable: React.FC<ETFPerformanceTableProps> = ({ etf }) => {
  const { getPerformanceValue } = useCurrency();

  const getReturnColor = (value: number | null | undefined) => {
    if (!value) return 'text-gray-600';
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const performanceData = [
    { label: '1 měsíc', period: '1m' as const, riskField: null },
    { label: '3 měsíce', period: '3m' as const, riskField: null },
    { label: '6 měsíců', period: '6m' as const, riskField: null },
    { label: 'YTD', period: 'ytd' as const, riskField: null },
    { label: '1 rok', period: '1y' as const, riskField: 'return_per_risk_1y' },
    { label: '3 roky', period: '3y' as const, riskField: 'return_per_risk_3y' },
    { label: '5 let', period: '5y' as const, riskField: 'return_per_risk_5y' },
  ];

  const yearlyData = [
    { label: '2021', period: '2021' as const },
    { label: '2022', period: '2022' as const },
    { label: '2023', period: '2023' as const },
    { label: '2024', period: '2024' as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailní analýza výkonnosti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Výkonnost podle období */}
          <div>
            <h4 className="font-semibold mb-3">Výkonnost podle období</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Období</TableHead>
                  <TableHead className="text-right">Výnos</TableHead>
                  <TableHead className="text-right">Výnos na riziko</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.map(({ label, period, riskField }) => {
                  const returnValue = getPerformanceValue(etf, period);
                  const riskValue = riskField ? (etf[riskField as keyof ETF] as number) : null;
                  
                  return (
                    <TableRow key={period}>
                      <TableCell className="font-medium">{label}</TableCell>
                      <TableCell className={`text-right ${getReturnColor(returnValue)}`}>
                        {returnValue !== null ? formatPercentage(returnValue) : '-'}
                      </TableCell>
                      <TableCell className={`text-right ${getReturnColor(riskValue)}`}>
                        {riskValue ? formatPercentage(riskValue) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Roční výkonnost */}
          <div>
            <h4 className="font-semibold mb-3">Roční výkonnost</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {yearlyData.map(({ label, period }) => {
                const value = getPerformanceValue(etf, period);
                return (
                  <div key={period} className="text-center p-3 border rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">{label}</div>
                    <div className={`font-semibold ${getReturnColor(value)}`}>
                      {value !== null ? formatPercentage(value) : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ETFPerformanceTable;