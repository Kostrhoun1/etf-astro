/**
 * Server-side ETF Table Component
 * Renders ETF data statically for SEO - no client-side fetching
 */

import type { ETFBasicInfo } from '@/lib/etf-data';

interface ETFTableServerProps {
  etfs: ETFBasicInfo[];
  showRank?: boolean;
  currency?: 'EUR' | 'CZK' | 'USD';
  maxRows?: number;
}

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('cs-CZ').format(num);
}

function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return (num > 0 ? '+' : '') + num.toFixed(1) + '%';
}

function getReturnValue(etf: ETFBasicInfo, period: 'ytd' | '1y' | '3y' | '5y', currency: 'EUR' | 'CZK' | 'USD'): number | null {
  switch (currency) {
    case 'CZK':
      switch (period) {
        case 'ytd': return etf.return_ytd_czk;
        case '1y': return etf.return_1y_czk;
        case '3y': return etf.return_3y_czk;
        case '5y': return etf.return_5y_czk;
      }
      break;
    case 'USD':
      switch (period) {
        case 'ytd': return etf.return_ytd_usd;
        case '1y': return etf.return_1y_usd;
        case '3y': return etf.return_3y_usd;
        case '5y': return etf.return_5y_usd;
      }
      break;
    default:
      switch (period) {
        case 'ytd': return etf.return_ytd;
        case '1y': return etf.return_1y;
        case '3y': return etf.return_3y;
        case '5y': return etf.return_5y;
      }
  }
  return null;
}

export default function ETFTableServer({
  etfs,
  showRank = true,
  currency = 'EUR',
  maxRows = 50
}: ETFTableServerProps) {
  const displayEtfs = etfs.slice(0, maxRows);

  if (displayEtfs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nebyly nalezeny žádné ETF fondy odpovídající kritériím.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <table className="hidden md:table w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {showRank && <th className="text-center p-3 font-semibold text-gray-900 w-12">#</th>}
            <th className="text-left p-3 font-semibold text-gray-900">ETF fond</th>
            <th className="text-center p-3 font-semibold text-gray-900 w-20">TER</th>
            <th className="text-center p-3 font-semibold text-gray-900 w-20">YTD</th>
            <th className="text-center p-3 font-semibold text-gray-900 w-20">1R</th>
            <th className="text-center p-3 font-semibold text-gray-900 w-20">3R</th>
            <th className="text-center p-3 font-semibold text-gray-900 w-20">5R</th>
            <th className="text-center p-3 font-semibold text-gray-900 w-28">Velikost</th>
          </tr>
        </thead>
        <tbody>
          {displayEtfs.map((etf, index) => {
            const return1y = getReturnValue(etf, '1y', currency);
            const returnYtd = getReturnValue(etf, 'ytd', currency);
            const return3y = getReturnValue(etf, '3y', currency);
            const return5y = getReturnValue(etf, '5y', currency);

            return (
              <tr key={etf.isin} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {showRank && (
                  <td className="p-3 text-center text-sm font-medium text-gray-500">
                    {index + 1}
                  </td>
                )}
                <td className="p-3">
                  <div className="flex flex-col">
                    <a
                      href={`/etf/${etf.isin}`}
                      className="font-medium text-gray-900 hover:text-violet-600 transition-colors"
                    >
                      {etf.name}
                    </a>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span className="font-mono text-xs">{etf.isin}</span>
                      {etf.primary_ticker && (
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                          {etf.primary_ticker}
                        </span>
                      )}
                      {etf.rating && etf.rating >= 4 && (
                        <span className="text-yellow-500 text-xs">
                          {'★'.repeat(Math.round(etf.rating))}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center text-sm font-medium">
                  {etf.ter_numeric !== null ? `${etf.ter_numeric.toFixed(2)}%` : 'N/A'}
                </td>
                <td className="p-3 text-center text-sm">
                  <span className={`font-medium ${
                    returnYtd !== null && returnYtd > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(returnYtd)}
                  </span>
                </td>
                <td className="p-3 text-center text-sm">
                  <span className={`font-medium ${
                    return1y !== null && return1y > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(return1y)}
                  </span>
                </td>
                <td className="p-3 text-center text-sm">
                  <span className={`font-medium ${
                    return3y !== null && return3y > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(return3y)}
                  </span>
                </td>
                <td className="p-3 text-center text-sm">
                  <span className={`font-medium ${
                    return5y !== null && return5y > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(return5y)}
                  </span>
                </td>
                <td className="p-3 text-center text-sm font-medium whitespace-nowrap">
                  {formatNumber(etf.fund_size_numeric)} mil. EUR
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {displayEtfs.slice(0, 10).map((etf, index) => {
          const return1y = getReturnValue(etf, '1y', currency);

          return (
            <div key={etf.isin} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {showRank && (
                  <div className="flex-shrink-0 w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <a
                    href={`/etf/${etf.isin}`}
                    className="font-medium text-gray-900 hover:text-violet-600 transition-colors block truncate"
                  >
                    {etf.name}
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="font-mono text-xs">{etf.isin}</span>
                    {etf.primary_ticker && (
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                        {etf.primary_ticker}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-500 text-xs mb-1">TER</div>
                  <div className="font-medium">
                    {etf.ter_numeric !== null ? `${etf.ter_numeric.toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs mb-1">1R výnos</div>
                  <div className={`font-medium ${
                    return1y !== null && return1y > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(return1y)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs mb-1">Velikost</div>
                  <div className="font-medium text-xs">
                    {formatNumber(etf.fund_size_numeric)} mil.
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more on mobile */}
      {displayEtfs.length > 10 && (
        <div className="md:hidden mt-4 text-center text-sm text-gray-500">
          + dalších {displayEtfs.length - 10} ETF fondů (zobrazit na desktopu)
        </div>
      )}
    </div>
  );
}
