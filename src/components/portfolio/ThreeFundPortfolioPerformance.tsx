'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BarChart3Icon } from '../ui/icons';
import { supabase } from '../../lib/supabase';
import { CurrencyToggle } from '../ui/CurrencyToggle';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ETFData {
  isin: string;
  name: string;
  return_ytd: number | null;
  return_1y: number | null;
  return_3y: number | null;
  return_5y: number | null;
  return_ytd_czk: number | null;
  return_1y_czk: number | null;
  return_3y_czk: number | null;
  return_5y_czk: number | null;
  return_ytd_usd: number | null;
  return_1y_usd: number | null;
  return_3y_usd: number | null;
  return_5y_usd: number | null;
  ter_numeric: number | null;
}

// Definice Three-Fund Portfolia podle aktuálního složení
const threeFundPortfolioAllocations = [
  { asset: 'Rozvinuté světové akcie', percentage: 60, isin: 'IE00BKX55T58', etfName: 'Vanguard FTSE Developed World' },
  { asset: 'Rozvíjející se trhy', percentage: 20, isin: 'IE00BK5BR626', etfName: 'Vanguard FTSE Emerging Markets' },
  { asset: 'Světové dluhopisy', percentage: 20, isin: 'IE00BG47KH54', etfName: 'Vanguard Global Bond Index' },
];

const ThreeFundPortfolioPerformance: React.FC = () => {
  const [etfData, setEtfData] = useState<Record<string, ETFData>>({});
  const [loading, setLoading] = useState(true);
  const { selectedCurrency, getPerformanceValue } = useCurrency();

  useEffect(() => {
    fetchETFData();
  }, []);

  // Přepočítáme performance při změně měny
  useEffect(() => {
    // Trigger re-render when currency changes
  }, [selectedCurrency]);

  const fetchETFData = async () => {
    try {
      const isins = threeFundPortfolioAllocations.map(allocation => allocation.isin);

      const { data, error } = await supabase
        .from('etf_funds')
        .select('isin, name, return_ytd, return_1y, return_3y, return_5y, return_ytd_czk, return_1y_czk, return_3y_czk, return_5y_czk, return_ytd_usd, return_1y_usd, return_3y_usd, return_5y_usd, ter_numeric')
        .in('isin', isins);

      if (error) {
        console.error('Error fetching ETF data:', error);
        return;
      }

      const etfMap: Record<string, ETFData> = {};
      data?.forEach(etf => {
        etfMap[etf.isin] = etf;
      });

      setEtfData(etfMap);
    } catch (error) {
      console.error('Error fetching ETF data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioPerformance = () => {
    const periods = ['ytd', '1y', '3y', '5y'] as const;
    const results: Record<string, number | null> = {};

    for (const period of periods) {
      let weightedReturn = 0;
      let totalAvailableWeight = 0;

      for (const allocation of threeFundPortfolioAllocations) {
        const etf = etfData[allocation.isin];
        if (etf) {
          const performanceValue = getPerformanceValue(etf as any, period);
          if (performanceValue !== null && performanceValue !== undefined) {
            weightedReturn += (allocation.percentage / 100) * performanceValue;
            totalAvailableWeight += allocation.percentage / 100;
          }
        }
      }

      if (totalAvailableWeight >= 0.8) {
        results[`return_${period}`] = weightedReturn / totalAvailableWeight;
      } else {
        results[`return_${period}`] = null;
      }
    }

    return results;
  };

  const formatPerformance = (value: number | null) => {
    if (value === null) return '-';
    const formatted = value.toFixed(2);
    return `${value >= 0 ? '+' : ''}${formatted}%`;
  };

  const getPerformanceColor = (value: number | null) => {
    if (value === null) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="mb-12">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <BarChart3Icon className="text-purple-600" />
              Reálná výkonnost portfolia
            </CardTitle>
            <CurrencyToggle className="text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Načítám data výkonnosti...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const performance = calculatePortfolioPerformance();

  return (
    <Card className="mb-12" id="vykonnost">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <BarChart3Icon className="text-purple-600" />
            Reálná výkonnost portfolia
          </CardTitle>
          <CurrencyToggle className="text-sm" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(performance.return_ytd as number)}`}>
              {formatPerformance(performance.return_ytd as number)}
            </div>
            <div className="text-gray-600 mb-1">Letos (YTD)</div>
            <div className="text-sm text-gray-500">Aktuální rok</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(performance.return_1y as number)}`}>
              {formatPerformance(performance.return_1y as number)}
            </div>
            <div className="text-gray-600 mb-1">1 rok</div>
            <div className="text-sm text-gray-500">Posledních 12 měsíců</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(performance.return_3y as number)}`}>
              {formatPerformance(performance.return_3y as number)}
            </div>
            <div className="text-gray-600 mb-1">3 roky</div>
            <div className="text-sm text-gray-500">Celkový výnos</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(performance.return_5y as number)}`}>
              {formatPerformance(performance.return_5y as number)}
            </div>
            <div className="text-gray-600 mb-1">5 let</div>
            <div className="text-sm text-gray-500">Celkový výnos</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Složení portfolia a výkonnost jednotlivých ETF</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Aktivum</th>
                  <th className="text-right py-2">Alokace</th>
                  <th className="text-right py-2">1 rok</th>
                  <th className="text-right py-2">3 roky</th>
                  <th className="text-right py-2">TER</th>
                </tr>
              </thead>
              <tbody>
                {threeFundPortfolioAllocations.map((allocation) => {
                  const etf = etfData[allocation.isin];
                  return (
                    <tr key={allocation.isin} className="border-b">
                      <td className="py-2">
                        <div className="font-medium">{allocation.asset}</div>
                        <div className="text-xs text-gray-500">{allocation.etfName}</div>
                      </td>
                      <td className="text-right py-2 font-semibold">{allocation.percentage}%</td>
                      <td className={`text-right py-2 ${getPerformanceColor(getPerformanceValue(etf as any, '1y'))}`}>
                        {formatPerformance(getPerformanceValue(etf as any, '1y'))}
                      </td>
                      <td className={`text-right py-2 ${getPerformanceColor(getPerformanceValue(etf as any, '3y'))}`}>
                        {formatPerformance(getPerformanceValue(etf as any, '3y'))}
                      </td>
                      <td className="text-right py-2 text-gray-600">
                        {etf?.ter_numeric ? `${etf.ter_numeric.toFixed(2)}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              * Výkonnost je kalkulována na základě váženého průměru jednotlivých ETF podle alokace
            </div>
            <div className="text-xs text-gray-500">
              * TER = Total Expense Ratio (roční poplatek za správu)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreeFundPortfolioPerformance;