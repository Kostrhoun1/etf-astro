'use client';

import React, { useState } from 'react';

import { ArrowRight, TrendingUp, Search, Filter, DollarSign, Building2, Landmark, Bitcoin } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ETFItem {
  isin: string;
  name: string;
  fund_provider: string;
  primary_ticker?: string;
  ter_numeric: number;
  fund_size_numeric: number;
  rating?: number;
  return_1y_czk?: number;
  return_1y_usd?: number;
  return_1y?: number;
  return_ytd_czk?: number;
  return_ytd_usd?: number;
  return_ytd?: number;
  return_3y_czk?: number;
  return_3y_usd?: number;
  return_3y?: number;
  return_5y_czk?: number;
  return_5y_usd?: number;
  return_5y?: number;
  category: string;
}

interface CategoryData {
  id: string;
  name: string;
  iconName: string;
  description: string;
  etfs: ETFItem[];
}

interface TopETFTabsProps {
  categories: CategoryData[];
  totalETFCount?: number;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  TrendingUp: TrendingUp,
  DollarSign: DollarSign,
  Building: Building2,
  Landmark: Landmark,
  Bitcoin: Bitcoin,
};

const TopETFTabs: React.FC<TopETFTabsProps> = ({ categories, totalETFCount = 0 }) => {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || '');
  const { selectedCurrency: currency, setCurrency } = useCurrency();

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  const formatPercentage = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    return (num > 0 ? '+' : '') + num.toFixed(1) + '%';
  };

  const getReturnValue = (etf: ETFItem, period: 'ytd' | '1y' | '3y' | '5y'): number | null => {
    const key = `return_${period}${currency === 'EUR' ? '' : `_${currency.toLowerCase()}`}` as keyof ETFItem;
    const value = etf[key];
    return typeof value === 'number' ? value : null;
  };

  const activeCategory = categories.find(cat => cat.id === activeTab);

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Nejlepší ETF podle kategorií
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-4">
            Top hodnocené ETF fondy z databáze {formatNumber(totalETFCount)} fondů
          </p>

          {/* Currency Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <span className="text-xs md:text-sm text-gray-600 px-2 md:px-3 py-1">Výkonnost:</span>
              {(['EUR', 'CZK', 'USD'] as const).map((currencyOption) => (
                <button
                  key={currencyOption}
                  onClick={() => setCurrency(currencyOption)}
                  className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-md transition-colors ${
                    currency === currencyOption
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {currencyOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className="md:hidden mb-6">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:grid w-full grid-cols-3 lg:grid-cols-5 mb-8 gap-1 bg-gray-100 p-1 rounded-lg">
          {categories.map((category) => {
            const IconComponent = iconMap[category.iconName] || TrendingUpIcon;
            const isActive = activeTab === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeCategory && (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="hidden md:table w-full border-collapse bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">ETF fond</th>
                  <th className="text-center p-4 font-semibold text-gray-900">TER</th>
                  <th className="text-center p-4 font-semibold text-gray-900">YTD</th>
                  <th className="text-center p-4 font-semibold text-gray-900">1Y</th>
                  <th className="text-center p-4 font-semibold text-gray-900">3Y</th>
                  <th className="text-center p-4 font-semibold text-gray-900">5Y</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Velikost</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Detail</th>
                </tr>
              </thead>
              <tbody>
                {activeCategory.etfs.slice(0, 10).map((etf) => (
                  <tr key={etf.isin} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <a href={`/etf/${etf.isin}`} className="font-medium text-gray-900 hover:text-violet-600 transition-colors">
                          {etf.name}
                        </a>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <span className="font-mono">{etf.isin}</span>
                          {etf.primary_ticker && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                              {etf.primary_ticker}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm font-medium">
                      {etf.ter_numeric?.toFixed(2)}%
                    </td>
                    <td className="p-4 text-center text-sm">
                      <span className={`font-medium ${
                        (getReturnValue(etf, 'ytd') ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(getReturnValue(etf, 'ytd'))}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm">
                      <span className={`font-medium ${
                        (getReturnValue(etf, '1y') ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(getReturnValue(etf, '1y'))}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm">
                      <span className={`font-medium ${
                        (getReturnValue(etf, '3y') ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(getReturnValue(etf, '3y'))}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm">
                      <span className={`font-medium ${
                        (getReturnValue(etf, '5y') ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(getReturnValue(etf, '5y'))}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm font-medium">
                      {formatNumber(etf.fund_size_numeric)} mil. EUR
                    </td>
                    <td className="p-4 text-center">
                      <a
                        href={`/etf/${etf.isin}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Detail
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {activeCategory.etfs.slice(0, 5).map((etf) => (
                <div key={etf.isin} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <a href={`/etf/${etf.isin}`} className="font-medium text-gray-900 hover:text-violet-600 transition-colors block">
                        {etf.name}
                      </a>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className="font-mono text-xs">{etf.isin}</span>
                        {etf.primary_ticker && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {etf.primary_ticker}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={`/etf/${etf.isin}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shrink-0"
                    >
                      Detail
                    </a>
                  </div>

                  {/* Mobile metrics grid */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1">TER</div>
                      <div className="font-medium">{etf.ter_numeric?.toFixed(2)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1">1Y</div>
                      <div className={`font-medium ${
                        (getReturnValue(etf, '1y') ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(getReturnValue(etf, '1y'))}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1">Velikost</div>
                      <div className="font-medium text-xs">{formatNumber(etf.fund_size_numeric)} mil.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Potřebujete detailnější srovnání?
            </h3>
          </div>

          <p className="text-gray-600 text-sm mb-4 max-w-2xl mx-auto">
            Prozkoumejte všech {formatNumber(totalETFCount)} ETF fondů s pokročilými filtry a detailními analýzami.
          </p>

          <a
            href="/srovnani-etf"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            Srovnat všechny ETF fondy
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default TopETFTabs;
