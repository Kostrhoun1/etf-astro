import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from '../ui/badge';
import { ExternalLinkIcon, ShieldIcon, TrendingUpIcon } from '../ui/icons';
import { supabase } from '../../lib/supabase';

interface ETFComparison {
  unhedged: {
    isin: string;
    name: string;
    ter_numeric: number;
    return_1y: number;
    return_3y: number;
    return_5y: number;
    return_ytd: number;
    fund_size_numeric: number;
  };
  hedged: {
    isin: string;
    name: string;
    ter_numeric: number;
    return_1y: number;
    return_3y: number;
    return_5y: number;
    return_ytd: number;
    fund_size_numeric: number;
  };
}

const HedgedVsUnhedgedComparison: React.FC = () => {
  const [comparisons, setComparisons] = useState<ETFComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchETFComparisons = async () => {
      try {
        // Srovnání S&P 500 ETF (zajištěné vs nezajištěné)
        const pairs = [
          { 
            unhedged: 'IE00B5BMR087', // iShares Core S&P 500 UCITS ETF (CSP1) - nezajištěné
            hedged: 'IE00B3ZW0K18'   // iShares Core S&P 500 UCITS ETF EUR Hedged (CSPX) - zajištěné
          }
        ];

        const comparisonsData: ETFComparison[] = [];

        for (const pair of pairs) {
          const { data: unhedgedData } = await supabase
            .from('etf_funds')
            .select('isin, name, ter_numeric, return_1y, return_3y, return_5y, return_ytd, fund_size_numeric')
            .eq('isin', pair.unhedged)
            .single();

          const { data: hedgedData } = await supabase
            .from('etf_funds')
            .select('isin, name, ter_numeric, return_1y, return_3y, return_5y, return_ytd, fund_size_numeric')
            .eq('isin', pair.hedged)
            .single();

          if (unhedgedData && hedgedData) {
            comparisonsData.push({
              unhedged: unhedgedData,
              hedged: hedgedData
            });
          }
        }

        setComparisons(comparisonsData);
      } catch (error) {
        console.error('Error fetching ETF comparisons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchETFComparisons();
  }, []);

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getReturnColor = (value: number | null) => {
    if (value === null || value === undefined) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatSize = (value: number | null) => {
    if (!value) return '-';
    if (value >= 1000) return `${(value / 1000).toFixed(1)}B`;
    return `${value.toFixed(0)}M`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-8 mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 rounded"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShieldIcon className="h-6 w-6 text-blue-600" />
        Srovnání: CSP1 vs IBCF (zajištěné S&P 500 ETF)
      </h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-3">
          Konkrétní srovnání stejného indexu (S&P 500) v nezajištěné a EUR-zajištěné variantě.
        </p>
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>⚠️ Důležité:</strong> Hedged ETF zajišťují pouze EUR vůči USD. 
            <strong>ETF fondy zajištěné proti CZK neexistují!</strong> Pro české investory zůstává EUR/CZK riziko.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {comparisons.map((comparison, index) => {
          const indexName = comparison.unhedged.name.includes('S&P 500') ? 'S&P 500' : 
                           comparison.unhedged.name.includes('MSCI World') ? 'MSCI World' : 
                           'Index';
          
          return (
            <Card key={index} className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-800">
                      {indexName} - Srovnání variant
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Stejný index, různé měnové zajištění
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Live data
                  </Badge>
                </div>
              </CardHeader>
            <CardContent>
              {/* Kompaktní srovnávací tabulka */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-700">Metrika</th>
                      <th className="text-center py-2">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUpIcon className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-800 font-medium">CSP1</span>
                          <a 
                            href={`/etf/${comparison.unhedged.isin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="text-xs text-blue-600 font-normal">Nezajištěný</div>
                      </th>
                      <th className="text-center py-2">
                        <div className="flex items-center justify-center gap-1">
                          <ShieldIcon className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-800 font-medium">IBCF</span>
                          <a 
                            href={`/etf/${comparison.hedged.isin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="text-xs text-orange-600 font-normal">EUR zajištěný</div>
                      </th>
                      <th className="text-center py-2 font-medium text-gray-700">Rozdíl</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">TER</td>
                      <td className="text-center py-2">
                        <span className="font-bold text-blue-900">
                          {comparison.unhedged.ter_numeric?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-center py-2">
                        <span className="font-bold text-orange-900">
                          {comparison.hedged.ter_numeric?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-center py-2 text-red-600 font-semibold">
                        +{((comparison.hedged.ter_numeric || 0) - (comparison.unhedged.ter_numeric || 0)).toFixed(2)}%
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Velikost</td>
                      <td className="text-center py-2 font-bold text-blue-900">
                        €{formatSize(comparison.unhedged.fund_size_numeric)}
                      </td>
                      <td className="text-center py-2 font-bold text-orange-900">
                        €{formatSize(comparison.hedged.fund_size_numeric)}
                      </td>
                      <td className="text-center py-2 text-gray-500">-</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">YTD</td>
                      <td className={`text-center py-2 font-bold ${getReturnColor(comparison.unhedged.return_ytd)}`}>
                        {formatPercentage(comparison.unhedged.return_ytd)}
                      </td>
                      <td className={`text-center py-2 font-bold ${getReturnColor(comparison.hedged.return_ytd)}`}>
                        {formatPercentage(comparison.hedged.return_ytd)}
                      </td>
                      <td className={`text-center py-2 font-semibold ${getReturnColor((comparison.hedged.return_ytd || 0) - (comparison.unhedged.return_ytd || 0))}`}>
                        {formatPercentage((comparison.hedged.return_ytd || 0) - (comparison.unhedged.return_ytd || 0))}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">1 rok</td>
                      <td className={`text-center py-2 font-bold ${getReturnColor(comparison.unhedged.return_1y)}`}>
                        {formatPercentage(comparison.unhedged.return_1y)}
                      </td>
                      <td className={`text-center py-2 font-bold ${getReturnColor(comparison.hedged.return_1y)}`}>
                        {formatPercentage(comparison.hedged.return_1y)}
                      </td>
                      <td className={`text-center py-2 font-semibold ${getReturnColor((comparison.hedged.return_1y || 0) - (comparison.unhedged.return_1y || 0))}`}>
                        {formatPercentage((comparison.hedged.return_1y || 0) - (comparison.unhedged.return_1y || 0))}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">3 roky</td>
                      <td className={`text-center py-2 font-bold ${getReturnColor(comparison.unhedged.return_3y)}`}>
                        {formatPercentage(comparison.unhedged.return_3y)}
                      </td>
                      <td className={`text-center py-2 font-bold ${getReturnColor(comparison.hedged.return_3y)}`}>
                        {formatPercentage(comparison.hedged.return_3y)}
                      </td>
                      <td className={`text-center py-2 font-semibold ${getReturnColor((comparison.hedged.return_3y || 0) - (comparison.unhedged.return_3y || 0))}`}>
                        {formatPercentage((comparison.hedged.return_3y || 0) - (comparison.unhedged.return_3y || 0))}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">5 let</td>
                      <td className={`text-center py-2 font-bold ${getReturnColor(comparison.unhedged.return_5y)}`}>
                        {formatPercentage(comparison.unhedged.return_5y)}
                      </td>
                      <td className={`text-center py-2 font-bold ${getReturnColor(comparison.hedged.return_5y)}`}>
                        {formatPercentage(comparison.hedged.return_5y)}
                      </td>
                      <td className={`text-center py-2 font-semibold ${getReturnColor((comparison.hedged.return_5y || 0) - (comparison.unhedged.return_5y || 0))}`}>
                        {formatPercentage((comparison.hedged.return_5y || 0) - (comparison.unhedged.return_5y || 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
        })}

        {comparisons.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Načítání srovnání hedged/unhedged ETF...
            </p>
            <p className="text-sm text-gray-500">
              Pokud se data nenačítají, zkontrolujte připojení k databázi.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Interpretace rozdílů:</strong> IBCF (hedged) eliminuje EUR/USD volatilitu, ale má vyšší náklady. 
            Výkonnostní rozdíly ukazují dopad měnových pohybů na CSP1 (unhedged).
          </p>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Limitace hedgingu:</strong> IBCF zajišťuje pouze EUR/USD, pro Čechy zůstává EUR/CZK riziko. 
            Rozdíly ve výkonnosti ukazují, zda se hedging vyplatil v daném období.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HedgedVsUnhedgedComparison;