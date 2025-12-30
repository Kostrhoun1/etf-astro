import React, { useState, useEffect } from 'react';

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BarChart3Icon, CheckCircleIcon, AlertTriangleIcon, ExternalLinkIcon, ArrowLeftIcon, HomeIcon, UsersIcon, TrendingUpIcon } from '../ui/icons';
import { supabase } from '../../lib/supabase';

interface ETFData {
  isin: string;
  return_ytd: number | null;
  return_1y: number | null;
  return_3y: number | null;
}

interface PortfolioStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  expectedReturn: string;
  allocations: Array<{
    asset: string;
    percentage: number;
    isin: string;
  }>;
  philosophy: string;
  advantages: string[];
  disadvantages: string[];
  suitableFor: string[];
  implementation: {
    rebalancing: string;
    monthlyInvesting: string;
    taxOptimization: string;
  };
}

interface PortfolioStrategyDetailProps {
  strategy: PortfolioStrategy;
}

const PortfolioStrategyDetail: React.FC<PortfolioStrategyDetailProps> = ({ strategy }) => {
  const [etfData, setEtfData] = useState<Record<string, ETFData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchETFData();
  }, []);

  const fetchETFData = async () => {
    try {
      const isins = strategy.allocations.map(allocation => allocation.isin);

      const { data, error } = await supabase
        .from('etf_funds')
        .select('isin, return_ytd, return_1y, return_3y')
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

  const calculatePortfolioPerformance = (period: 'return_ytd' | 'return_1y' | 'return_3y') => {
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

  const ytdPerformance = calculatePortfolioPerformance('return_ytd');
  const yearPerformance = calculatePortfolioPerformance('return_1y');
  const threeYearPerformance = calculatePortfolioPerformance('return_3y');

  return (
    <div className="bg-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-gray-500 hover:text-violet-600 flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />
              Domů
            </a>
            <span className="text-gray-400">/</span>
            <a href="/portfolio-strategie" className="text-gray-500 hover:text-violet-600">
              Portfolio Strategie
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{strategy.name}</span>
          </nav>
          
          {/* Back Button */}
          <div className="mt-3">
            <Button asChild variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-100">
              <a href="/portfolio-strategie">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Zpět na přehled strategií
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className={`mb-4 ${getRiskBadgeColor(strategy.riskLevel)}`}>
              {strategy.riskLevel} riziko
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {strategy.name}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {strategy.description}
            </p>
          </div>

          {/* Performance Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-sm text-gray-500 mb-2">YTD Performance</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(ytdPerformance)}`}>
                {formatPerformance(ytdPerformance)}
              </div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-sm text-gray-500 mb-2">1 rok</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(yearPerformance)}`}>
                {formatPerformance(yearPerformance)}
              </div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-sm text-gray-500 mb-2">3 roky (ročně)</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(threeYearPerformance)}`}>
                {formatPerformance(threeYearPerformance)}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Strategy Philosophy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Filosofie strategie</h2>
          <Card className="p-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              {strategy.philosophy}
            </p>
          </Card>
        </section>

        {/* Portfolio Allocation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Složení portfolia</h2>
          <div className="space-y-4">
            {strategy.allocations.map((allocation, index) => {
              const etf = etfData[allocation.isin];
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <a 
                          href={`/etf/${allocation.isin}?from=portfolio`}
                          className="font-medium text-gray-900 hover:text-violet-700 hover:underline transition-colors"
                        >
                          {allocation.asset}
                        </a>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-violet-600 hover:bg-violet-50"
                          onClick={() => window.open(`/etf/${allocation.isin}?from=portfolio`, '_blank')}
                        >
                          Detail
                          <ExternalLinkIcon className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ISIN: {allocation.isin}
                      </div>
                      {etf && (
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className={getPerformanceColor(etf.return_ytd)}>
                            YTD: {formatPerformance(etf.return_ytd)}
                          </span>
                          <span className={getPerformanceColor(etf.return_1y)}>
                            1Y: {formatPerformance(etf.return_1y)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-violet-600">
                        {allocation.percentage}%
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Pros and Cons */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Výhody a nevýhody</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                Výhody
              </h3>
              <ul className="space-y-2">
                {strategy.advantages.map((advantage, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {advantage}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-amber-700 mb-4 flex items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5" />
                Nevýhody
              </h3>
              <ul className="space-y-2">
                {strategy.disadvantages.map((disadvantage, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <AlertTriangleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {disadvantage}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Suitable For */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Pro koho je vhodné</h2>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold">Vhodné pro investory, kteří:</h3>
            </div>
            <ul className="grid md:grid-cols-2 gap-2">
              {strategy.suitableFor.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <CheckCircleIcon className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Implementation Guide */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Praktická implementace</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">🔄 Rebalancování</h3>
              <p className="text-gray-700">{strategy.implementation.rebalancing}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">💰 Pravidelné investování</h3>
              <p className="text-gray-700">{strategy.implementation.monthlyInvesting}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">📊 Daňová optimalizace</h3>
              <p className="text-gray-700">{strategy.implementation.taxOptimization}</p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200 p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Chcete implementovat tuto strategii?
            </h3>
            <p className="text-gray-600 mb-6">
              Porovnejte ETF fondy obsažené v této strategii a najděte nejlepší brokeře pro nákup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                <a href={`/srovnani-etf?compare=${strategy.allocations.map(a => a.isin).join(',')}&portfolio=${strategy.id}`}>
                  <BarChart3Icon className="w-4 h-4 mr-2" />
                  Porovnat ETF fondy
                </a>
              </Button>
              <Button asChild variant="outline" className="border-violet-300 text-violet-600 hover:bg-violet-50">
                <a href="/portfolio-strategie">
                  <TrendingUpIcon className="w-4 h-4 mr-2" />
                  Porovnat se strategiemi
                </a>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PortfolioStrategyDetail;