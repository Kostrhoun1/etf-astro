import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TrendingDownIcon, BarChart3Icon, InfoIcon, ExternalLinkIcon } from '../ui/icons';
import { supabase } from '../../lib/supabase';


interface ETFData {
  isin: string;
  name: string;
  return_ytd: number | null;
  return_1y: number | null;
  return_3y: number | null;
  return_5y: number | null;
  ter_numeric: number | null;
}

interface PortfolioStrategy {
  id: string;
  name: string;
  description: string;
  philosophy: string;
  riskLevel: 'Konzervativní' | 'Umírněné' | 'Agresivní';
  expectedReturn: string;
  maxDrawdown: string;
  allocations: Array<{
    asset: string;
    percentage: number;
    isin: string;
    etfName: string;
  }>;
}

// URL mapping pro jednotlivé strategie
const getStrategyUrl = (strategyId: string): string => {
  const urlMap: Record<string, string> = {
    'permanent': '/portfolio-strategie/permanentni-portfolio',
    'nobel': '/portfolio-strategie/nobel-portfolio', 
    'dividend': '/portfolio-strategie/dividendove-portfolio',
    'stock': '/portfolio-strategie/akciove-portfolio',
    'allweather': '/portfolio-strategie/ray-dalio-all-weather'
  };
  return urlMap[strategyId] || '/portfolio-strategie';
};

const portfolioStrategies: PortfolioStrategy[] = [
  {
    id: 'permanent',
    name: 'Permanentní Portfolio',
    description: 'Stabilita ve všech ekonomických podmínkách',
    philosophy: 'Klasické portfolio založené na teorii, že čtyři základní aktivní třídy reagují odlišně na ekonomické cykly.',
    riskLevel: 'Konzervativní',
    expectedReturn: '4% ročně',
    maxDrawdown: 'Do -15%',
    allocations: [
      { asset: 'Akcie', percentage: 25, isin: 'IE00BK5BQT80', etfName: 'Vanguard FTSE All-World' },
      { asset: 'Dluhopisy', percentage: 25, isin: 'IE00BDBRDM35', etfName: 'iShares Core Global Aggregate Bond UCITS ETF EUR Hedged (Acc)' },
      { asset: 'Nemovitosti', percentage: 25, isin: 'IE00B0M63284', etfName: 'iShares European Property Yield UCITS ETF' },
      { asset: 'Komodity', percentage: 25, isin: 'IE00BD6FTQ80', etfName: 'Invesco Bloomberg Commodity UCITS ETF Acc' },
    ],
  },
  {
    id: 'nobel',
    name: 'Nobelovo Portfolio',
    description: 'Vyváženost mezi rizikem a výnosem',
    philosophy: 'Investiční strategie používaná Nobelovou nadací pro správu svého kapitálu. Kombinuje růstový potenciál akcií s konzervativními aktivy.',
    riskLevel: 'Umírněné',
    expectedReturn: '6% ročně',
    maxDrawdown: 'Do -25%',
    allocations: [
      { asset: 'Akcie', percentage: 55, isin: 'IE00BK5BQT80', etfName: 'Vanguard FTSE All-World' },
      { asset: 'Dluhopisy', percentage: 25, isin: 'IE00BDBRDM35', etfName: 'iShares Core Global Aggregate Bond UCITS ETF EUR Hedged (Acc)' },
      { asset: 'Nemovitosti', percentage: 20, isin: 'IE00B0M63284', etfName: 'iShares European Property Yield UCITS ETF' },
    ],
  },
  {
    id: 'stock',
    name: 'Akciové Portfolio',
    description: 'Maximální růstový potenciál',
    philosophy: '80% akcie + 20% nemovitosti pro zkušené investory s dlouhodobým horizontem.',
    riskLevel: 'Agresivní',
    expectedReturn: '7-8% ročně',
    maxDrawdown: 'Do -40%',
    allocations: [
      { asset: 'Světové akcie', percentage: 80, isin: 'IE00BK5BQT80', etfName: 'Vanguard FTSE All-World UCITS ETF' },
      { asset: 'Nemovitosti (REITs)', percentage: 20, isin: 'IE00B0M63284', etfName: 'iShares European Property Yield UCITS ETF' },
    ],
  },
  {
    id: 'allweather',
    name: 'Ray Dalio All-Weather',
    description: 'Funguje ve všech ekonomických prostředích',
    philosophy: 'Portfolio navržené legendárním Ray Daliem, které má fungovat ve všech ekonomických podmínkách.',
    riskLevel: 'Konzervativní',
    expectedReturn: '5-8% ročně',
    maxDrawdown: 'Do -20%',
    allocations: [
      { asset: 'Dlouhodobé dluhopisy', percentage: 40, isin: 'IE00BFM6TC58', etfName: 'iShares USD Treasury Bond 20+yr UCITS ETF USD (Acc)' },
      { asset: 'Akcie', percentage: 30, isin: 'IE00BK5BQT80', etfName: 'Vanguard FTSE All-World' },
      { asset: 'Střednědobé dluhopisy', percentage: 15, isin: 'IE00B3VWN518', etfName: 'iShares USD Treasury Bond 7-10yr UCITS ETF (Acc)' },
      { asset: 'Komodity', percentage: 7.5, isin: 'IE00BD6FTQ80', etfName: 'Invesco Bloomberg Commodity UCITS ETF Acc' },
      { asset: 'Zlato', percentage: 7.5, isin: 'IE00B4ND3602', etfName: 'iShares Physical Gold ETC' },
    ],
  },
  {
    id: 'dividend',
    name: 'Dividendové Portfolio',
    description: 'Kvalitní dividendové akcie s růstem výplat',
    philosophy: 'Zaměření na společnosti s dlouholetou tradicí růstu dividend - dividend aristocrats a kvalitní nemovitostní investice.',
    riskLevel: 'Umírněné',
    expectedReturn: '4% dividendy + růst',
    maxDrawdown: 'Do -25%',
    allocations: [
      { asset: 'Dividendové akcie', percentage: 95, isin: 'IE00B9CQXS71', etfName: 'SPDR S&P Global Dividend Aristocrats UCITS ETF' },
      { asset: 'Nemovitosti (REITs)', percentage: 5, isin: 'IE00B1FZS350', etfName: 'iShares Developed Markets Property Yield UCITS ETF' },
    ],
  },
];

const PortfolioStrategies: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('permanent');
  const [etfData, setEtfData] = useState<Record<string, ETFData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchETFData();
  }, []);


  const fetchETFData = async () => {
    try {
      // Získáme všechny ISINy ze strategií
      const allISINs = portfolioStrategies.flatMap(strategy => 
        strategy.allocations.map(allocation => allocation.isin)
      );
      const uniqueISINs = [...new Set(allISINs)];

      const { data, error } = await supabase
        .from('etf_funds')
        .select('isin, name, return_ytd, return_1y, return_3y, return_5y, ter_numeric')
        .in('isin', uniqueISINs);

      if (error) {
        console.error('Error fetching ETF data:', error);
        return;
      }

      // Převedeme na mapu pro rychlý přístup
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

  const calculatePortfolioPerformance = (strategy: PortfolioStrategy) => {
    // Pokud ještě nemáme načtená data, vracíme null
    if (Object.keys(etfData).length === 0) {
      return {
        return_ytd: null,
        return_1y: null,
        return_3y: null,
        return_5y: null
      };
    }

    const periods = ['return_ytd', 'return_1y', 'return_3y', 'return_5y'] as const;
    const results: Record<string, number | null> = {};

    for (const period of periods) {
      let weightedReturn = 0;
      let totalAvailableWeight = 0;
      let missingETFs: string[] = [];

      // Nejprve zkontrolujeme, která ETF mají dostupná data pro dané období
      for (const allocation of strategy.allocations) {
        const etf = etfData[allocation.isin];
        if (etf && etf[period] !== null && etf[period] !== undefined) {
          weightedReturn += (allocation.percentage / 100) * etf[period]!;
          totalAvailableWeight += allocation.percentage / 100;
        } else {
          missingETFs.push(`${allocation.etfName} (${allocation.isin})`);
        }
      }

      // Pouze pokud máme data pro alespoň 80% portfolia, vypočítáme performance
      if (totalAvailableWeight >= 0.8) {
        // Renormalizujeme váhy na 100% pro dostupná ETF
        results[period] = weightedReturn / totalAvailableWeight;
      } else {
        console.warn(`${strategy.name}: Insufficient data for ${period} (${(totalAvailableWeight * 100).toFixed(0)}% coverage, need 80%)`);
        results[period] = null;
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

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Konzervativní': return 'bg-blue-100 text-blue-800';
      case 'Umírněné': return 'bg-yellow-100 text-yellow-800';
      case 'Agresivní': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedStrategyData = portfolioStrategies.find(s => s.id === selectedStrategy);
  const performance = selectedStrategyData ? calculatePortfolioPerformance(selectedStrategyData) : {};

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám data portfolií...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          5 Osvědčených Portfolio Strategií
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Porovnejte reálnou performance různých investičních přístupů na základě aktuálních dat z naší databáze ETF fondů.
        </p>
      </div>

      {/* Strategy Selector */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {portfolioStrategies.map((strategy) => (
          <Button
            key={strategy.id}
            variant={selectedStrategy === strategy.id ? "default" : "outline"}
            onClick={() => setSelectedStrategy(strategy.id)}
            className={`px-6 py-3 ${
              selectedStrategy === strategy.id
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'hover:bg-violet-50 hover:border-violet-300'
            }`}
          >
            {strategy.name}
          </Button>
        ))}
      </div>

      {/* Selected Strategy Details */}
      {selectedStrategyData && (
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Strategy Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedStrategyData.name}</h3>
              <div className="flex items-center gap-2">
                <Badge className={getRiskBadgeColor(selectedStrategyData.riskLevel)}>
                  {selectedStrategyData.riskLevel}
                </Badge>
                <Button asChild size="sm" variant="outline" className="border-violet-300 text-violet-600 hover:bg-violet-50">
                  <a href={getStrategyUrl(selectedStrategyData.id)}>
                    <ExternalLinkIcon className="w-4 h-4 mr-1" />
                    Detail
                  </a>
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{selectedStrategyData.description}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <InfoIcon className="w-4 h-4" />
                Filosofie
              </h4>
              <p className="text-sm text-gray-600">{selectedStrategyData.philosophy}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Očekávaný výnos:</span>
                <p className="font-semibold">{selectedStrategyData.expectedReturn}</p>
              </div>
              <div>
                <span className="text-gray-500">Maximální pokles:</span>
                <p className="font-semibold">{selectedStrategyData.maxDrawdown}</p>
              </div>
            </div>
          </Card>

          {/* Performance */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3Icon className="w-5 h-5" />
              Reálná Performance
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">YTD</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(performance.return_ytd as number)}`}>
                  {formatPerformance(performance.return_ytd as number)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">1 rok</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(performance.return_1y as number)}`}>
                  {formatPerformance(performance.return_1y as number)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">3 roky</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(performance.return_3y as number)}`}>
                  {formatPerformance(performance.return_3y as number)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">5 let</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(performance.return_5y as number)}`}>
                  {formatPerformance(performance.return_5y as number)}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                * Performance je vypočítána na základě vážených průměrů skutečných výnosů ETF fondů v portfoliu
              </p>
              {Object.values(performance).some(value => value === null) && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Některá období nemají kompletní data pro všechna ETF v portfoliu
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Portfolio Allocation */}
      {selectedStrategyData && (
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Složení portfolia</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Aktivum</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Alokace</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ETF</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">ISIN</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">YTD</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">TER</th>
                </tr>
              </thead>
              <tbody>
                {selectedStrategyData.allocations.map((allocation, index) => {
                  const etf = etfData[allocation.isin];
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{allocation.asset}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {allocation.percentage}%
                      </td>
                      <td className="py-3 px-4">
                        <a 
                          href={`/etf/${allocation.isin}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {allocation.etfName}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm">
                        {allocation.isin}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        getPerformanceColor(etf?.return_ytd || null)
                      }`}>
                        {etf ? formatPerformance(etf.return_ytd) : (
                          <span className="text-amber-600 text-xs">
                            ⚠️ Chybí data
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {etf?.ter_numeric ? `${etf.ter_numeric.toFixed(2)}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
};

export default PortfolioStrategies;