/**
 * Server-side Top 3 ETF Cards Component
 * Renders top 3 ETF data statically for SEO
 */

import type { ETFBasicInfo } from '@/lib/etf-data';
import { TrophyIcon, StarIcon, CheckCircleIcon } from '@/components/ui/icons';

interface Top3ETFServerProps {
  etfs: ETFBasicInfo[];
  currency?: 'EUR' | 'CZK' | 'USD';
}

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('cs-CZ').format(num);
}

function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return (num > 0 ? '+' : '') + num.toFixed(1) + '%';
}

function getReturnValue(etf: ETFBasicInfo, period: '1y', currency: 'EUR' | 'CZK' | 'USD'): number | null {
  switch (currency) {
    case 'CZK':
      return etf.return_1y_czk;
    case 'USD':
      return etf.return_1y_usd;
    default:
      return etf.return_1y;
  }
}

const rankColors = [
  { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-600', icon: 'text-yellow-500' },
  { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-600', icon: 'text-gray-400' },
  { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-600', icon: 'text-orange-400' },
];

export default function Top3ETFServer({ etfs, currency = 'EUR' }: Top3ETFServerProps) {
  const top3 = etfs.slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {top3.map((etf, index) => {
        const return1y = getReturnValue(etf, '1y', currency);
        const colors = rankColors[index] || rankColors[2];

        return (
          <div
            key={etf.isin}
            className={`relative ${colors.bg} border-2 ${colors.border} rounded-xl p-5 transition-shadow hover:shadow-lg`}
          >
            {/* Rank badge */}
            <div className={`absolute -top-3 -left-3 w-10 h-10 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-300'} rounded-full flex items-center justify-center shadow-md`}>
              <span className="text-white font-bold text-lg">#{index + 1}</span>
            </div>

            {/* Trophy for #1 */}
            {index === 0 && (
              <div className="absolute top-2 right-2">
                <TrophyIcon className="w-6 h-6 text-yellow-500" />
              </div>
            )}

            <div className="mt-4">
              <a
                href={`/etf/${etf.isin}`}
                className="font-semibold text-gray-900 hover:text-violet-600 transition-colors text-lg block"
              >
                {etf.name}
              </a>

              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span className="font-mono">{etf.isin}</span>
                {etf.primary_ticker && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                    {etf.primary_ticker}
                  </span>
                )}
              </div>

              {/* Rating stars */}
              {etf.rating && etf.rating >= 3 && (
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(etf.rating!) ? 'text-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">({etf.rating.toFixed(1)})</span>
                </div>
              )}

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">TER (poplatky)</div>
                  <div className="font-semibold text-gray-900">
                    {etf.ter_numeric !== null ? `${etf.ter_numeric.toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">1R výnos ({currency})</div>
                  <div className={`font-semibold ${return1y !== null && return1y > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(return1y)}
                  </div>
                </div>
              </div>

              {/* Additional info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Velikost: {formatNumber(etf.fund_size_numeric)} mil. EUR
                </div>
                {etf.fund_provider && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    Poskytovatel: {etf.fund_provider}
                  </div>
                )}
              </div>

              {/* CTA button */}
              <a
                href={`/etf/${etf.isin}`}
                className="mt-4 block w-full text-center bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Zobrazit detail
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
