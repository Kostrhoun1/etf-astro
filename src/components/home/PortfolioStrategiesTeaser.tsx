'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowRightIcon, BarChart3Icon, HistoryIcon } from '../ui/icons';
import { supabase } from '../../lib/supabase';


interface ETFData {
  isin: string;
  return_ytd: number | null;
  return_1y: number | null;
}

interface PortfolioStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'Konzervativní' | 'Umírněné' | 'Agresivní';
  expectedReturn: string;
  allocations: Array<{
    asset: string;
    percentage: number;
    isin: string;
  }>;
}

// Top 3 nejpopulárnější strategie pro homepage - AKTUALIZOVÁNO dle finálního složení
const topStrategies: PortfolioStrategy[] = [
  {
    id: 'dividend',
    name: 'Dividendové Portfolio',
    description: 'Kvalitní dividendové akcie s růstem výplat',
    riskLevel: 'Umírněné',
    expectedReturn: '4% dividendy + růst',
    allocations: [
      { asset: 'Dividendové akcie', percentage: 95, isin: 'IE00B9CQXS71' },
      { asset: 'Nemovitosti (REITs)', percentage: 5, isin: 'IE00B1FZS350' },
    ],
  },
  {
    id: 'allweather',
    name: 'Ray Dalio All-Weather',
    description: 'Funguje ve všech ekonomických prostředích',
    riskLevel: 'Konzervativní',
    expectedReturn: '5-8% ročně',
    allocations: [
      { asset: 'Dlouhodobé dluhopisy', percentage: 40, isin: 'IE00BFM6TC58' },
      { asset: 'Akcie', percentage: 30, isin: 'IE00BK5BQT80' },
      { asset: 'Střednědobé dluhopisy', percentage: 15, isin: 'IE00B3VWN518' },
      { asset: 'Komodity', percentage: 7.5, isin: 'IE00BD6FTQ80' },
      { asset: 'Zlato', percentage: 7.5, isin: 'IE00B4ND3602' },
    ],
  },
  {
    id: 'nobel',
    name: 'Nobelovo Portfolio',
    description: 'Vyváženost mezi rizikem a výnosem',
    riskLevel: 'Umírněné',
    expectedReturn: '6% ročně',
    allocations: [
      { asset: 'Akcie', percentage: 55, isin: 'IE00BK5BQT80' },
      { asset: 'Dluhopisy', percentage: 25, isin: 'IE00BDBRDM35' },
      { asset: 'Nemovitosti', percentage: 20, isin: 'IE00B0M63284' },
    ],
  },
];

const PortfolioStrategiesTeaser: React.FC = () => {
  const [etfData, setEtfData] = useState<Record<string, ETFData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.error('ETF data fetch timeout');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    fetchETFData();

    return () => clearTimeout(timeout);
  }, []);

  const fetchETFData = async () => {
    try {
      const allISINs = topStrategies.flatMap(strategy => 
        strategy.allocations.map(allocation => allocation.isin)
      );
      const uniqueISINs = [...new Set(allISINs)];

      const { data, error } = await supabase
        .from('etf_funds')
        .select('isin, return_ytd, return_1y')
        .in('isin', uniqueISINs);

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

  const calculatePortfolioPerformance = (strategy: PortfolioStrategy, period: 'return_ytd' | 'return_1y') => {
    let weightedReturn = 0;
    let totalAvailableWeight = 0;

    for (const allocation of strategy.allocations) {
      const etf = etfData[allocation.isin];
      if (etf && etf[period] !== null && etf[period] !== undefined) {
        weightedReturn += (allocation.percentage / 100) * etf[period]!;
        totalAvailableWeight += allocation.percentage / 100;
      }
    }

    return totalAvailableWeight >= 0.8 ? weightedReturn / totalAvailableWeight : null;
  };

  const formatPerformance = (value: number | null) => {
    if (value === null) return '-';
    const formatted = value.toFixed(1);
    return `${value >= 0 ? '+' : ''}${formatted}%`;
  };

  const getPerformanceColor = (value: number | null) => {
    if (value === null) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Konzervativní': return 'bg-blue-100 text-blue-800';
      case 'Umírněné': return 'bg-yellow-100 text-yellow-800';
      case 'Agresivní': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám portfolio strategie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Ověřené Portfolio Strategie
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Porovnejte reálnou performance různých investičních přístupů založených na skutečných datech z naší databáze ETF fondů.
        </p>
      </div>

      {/* CTA - Backtest */}
      <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-6 mb-12 border border-blue-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <HistoryIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Otestujte strategie na historických datech</h3>
              <p className="text-gray-600 text-sm">Backtest portfolia od roku 2000 s reálnými daty</p>
            </div>
          </div>
          <a
            href="/kalkulacky/backtest-portfolia"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            Spustit backtest
            <ArrowRightIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {topStrategies.map((strategy) => {
          const ytdPerformance = calculatePortfolioPerformance(strategy, 'return_ytd');
          const yearPerformance = calculatePortfolioPerformance(strategy, 'return_1y');

          return (
            <Card key={strategy.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{strategy.name}</h3>
                <Badge className={getRiskBadgeColor(strategy.riskLevel)}>
                  {strategy.riskLevel}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4">{strategy.description}</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">YTD</span>
                  <span className={`font-bold ${getPerformanceColor(ytdPerformance)}`}>
                    {formatPerformance(ytdPerformance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">1 rok</span>
                  <span className={`font-bold ${getPerformanceColor(yearPerformance)}`}>
                    {formatPerformance(yearPerformance)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <span className="text-gray-500">Očekávaný výnos:</span>
                <span className="font-semibold ml-1">{strategy.expectedReturn}</span>
              </div>

              <div className="mt-4">
                <a
                  href={
                    strategy.id === 'dividend' ? '/portfolio-strategie/dividendove-portfolio' :
                    strategy.id === 'allweather' ? '/portfolio-strategie/ray-dalio-all-weather' :
                    strategy.id === 'nobel' ? '/portfolio-strategie/nobel-portfolio' :
                    `/portfolio-strategie/${strategy.id}-portfolio`
                  }
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  Zobrazit detail
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default PortfolioStrategiesTeaser;