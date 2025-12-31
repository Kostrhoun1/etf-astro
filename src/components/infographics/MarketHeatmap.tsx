import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from '../ui/badge';

interface MarketData {
  symbol: string;
  performance: number;
  current_price: number;
  currency: string;
  name: string;
  last_updated: string;
}

interface HeatmapData {
  metadata: {
    period: string;
    generated_at: string;
    data_source: string;
  };
  sectors: { [key: string]: MarketData };
  regions: { [key: string]: MarketData };
  asset_classes: { [key: string]: MarketData };
  summary_stats: {
    best_performers: { [key: string]: [string, number] };
    worst_performers: { [key: string]: [string, number] };
    category_averages: { [key: string]: number };
  };
}

interface MarketHeatmapProps {
  data: HeatmapData;
}

const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ data }) => {
  const getPerformanceColor = (performance: number): { bg: string; text: string; border: string; shadow: string } => {
    if (performance >= 15) return { 
      bg: 'bg-gradient-to-br from-emerald-500 to-violet-600', 
      text: 'text-white', 
      border: 'border-emerald-300',
      shadow: 'shadow-lg hover:shadow-emerald-300/30'
    };
    if (performance >= 10) return { 
      bg: 'bg-gradient-to-br from-emerald-400 to-violet-500', 
      text: 'text-white', 
      border: 'border-emerald-200',
      shadow: 'shadow-md hover:shadow-emerald-200/30'
    };
    if (performance >= 5) return { 
      bg: 'bg-gradient-to-br from-emerald-200 to-violet-300', 
      text: 'text-emerald-900', 
      border: 'border-emerald-200',
      shadow: 'shadow-sm hover:shadow-emerald-200/20'
    };
    if (performance >= 2) return { 
      bg: 'bg-gradient-to-br from-emerald-50 to-violet-100', 
      text: 'text-emerald-800', 
      border: 'border-emerald-200',
      shadow: 'shadow-sm hover:shadow-emerald-100/20'
    };
    if (performance >= 0) return { 
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100', 
      text: 'text-gray-700', 
      border: 'border-gray-200',
      shadow: 'shadow-sm hover:shadow-gray-200/20'
    };
    if (performance >= -2) return { 
      bg: 'bg-gradient-to-br from-orange-50 to-red-100', 
      text: 'text-orange-800', 
      border: 'border-orange-200',
      shadow: 'shadow-sm hover:shadow-orange-200/20'
    };
    if (performance >= -5) return { 
      bg: 'bg-gradient-to-br from-orange-200 to-red-300', 
      text: 'text-orange-900', 
      border: 'border-orange-200',
      shadow: 'shadow-sm hover:shadow-orange-200/20'
    };
    if (performance >= -10) return { 
      bg: 'bg-gradient-to-br from-orange-400 to-red-500', 
      text: 'text-white', 
      border: 'border-orange-300',
      shadow: 'shadow-md hover:shadow-orange-300/30'
    };
    return { 
      bg: 'bg-gradient-to-br from-orange-500 to-red-600', 
      text: 'text-white', 
      border: 'border-orange-400',
      shadow: 'shadow-lg hover:shadow-orange-400/30'
    };
  };

  const getSectorIcon = (sectorName: string): string => {
    switch (sectorName) {
      case 'Technology': return '💻';
      case 'Healthcare': return '🏥';
      case 'Financials': return '🏦';
      case 'Energy': return '⚡';
      case 'Utilities': return '🔌';
      case 'Consumer Staples': return '🛒';
      case 'Consumer Discretionary': return '🛍️';
      case 'Industrials': return '🏭';
      case 'Materials': return '🔨';
      case 'Real Estate': return '🏢';
      case 'Communication Services': return '📡';
      default: return '📊';
    }
  };

  const getRegionIcon = (regionName: string): string => {
    switch (regionName) {
      case 'USA': return '🇺🇸';
      case 'Europe': return '🇪🇺';
      case 'Japan': return '🇯🇵';
      case 'China': return '🇨🇳';
      case 'Emerging Markets': return '🌏';
      case 'Developed Markets': return '🌎';
      case 'Asia Pacific': return '🏝️';
      default: return '🌍';
    }
  };

  const getAssetIcon = (assetName: string): string => {
    switch (assetName) {
      case 'US Stocks': return '📈';
      case 'International Stocks': return '🌐';
      case 'Bonds': return '📜';
      case 'REITs': return '🏘️';
      case 'Commodities': return '🌾';
      case 'Gold': return '🥇';
      case 'Bitcoin': return '₿';
      case 'Oil': return '🛢️';
      default: return '💰';
    }
  };

  const renderHeatmapGrid = (categoryData: { [key: string]: MarketData }, title: string, categoryType: 'sectors' | 'regions' | 'assets') => {
    const items = Object.entries(categoryData);
    
    const getIcon = (name: string) => {
      switch (categoryType) {
        case 'sectors': return getSectorIcon(name);
        case 'regions': return getRegionIcon(name);
        case 'assets': return getAssetIcon(name);
        default: return '📊';
      }
    };
    
    return (
      <Card className="mb-8">
        <CardHeader className="text-center relative">
          <div className="absolute top-4 right-4 text-emerald-700 font-bold text-lg">
            📊 www.etfpruvodce.cz
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-black text-gray-900">
              {title} - {formatPeriod(data.metadata.period)}
            </div>
            <div className="text-lg text-gray-600">
              {new Date(data.metadata.generated_at).toLocaleDateString('cs-CZ')} | {data.metadata.data_source}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid layout */}
          <div className={`grid gap-6 ${
            categoryType === 'sectors' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : categoryType === 'regions'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}>
            {items.map(([name, itemData]) => {
              const colorConfig = getPerformanceColor(itemData.performance);
              return (
                <div
                  key={name}
                  className={`relative overflow-hidden rounded-xl border-2 ${colorConfig.border} ${colorConfig.bg} ${colorConfig.shadow} transition-all duration-300 hover:scale-105 group cursor-pointer`}
                >
                  {/* Content */}
                  <div className="relative text-center p-3">
                    {/* Icon */}
                    <div className="text-5xl mb-1 transform group-hover:scale-110 transition-transform duration-300">
                      {getIcon(name)}
                    </div>
                    
                    {/* Name */}
                    <div className={`font-bold mb-1 leading-tight ${colorConfig.text} text-lg`}>
                      {name}
                    </div>
                    
                    {/* Performance */}
                    <div className={`font-black mb-1 ${colorConfig.text} text-3xl`}>
                      {itemData.performance > 0 ? '+' : ''}{itemData.performance.toFixed(1)}%
                    </div>
                    
                    {/* Symbol */}
                    <div className={`opacity-80 font-medium ${colorConfig.text} text-base`}>
                      {itemData.symbol}
                    </div>
                    
                    {/* Trend Arrow */}
                    <div className="absolute top-3 right-3">
                      {itemData.performance > 0 ? (
                        <div className="text-xl">📈</div>
                      ) : itemData.performance < 0 ? (
                        <div className="text-xl">📉</div>
                      ) : (
                        <div className="text-xl">➡️</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </CardContent>
      </Card>
    );
  };

  const formatPeriod = (period: string): string => {
    switch (period) {
      case '1d': return 'Denní změna';
      case 'wtd': return 'Week-to-Date';
      case 'mtd': return 'Month-to-Date';
      case 'ytd': return 'Year-to-Date';
      case '1y': return '1 rok';
      case '3y': return '3 roky';
      case '5y': return '5 let';
      case '10y': return '10 let';
      default: return period;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Heatmap gridy */}
      {renderHeatmapGrid(data.sectors, '📊 Sektory S&P 500', 'sectors')}
      {renderHeatmapGrid(data.regions, '🌍 Regiony & Země', 'regions')}
      {renderHeatmapGrid(data.asset_classes, '💰 Třídy aktiv', 'assets')}
    </div>
  );
};

export default MarketHeatmap;