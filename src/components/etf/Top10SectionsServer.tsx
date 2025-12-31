/**
 * Server-side Top 10 ETF Sections Component
 * Renders Top 10 by TER, AUM, and 1Y Performance
 */

import type { ETFBasicInfo } from '@/lib/etf-data';
import { DollarIcon, BarChart3Icon, TrendingUpIcon } from '@/components/ui/icons';

interface Top10SectionsServerProps {
  etfs: ETFBasicInfo[];
  currency?: 'EUR' | 'CZK' | 'USD';
  categoryName?: string;
}

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('cs-CZ').format(num);
}

function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return (num > 0 ? '+' : '') + num.toFixed(2) + '%';
}

function getReturnValue(etf: ETFBasicInfo, currency: 'EUR' | 'CZK' | 'USD'): number | null {
  switch (currency) {
    case 'CZK':
      return etf.return_1y_czk;
    case 'USD':
      return etf.return_1y_usd;
    default:
      return etf.return_1y;
  }
}

interface Top10TableProps {
  etfs: ETFBasicInfo[];
  currency: 'EUR' | 'CZK' | 'USD';
  highlightColumn: 'ter' | 'aum' | 'performance';
}

function Top10Table({ etfs, currency, highlightColumn }: Top10TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-semibold text-gray-600">#</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-600">Název ETF</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-600">Poskytovatel</th>
            <th className={`text-right py-3 px-2 font-semibold ${highlightColumn === 'ter' ? 'text-emerald-600' : 'text-gray-600'}`}>TER</th>
            <th className={`text-right py-3 px-2 font-semibold ${highlightColumn === 'aum' ? 'text-blue-600' : 'text-gray-600'}`}>AUM (mil. €)</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-600">YTD</th>
            <th className={`text-right py-3 px-2 font-semibold ${highlightColumn === 'performance' ? 'text-purple-600' : 'text-gray-600'}`}>1R výnos</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-600">3R výnos</th>
            <th className="text-center py-3 px-2 font-semibold text-gray-600">Typ</th>
          </tr>
        </thead>
        <tbody>
          {etfs.map((etf, index) => {
            const return1y = getReturnValue(etf, currency);
            const returnYtd = currency === 'CZK' ? etf.return_ytd_czk : currency === 'USD' ? etf.return_ytd_usd : etf.return_ytd;
            const return3y = currency === 'CZK' ? etf.return_3y_czk : currency === 'USD' ? etf.return_3y_usd : etf.return_3y;
            return (
              <tr key={etf.isin} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-2 text-gray-500 font-medium">{index + 1}</td>
                <td className="py-3 px-2">
                  <a href={`/etf/${etf.isin}`} className="text-gray-900 hover:text-violet-600 font-medium transition-colors">
                    {etf.name.length > 40 ? etf.name.substring(0, 40) + '...' : etf.name}
                  </a>
                  {etf.primary_ticker && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {etf.primary_ticker}
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-gray-600 text-xs">
                  {etf.fund_provider ? (etf.fund_provider.length > 12 ? etf.fund_provider.substring(0, 12) + '...' : etf.fund_provider) : '-'}
                </td>
                <td className={`py-3 px-2 text-right font-medium ${highlightColumn === 'ter' ? 'text-emerald-600 font-bold' : 'text-gray-700'}`}>
                  {etf.ter_numeric !== null ? `${etf.ter_numeric.toFixed(2)}%` : 'N/A'}
                </td>
                <td className={`py-3 px-2 text-right font-medium ${highlightColumn === 'aum' ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                  {formatNumber(etf.fund_size_numeric)}
                </td>
                <td className={`py-3 px-2 text-right font-medium ${returnYtd !== null && returnYtd > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(returnYtd)}
                </td>
                <td className={`py-3 px-2 text-right font-medium ${
                  highlightColumn === 'performance' ? 'font-bold' : ''
                } ${return1y !== null && return1y > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(return1y)}
                </td>
                <td className={`py-3 px-2 text-right font-medium ${return3y !== null && return3y > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(return3y)}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    etf.distribution_policy === 'Accumulating'
                      ? 'bg-blue-100 text-blue-700'
                      : etf.distribution_policy === 'Distributing'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {etf.distribution_policy === 'Accumulating' ? 'ACC' : etf.distribution_policy === 'Distributing' ? 'DIST' : '-'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Top10SectionsServer({ etfs, currency = 'EUR', categoryName = 'ETF' }: Top10SectionsServerProps) {
  if (etfs.length < 5) {
    return null;
  }

  // Top 10 by lowest TER (exclude 0% TER as these are data errors)
  const top10ByTER = [...etfs]
    .filter(etf => etf.ter_numeric !== null && etf.ter_numeric > 0)
    .sort((a, b) => (a.ter_numeric ?? 999) - (b.ter_numeric ?? 999))
    .slice(0, 10);

  // Top 10 by largest AUM
  const top10ByAUM = [...etfs]
    .filter(etf => etf.fund_size_numeric !== null)
    .sort((a, b) => (b.fund_size_numeric ?? 0) - (a.fund_size_numeric ?? 0))
    .slice(0, 10);

  // Top 10 by 1Y performance
  const top10ByPerformance = [...etfs]
    .filter(etf => getReturnValue(etf, currency) !== null)
    .sort((a, b) => (getReturnValue(b, currency) ?? -999) - (getReturnValue(a, currency) ?? -999))
    .slice(0, 10);

  return (
    <section id="top10" className="py-12 bg-white content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">

          {/* Top 10 by TER */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top 10 nejlevnějších</h3>
                <p className="text-sm text-gray-600">Nejnižší TER poplatky</p>
              </div>
            </div>
            <Top10Table etfs={top10ByTER} currency={currency} highlightColumn="ter" />
          </div>

          {/* Top 10 by AUM */}
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top 10 největších</h3>
                <p className="text-sm text-gray-600">Největší objem AUM</p>
              </div>
            </div>
            <Top10Table etfs={top10ByAUM} currency={currency} highlightColumn="aum" />
          </div>

          {/* Top 10 by Performance */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUpIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top 10 podle výkonnosti</h3>
                <p className="text-sm text-gray-600">Nejlepší 1R výnos ({currency})</p>
              </div>
            </div>
            <Top10Table etfs={top10ByPerformance} currency={currency} highlightColumn="performance" />
          </div>

        </div>
      </div>
    </section>
  );
}
