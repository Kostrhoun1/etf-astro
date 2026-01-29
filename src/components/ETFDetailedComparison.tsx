'use client';

import React from 'react';
import type { ETF } from '@/types/etf';
import { formatPercentage, formatTER } from '@/utils/csvParser';
import { formatCurrency, getDistributionPolicyLabel } from '@/utils/etfFormatters';
import { useCurrency } from '@/contexts/CurrencyContext';
import ETFDetailedComparisonHeader from './comparison/ETFDetailedComparisonHeader';
import ETFComparisonTable from './comparison/ETFComparisonTable';
import ETFPerformanceMetricsTable from './comparison/ETFPerformanceMetricsTable';
import ETFFundDetailsTable from './comparison/ETFFundDetailsTable';
import ETFHoldingsTable from './comparison/ETFHoldingsTable';
import ETFCountriesTable from './comparison/ETFCountriesTable';
import ETFSectorsTable from './comparison/ETFSectorsTable';
import ETFExchangesTable from './comparison/ETFExchangesTable';

interface ETFDetailedComparisonProps {
  selectedETFs: ETF[];
  onBack: () => void;
}

const ETFDetailedComparison: React.FC<ETFDetailedComparisonProps> = ({
  selectedETFs,
  onBack,
}) => {
  const { getPerformanceValue } = useCurrency();

  const basicInfoData = [
    { label: 'Poskytovatel', key: 'fund_provider' },
    { label: 'Kategorie', key: 'category' },
    { label: 'Sledovaný index', key: 'index_name' },
    { label: 'Typ fondu', key: 'distribution_policy', format: (value: string) => getDistributionPolicyLabel(value) },
    { label: 'Měna fondu', key: 'fund_currency' },
    { label: 'Ticker', key: 'primary_ticker', format: (value: string) => value ? value : '-' },
    { label: 'DEGIRO Free', key: 'degiro_free', format: (value: boolean) => value ? 'Ano' : 'Ne' },
  ];

  const feesAndSizeData = [
    { label: 'TER (roční poplatek)', key: 'ter_numeric', format: (value: number) => formatTER(value), className: 'font-mono' },
    { label: 'Velikost fondu', key: 'fund_size_numeric', format: (value: number, etf: ETF) => formatCurrency(value, etf?.fund_currency), className: 'font-mono' },
  ];

  const performanceData = [
    {
      label: 'Výnos 1 měsíc',
      key: 'performance_1m',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '1m');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 3 měsíce',
      key: 'performance_3m',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '3m');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 6 měsíců',
      key: 'performance_6m',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '6m');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'YTD výnos',
      key: 'performance_ytd',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, 'ytd');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 1 rok',
      key: 'performance_1y',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '1y');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 3 roky',
      key: 'performance_3y',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '3y');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 5 let',
      key: 'performance_5y',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '5y');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
  ];

  const yearlyPerformanceData = [
    {
      label: 'Výnos 2025',
      key: 'performance_2025',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '2025');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 2024',
      key: 'performance_2024',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '2024');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 2023',
      key: 'performance_2023',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '2023');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 2022',
      key: 'performance_2022',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '2022');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
    {
      label: 'Výnos 2021',
      key: 'performance_2021',
      format: (value: any, etf: ETF) => {
        const perfValue = getPerformanceValue(etf, '2021');
        return perfValue !== null ? formatPercentage(perfValue) : '-';
      },
      className: 'font-mono'
    },
  ];

  if (selectedETFs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ETFDetailedComparisonHeader onBack={onBack} />
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            Nejsou vybrány žádné fondy pro porovnání.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ETFDetailedComparisonHeader onBack={onBack} />

      <div className="space-y-6">
        <ETFComparisonTable title="Základní informace" data={basicInfoData} selectedETFs={selectedETFs} />
        <ETFComparisonTable title="Poplatky a velikost fondu" data={feesAndSizeData} selectedETFs={selectedETFs} />
        <ETFComparisonTable title="Výkonnost" data={performanceData} selectedETFs={selectedETFs} />
        <ETFComparisonTable title="Roční výkonnost" data={yearlyPerformanceData} selectedETFs={selectedETFs} />
        <ETFPerformanceMetricsTable selectedETFs={selectedETFs} />
        <ETFFundDetailsTable selectedETFs={selectedETFs} />
        <ETFHoldingsTable selectedETFs={selectedETFs} />
        <ETFCountriesTable selectedETFs={selectedETFs} />
        <ETFSectorsTable selectedETFs={selectedETFs} />
        <ETFExchangesTable selectedETFs={selectedETFs} />
      </div>
    </div>
  );
};

export default ETFDetailedComparison;
