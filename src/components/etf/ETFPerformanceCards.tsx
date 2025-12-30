'use client';

import React from 'react';
import type { ETF } from '@/types/etf';
import { Card, CardContent } from "@/components/ui/card";
import { formatPercentage } from '@/utils/csvParser';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ETFPerformanceCardsProps {
  etf: ETF;
}

const ETFPerformanceCards: React.FC<ETFPerformanceCardsProps> = ({ etf }) => {
  const { getPerformanceValue } = useCurrency();

  const getReturnColor = (value: number | null | undefined) => {
    if (!value) return 'text-gray-600';
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const performanceCards = [
    { label: 'YTD výnos', period: 'ytd' as const },
    { label: '1 rok výnos', period: '1y' as const },
    { label: '3 roky výnos', period: '3y' as const },
    { label: '5 let výnos', period: '5y' as const },
  ];

  return (
    <>
      {performanceCards.map(({ label, period }) => {
        const value = getPerformanceValue(etf, period);
        return (
          <Card key={period}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${getReturnColor(value)}`}>
                {value !== null ? formatPercentage(value) : '-'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};

export default ETFPerformanceCards;