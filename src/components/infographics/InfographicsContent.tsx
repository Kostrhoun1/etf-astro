'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SparklesIcon, TrendingUpIcon, ShieldIcon, BitcoinIcon, GemIcon, BuildingIcon } from '../ui/icons';
import MarketHeatmap from './MarketHeatmap';
import TwitterVariants from './TwitterVariants';
import { useETFSearchData } from '../../hooks/useETFSearchData';

interface InfographicProps {
  title: string;
  subtitle?: string;
  data?: any[];
  type: 'bar' | 'pie' | 'stats';
  children?: React.ReactNode;
  category?: string;
}

// Barvy ETF průvodce
const COLORS = {
  primary: '#8B5FBF', // violet-600 z designu
  primaryLight: '#A78BFA', // violet-400
  primaryDark: '#6D28D9', // violet-700
  success: '#10B981', // emerald-500
  warning: '#F59E0B', // amber-500
  danger: '#EF4444', // red-500
  info: '#3B82F6', // blue-500
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    600: '#4B5563',
    900: '#111827'
  }
};

const CHART_COLORS = [COLORS.primary, COLORS.success, COLORS.info, COLORS.warning, COLORS.danger, COLORS.primaryLight];

// Funkce pro získání ikony a barev podle kategorie
const getCategoryVisuals = (category: string) => {
  switch (category.toLowerCase()) {
    case 'akcie':
      return {
        icon: TrendingUpIcon,
        bgClass: 'from-green-600 via-green-700 to-emerald-800',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-100'
      };
    case 'dluhopisy':
      return {
        icon: ShieldIcon,
        bgClass: 'from-blue-600 via-blue-700 to-blue-800',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-100'
      };
    case 'krypto':
      return {
        icon: BitcoinIcon,
        bgClass: 'from-orange-600 via-orange-700 to-amber-800',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-100'
      };
    case 'komodity':
      return {
        icon: GemIcon,
        bgClass: 'from-yellow-600 via-yellow-700 to-yellow-800',
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-100'
      };
    case 'nemovitosti':
      return {
        icon: BuildingIcon,
        bgClass: 'from-purple-600 via-purple-700 to-purple-800',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-100'
      };
    default:
      return {
        icon: TrendingUpIcon,
        bgClass: 'from-gray-600 via-gray-700 to-gray-800',
        iconBg: 'bg-gray-500/20',
        iconColor: 'text-gray-100'
      };
  }
};

// Komponenta pro infografiku optimalizovanou pro social media
const InfographicCard: React.FC<InfographicProps> = ({ title, subtitle, children, category }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Získat vizuální prvky podle kategorie
  const visuals = getCategoryVisuals(category || '');
  const IconComponent = visuals.icon;

  return (
    <div 
      ref={cardRef}
      className="relative w-[900px] h-[700px] bg-white shadow-2xl"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Hlavní obsah */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${visuals.bgClass} text-white p-6`}>
          <div className="flex items-center gap-4">
            <div className={`${visuals.iconBg} p-3 rounded-xl`}>
              <IconComponent className={`w-8 h-8 ${visuals.iconColor}`} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold leading-tight">{title}</h1>
              {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-right">
          <div className="text-sm text-gray-600 font-medium">
            Zdroj: www.etfpruvodce.cz
          </div>
        </div>
      </div>

    </div>
  );
};

// Helper komponenta pro statistiky
const StatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const InfographicsContent: React.FC = () => {
  console.log('InfographicsGenerator component loaded');
  
  const [infographicMode, setInfographicMode] = useState<'performance' | 'ter' | 'heatmap'>('heatmap');
  const [category, setCategory] = useState<string>('Akcie');
  const [period, setPeriod] = useState<'ytd' | '1m' | '3m' | '6m' | '1y' | '3y' | '5y'>('3y');
  const [currency, setCurrency] = useState<'czk' | 'usd' | 'eur'>('czk');
  const [index, setIndex] = useState<string>('sp500');
  const [terMode, setTerMode] = useState<'category' | 'index'>('category');
  const [heatmapPeriod, setHeatmapPeriod] = useState<'1d' | 'wtd' | 'mtd' | '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | '10y'>('1y');
  const [heatmapData, setHeatmapData] = useState<any>(null);
  
  const { etfs, isLoading: loading } = useETFSearchData();
  
  console.log('🔍 InfographicsContent - etfs:', etfs?.length || 0, 'loading:', loading);

  // Dynamicky generovaný selectedType na základě výběru
  // Helper funkce pro titulky
  const getTitle = () => {
    if (infographicMode === 'performance') {
      const categoryMap: { [key: string]: string } = {
        'Akcie': 'AKCIOVÉ',
        'Dluhopisy': 'DLUHOPISOVÉ', 
        'Krypto': 'KRYPTO',
        'Komodity': 'KOMODITNÍ',
        'Nemovitosti': 'NEMOVITOSTNÍ'
      };
      return `NEJVÝKONNĚJŠÍ ${categoryMap[category] || category.toUpperCase()} ETF`;
    } else if (infographicMode === 'ter') {
      if (terMode === 'category') {
        const categoryMap: { [key: string]: string } = {
          'Akcie': 'AKCIOVÉ',
          'Dluhopisy': 'DLUHOPISOVÉ', 
          'Krypto': 'KRYPTO',
          'Komodity': 'KOMODITNÍ',
          'Nemovitosti': 'NEMOVITOSTNÍ'
        };
        return `NEJLEVNĚJŠÍ ${categoryMap[category] || category.toUpperCase()} ETF`;
      } else {
        return `NEJLEVNĚJŠÍ ${index.toUpperCase()} ETF`;
      }
    } else if (infographicMode === 'heatmap') {
      return `MARKET HEATMAP`;
    }
    return 'ETF ANALÝZA';
  };

  const getSubtitle = () => {
    if (infographicMode === 'performance') {
      const currentYear = new Date().getFullYear();
      const currentDate = new Date().toLocaleDateString('cs-CZ', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      
      const periodText = 
        period === 'ytd' ? `Od začátku roku ${currentYear}` : 
        period === '1m' ? 'Za poslední měsíc' :
        period === '3m' ? 'Za poslední 3 měsíce' :
        period === '6m' ? 'Za posledních 6 měsíců' :
        period === '1y' ? 'Za poslední rok' :
        period === '3y' ? 'Za poslední 3 roky' : 
        'Za posledních 5 let';
      
      const currencyText = currency.toUpperCase();
      return `${periodText} (${currencyText}) • Data k ${currentDate}`;
    } else if (infographicMode === 'ter') {
      const currentDate = new Date().toLocaleDateString('cs-CZ', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      return `Roční poplatky TER • Data k ${currentDate}`;
    } else if (infographicMode === 'heatmap') {
      const periodText = 
        heatmapPeriod === '1d' ? 'Za poslední den' :
        heatmapPeriod === 'wtd' ? 'Za poslední týden' :
        heatmapPeriod === 'mtd' ? 'Za poslední měsíc' :
        heatmapPeriod === '1m' ? 'Za poslední měsíc' :
        heatmapPeriod === '3m' ? 'Za poslední 3 měsíce' :
        heatmapPeriod === '6m' ? 'Za posledních 6 měsíců' :
        heatmapPeriod === 'ytd' ? 'Od začátku roku' :
        heatmapPeriod === '1y' ? 'Za poslední rok' :
        heatmapPeriod === '3y' ? 'Za poslední 3 roky' :
        heatmapPeriod === '5y' ? 'Za posledních 5 let' :
        heatmapPeriod === '10y' ? 'Za posledních 10 let' : heatmapPeriod;
      return periodText;
    }
    return '';
  };

  // Helper funkce pro získání prvního dostupného tickeru
  const getBestTicker = (etf: any): string => {
    const tickers = [
      etf.primary_ticker,
      etf.exchange_1_ticker,
      etf.exchange_2_ticker,
      etf.exchange_3_ticker,
      etf.exchange_4_ticker,
      etf.exchange_5_ticker,
      etf.exchange_6_ticker,
      etf.exchange_7_ticker,
      etf.exchange_8_ticker,
      etf.exchange_9_ticker,
      etf.exchange_10_ticker
    ];
    
    // Najde první neprázdný ticker (ignoruje pomlčky a prázdné stringy)
    const firstTicker = tickers.find(ticker => 
      ticker && 
      ticker.trim() !== '' && 
      ticker.trim() !== '-'
    );
    return firstTicker || 'N/A';
  };

  // Helper funkce pro social media varianty
  const getTopPerformingETFs = () => {
    // Použij stejnou logiku jako v getTopFundsByCategory
    const getReturnField = (period: string, currency: string) => {
      const suffix = currency === 'eur' ? '' : `_${currency}`;
      switch (period) {
        case 'ytd': return `return_ytd${suffix}`;
        case '1m': return `return_1m${suffix}`;
        case '3m': return `return_3m${suffix}`;
        case '6m': return `return_6m${suffix}`;
        case '1y': return `return_1y${suffix}`;
        case '3y': return `return_3y${suffix}`;
        case '5y': return `return_5y${suffix}`;
        default: return `return_ytd${suffix}`;
      }
    };

    const getReturnValue = (etf: any, period: string, currency: string) => {
      const primaryField = getReturnField(period, currency);
      let value = etf[primaryField];
      
      if (!value || value === 0) {
        const fallbackSuffix = currency === 'eur' ? '' : `_${currency}`;
        switch (period) {
          case '1m':
          case '3m':
            value = etf[`return_ytd${fallbackSuffix}`];
            break;
          case '6m':
            value = etf[`return_1y${fallbackSuffix}`] || etf[`return_ytd${fallbackSuffix}`];
            break;
          default:
            value = etf[primaryField];
        }
      }
      
      return value;
    };
    
    if (!etfs || !Array.isArray(etfs)) return [];
    
    return etfs
      .filter(etf => {
        if (etf.is_leveraged || etf.category !== category) return false;
        const returnValue = getReturnValue(etf, period, currency);
        return returnValue && returnValue !== 0;
      })
      .sort((a, b) => {
        const aValue = getReturnValue(a, period, currency);
        const bValue = getReturnValue(b, period, currency);
        return bValue - aValue;
      })
      .slice(0, 10)
      .map((etf, index) => ({
        name: etf.name,
        performance: getReturnValue(etf, period, currency).toFixed(1),
        ter_numeric: etf.ter_numeric ? etf.ter_numeric.toFixed(2) : 'N/A',
        isin: etf.isin,
        primary_ticker: getBestTicker(etf)
      }));
  };

  const getLowestTerETFs = () => {
    if (!etfs || !Array.isArray(etfs)) return [];
    
    if (terMode === 'category') {
      return etfs
        .filter(etf => 
          !etf.is_leveraged &&
          etf.ter_numeric && 
          etf.ter_numeric > 0 &&
          etf.category === category
        )
        .sort((a, b) => a.ter_numeric - b.ter_numeric)
        .slice(0, 10)
        .map((etf, index) => ({
          name: etf.name,
          ter_numeric: etf.ter_numeric.toFixed(2),
          isin: etf.isin,
          primary_ticker: getBestTicker(etf)
        }));
    } else {
      // Logic for index-based TER filtering
      const indexKeywords = getIndexKeywords(index);
      return etfs
        .filter(etf => {
          if (etf.is_leveraged || !etf.ter_numeric || etf.ter_numeric <= 0) return false;
          
          const name_lower = (etf.name || '').toLowerCase();
          const index_lower = (etf.index_name || '').toLowerCase();
          
          return indexKeywords.some(keyword => 
            name_lower.includes(keyword.toLowerCase()) || 
            index_lower.includes(keyword.toLowerCase())
          );
        })
        .sort((a, b) => a.ter_numeric - b.ter_numeric)
        .slice(0, 10)
        .map((etf, index) => ({
          name: etf.name,
          ter_numeric: etf.ter_numeric.toFixed(2),
          isin: etf.isin,
          primary_ticker: getBestTicker(etf)
        }));
    }
  };

  const getIndexKeywords = (indexType: string) => {
    switch (indexType) {
      case 'sp500': return ['S&P 500', 'SP500', 'Standard & Poor'];
      case 'nasdaq': return ['NASDAQ', 'Nasdaq'];
      case 'msci-world': return ['MSCI World', 'MSCI WORLD'];
      case 'ftse': return ['FTSE', 'Financial Times'];
      case 'stoxx': return ['STOXX', 'Euro Stoxx'];
      default: return [];
    }
  };


  const selectedType = React.useMemo(() => {
    if (infographicMode === 'performance') {
      return `top-${category.toLowerCase()}-${period}`;
    } else if (infographicMode === 'ter') {
      if (terMode === 'category') {
        return `nejlevnejsi-${category.toLowerCase()}`;
      } else {
        return `nejlevnejsi-${index}`;
      }
    } else if (infographicMode === 'heatmap') {
      return `heatmap-${heatmapPeriod}`;
    }
  }, [infographicMode, category, period, terMode, index, heatmapPeriod]);

  console.log('🔎 Before heatmap useEffect - mode:', infographicMode, 'period:', heatmapPeriod);
  
  // Load heatmap data - working version from original code
  useEffect(() => {
    console.log('🌟 Secondary heatmap useEffect for mode changes - mode:', infographicMode, 'period:', heatmapPeriod);
    if (infographicMode === 'heatmap') {
      const loadHeatmapData = async () => {
        try {
          const url = `/data/market_heatmap_${heatmapPeriod}.json`;
          console.log('🔥 Loading heatmap data from:', url);
          const response = await fetch(url);
          console.log('📊 Response status:', response.status, response.statusText);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('✅ Heatmap data loaded successfully:', {
            period: data.metadata?.period,
            sectorsCount: Object.keys(data.sectors || {}).length,
            regionsCount: Object.keys(data.regions || {}).length,
            assetClassesCount: Object.keys(data.asset_classes || {}).length
          });
          setHeatmapData(data);
        } catch (error) {
          console.error('❌ Chyba při načítání heatmap dat:', error);
          console.error('URL was:', `/data/market_heatmap_${heatmapPeriod}.json`);
          
          // Fallback dummy data pro testování
          console.log('🚨 Using fallback dummy data');
          const fallbackData = {
            metadata: {
              period: heatmapPeriod,
              generated_at: new Date().toISOString(),
              data_source: "Fallback Test Data"
            },
            sectors: {
              "Technology": {
                symbol: "XLK",
                performance: 15.2,
                current_price: 168.45,
                currency: "USD",
                name: "Technology Test",
                last_updated: new Date().toISOString()
              },
              "Healthcare": {
                symbol: "XLV",
                performance: 8.7,
                current_price: 142.31,
                currency: "USD", 
                name: "Healthcare Test",
                last_updated: new Date().toISOString()
              }
            },
            regions: {},
            asset_classes: {},
            summary_stats: {
              best_performers: {},
              worst_performers: {},
              category_averages: {}
            }
          };
          setHeatmapData(fallbackData);
        }
      };
      loadHeatmapData();
    } else {
      console.log('🚫 Not loading heatmap - mode is not heatmap');
    }
  }, [infographicMode, heatmapPeriod]);



  const renderContent = () => {
    console.log('🚀 RENDERCONTENT CALLED - mode:', infographicMode, 'loading:', loading, 'etfs:', etfs?.length);
    console.log('🎯 Heatmap data available:', !!heatmapData, 'heatmapPeriod:', heatmapPeriod);
    console.log('🎯 selectedType:', selectedType);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <SparklesIcon className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Načítám ETF data...</p>
            <p className="text-xs text-gray-400 mt-2">Debug: loading={String(loading)}</p>
          </div>
        </div>
      );
    }

    if (!etfs || etfs.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600">Žádná data k dispozici</p>
            <p className="text-xs text-gray-400 mt-2">Debug: etfs={etfs?.length || 'null/undefined'}</p>
          </div>
        </div>
      );
    }

    // Funkce pro získání barvy medaile (sdílená mezi všemi infografikami)
    const getMedalColor = (rank: number) => {
      switch (rank) {
        case 1: return { bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500', color: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-800' };
        case 2: return { bg: 'bg-gradient-to-r from-gray-300 to-gray-400', color: 'bg-gray-400', border: 'border-gray-400', text: 'text-gray-800' };
        case 3: return { bg: 'bg-gradient-to-r from-amber-600 to-amber-700', color: 'bg-amber-600', border: 'border-amber-600', text: 'text-amber-800' };
        default: return { bg: 'bg-violet-100', color: 'bg-violet-500', border: 'border-violet-400', text: 'text-violet-800' };
      }
    };

    // Názvy kategorií pro hlavní nadpis (sdílená funkce)
    const getCategoryNameForTitle = (category: string) => {
      switch (category) {
        case 'Akcie': return 'AKCIOVÝCH';
        case 'Dluhopisy': return 'DLUHOPISOVÝCH';
        case 'Krypto': return 'KRYPTO';
        case 'Komodity': return 'KOMODITNÍCH';
        case 'Nemovitosti': return 'NEMOVITOSTNÍCH';
        default: return category.toUpperCase();
      }
    };

    // Helper funkce pro získání TOP 5 fondů podle kategorie a období
    const getTopFundsByCategory = (category: string, period: 'ytd' | '1m' | '3m' | '6m' | '1y' | '3y' | '5y', periodLabel: string, currentCurrency: string) => {
      if (!etfs || !Array.isArray(etfs)) return [];
      
      // Mapování období na databázové sloupce s fallback logikou
      const getReturnField = (period: string, currency: string) => {
        // EUR sloupce nemají příponu, CZK a USD mají
        const suffix = currency === 'eur' ? '' : `_${currency}`;
        switch (period) {
          case 'ytd': return `return_ytd${suffix}`;
          case '1m': return `return_1m${suffix}`;
          case '3m': return `return_3m${suffix}`;
          case '6m': return `return_6m${suffix}`;
          case '1y': return `return_1y${suffix}`;
          case '3y': return `return_3y${suffix}`;
          case '5y': return `return_5y${suffix}`;
          default: return `return_ytd${suffix}`;
        }
      };
      
      // Funkce pro získání hodnoty s fallback logikou
      const getReturnValue = (etf: any, period: string, currency: string) => {
        const primaryField = getReturnField(period, currency);
        let value = etf[primaryField];
        
        // Pokud primární pole není dostupné nebo je 0, zkus fallback
        if (!value || value === 0) {
          const fallbackSuffix = currency === 'eur' ? '' : `_${currency}`;
          switch (period) {
            case '1m':
            case '3m':
              // Pro 1M a 3M zkus YTD jako fallback
              value = etf[`return_ytd${fallbackSuffix}`];
              break;
            case '6m':
              // Pro 6M zkus 1Y jako fallback
              value = etf[`return_1y${fallbackSuffix}`] || etf[`return_ytd${fallbackSuffix}`];
              break;
            default:
              value = etf[primaryField];
          }
        }
        
        return value;
      };

      const allFilteredFunds = etfs
        .filter(etf => {
          if (etf.is_leveraged || etf.category !== category) return false;
          
          const returnValue = getReturnValue(etf, period, currentCurrency);
          return returnValue && returnValue !== 0;
        })
        .sort((a, b) => {
          const aValue = getReturnValue(a, period, currentCurrency);
          const bValue = getReturnValue(b, period, currentCurrency);
          return bValue - aValue;
        });
      
      const topFunds = allFilteredFunds
        .slice(0, 5)
        .map((etf, index) => ({
          rank: index + 1,
          name: etf.name,
          return: getReturnValue(etf, period, currentCurrency), // Použij fallback funkci
          provider: etf.fund_provider,
          isin: etf.isin,
          primary_ticker: etf.primary_ticker
        }));


      // Formátování období pro podnadpis s měnou
      const getPeriodDescription = (period: 'ytd' | '1m' | '3m' | '6m' | '1y' | '3y' | '5y', periodLabel: string, currency: string) => {
        const currentYear = new Date().getFullYear();
        const currentDate = new Date().toLocaleDateString('cs-CZ');
        const currencyLabel = currency.toUpperCase();
        
        switch (period) {
          case 'ytd':
            return `Výkonnost ${currentYear} YTD v ${currencyLabel}, k datu: ${currentDate}`;
          case '1m':
            return `1měsíční výkonnost v ${currencyLabel}, k datu: ${currentDate}`;
          case '3m':
            return `3měsíční výkonnost v ${currencyLabel}, k datu: ${currentDate}`;
          case '6m':
            return `6měsíční výkonnost v ${currencyLabel}, k datu: ${currentDate}`;
          case '1y':
            return `1letá výkonnost v ${currencyLabel}, k datu: ${currentDate}`;
          case '3y':
            return `3letá výkonnost v ${currencyLabel}, k datu: ${currentDate}`;
          case '5y':
            return `5letá výkonnost v ${currencyLabel}, k datu: ${currentDate}`;
          default:
            return `Výkonnost ${periodLabel} v ${currencyLabel}, k datu: ${currentDate}`;
        }
      };

      return (
        <InfographicCard 
          title={`TOP 5 NEJVÝKONĚJŠÍCH ${getCategoryNameForTitle(category)} ETF`} 
          subtitle={`${getPeriodDescription(period, periodLabel, currentCurrency)}`}
          category={category}
          type="stats"
        >
          <div className="space-y-2 h-full">
            {topFunds.length > 0 ? topFunds.map((etf) => {
              const medalStyle = getMedalColor(etf.rank);
              return (
                <div key={etf.isin} className={`relative bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 shadow-lg transition-all ${
                  etf.rank <= 3 ? medalStyle.border + ' shadow-xl' : 'border-gray-200'
                } ${etf.rank === 1 ? 'transform scale-102' : ''}`}>
                  
                  {/* Pozadí pro první místo */}
                  {etf.rank === 1 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl opacity-50"></div>
                  )}
                  
                  <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Medaile/Pozice */}
                      <div className={`w-14 h-14 ${medalStyle.bg} rounded-xl flex items-center justify-center shadow-lg ${
                        etf.rank <= 3 ? 'border-3 border-white' : ''
                      } ${etf.rank === 1 ? 'transform rotate-3' : ''}`}>
                        {etf.rank <= 3 ? (
                          <span className="text-2xl">
                            {etf.rank === 1 ? '🥇' : etf.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className={`${medalStyle.text} text-lg font-bold`}>{etf.rank}</span>
                        )}
                      </div>
                      
                      {/* Info o fondu */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-lg font-bold leading-tight mb-1 ${
                          etf.rank === 1 ? 'text-yellow-800' : 'text-gray-900'
                        }`}>
                          {etf.name}
                        </div>
                        <div className="text-gray-600 font-medium text-sm">{etf.primary_ticker || etf.isin}</div>
                      </div>
                    </div>
                    
                    {/* Výkonnost */}
                    <div className="text-right">
                      <div className={`font-black text-3xl ${
                        etf.rank === 1 ? 'text-yellow-600' : 
                        etf.rank === 2 ? 'text-gray-600' : 
                        etf.rank === 3 ? 'text-amber-600' : 
                        'text-violet-600'
                      }`}>
                        {etf.return > 0 ? '+' : ''}{etf.return.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-xl">Žádné fondy v této kategorii</p>
                </div>
              </div>
            )}
          </div>
        </InfographicCard>
      );
    };

    // Helper funkce pro získání TOP 5 nejlevnějších ETF podle TER
    const getCheapestETFsByCategory = (category: string) => {
      if (!etfs || !Array.isArray(etfs)) return [];
      
      const allFilteredFunds = etfs
        .filter(etf => 
          !etf.is_leveraged && // Vyloučit leveraged ETF
          etf.ter_numeric && 
          etf.ter_numeric > 0 &&
          etf.category === category
        )
        .sort((a, b) => a.ter_numeric - b.ter_numeric); // Seřadit od nejlevnějšího

      const topFunds = allFilteredFunds
        .slice(0, 5)
        .map((etf, index) => ({
          rank: index + 1,
          name: etf.name,
          ter: etf.ter_numeric,
          provider: etf.fund_provider,
          isin: etf.isin,
          primary_ticker: etf.primary_ticker
        }));

      return (
        <InfographicCard 
          title={`TOP 5 NEJLEVNĚJŠÍCH ${getCategoryNameForTitle(category)} ETF`} 
          subtitle={`Podle TER (Total Expense Ratio), k datu: ${new Date().toLocaleDateString('cs-CZ')}`}
          category={category}
          type="stats"
        >
          <div className="space-y-2 h-full">
            {topFunds.length > 0 ? topFunds.map((etf) => {
              const medalStyle = getMedalColor(etf.rank);
              return (
                <div key={etf.isin} className={`flex items-center justify-between p-4 rounded-lg ${medalStyle.bg}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full ${medalStyle.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {etf.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 leading-tight">
                        {etf.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {etf.provider} • {etf.primary_ticker}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {etf.ter.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">TER</div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-500">
                Pro tuto kategorii nejsou k dispozici data o TER
              </div>
            )}
          </div>
        </InfographicCard>
      );
    };

    // Helper funkce pro získání TOP 5 nejlevnějších ETF podle indexu
    const getCheapestETFsByIndex = (indexKeywords: string[], indexName: string) => {
      if (!etfs || !Array.isArray(etfs)) return [];
      
      const allFilteredFunds = etfs
        .filter(etf => {
          if (etf.is_leveraged || !etf.ter_numeric || etf.ter_numeric <= 0) return false;
          
          const name_lower = (etf.name || '').toLowerCase();
          const index_lower = (etf.index_name || '').toLowerCase();
          
          return indexKeywords.some(keyword => 
            name_lower.includes(keyword.toLowerCase()) || 
            index_lower.includes(keyword.toLowerCase())
          );
        })
        .sort((a, b) => a.ter_numeric - b.ter_numeric);

      const topFunds = allFilteredFunds
        .slice(0, 5)
        .map((etf, index) => ({
          rank: index + 1,
          name: etf.name,
          ter: etf.ter_numeric,
          provider: etf.fund_provider,
          isin: etf.isin,
          primary_ticker: etf.primary_ticker
        }));

      return (
        <InfographicCard 
          title={`TOP 5 NEJLEVNĚJŠÍCH ${indexName} ETF`} 
          subtitle={`Podle TER (Total Expense Ratio), k datu: ${new Date().toLocaleDateString('cs-CZ')}`}
          category="Akcie"
          type="stats"
        >
          <div className="space-y-2 h-full">
            {topFunds.length > 0 ? topFunds.map((etf) => {
              const medalStyle = getMedalColor(etf.rank);
              return (
                <div key={etf.isin} className={`flex items-center justify-between p-4 rounded-lg ${medalStyle.bg}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full ${medalStyle.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {etf.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 leading-tight">
                        {etf.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {etf.provider} • {etf.primary_ticker}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {etf.ter.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">TER</div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-500">
                Pro tento index nejsou k dispozici data o TER
              </div>
            )}
          </div>
        </InfographicCard>
      );
    };

    switch (selectedType) {
      // Akciové ETF
      case 'top-akcie-ytd':
        return getTopFundsByCategory('Akcie', 'ytd', 'YTD', currency);
      case 'top-akcie-1m':
        return getTopFundsByCategory('Akcie', '1m', '1M', currency);
      case 'top-akcie-3m':
        return getTopFundsByCategory('Akcie', '3m', '3M', currency);
      case 'top-akcie-6m':
        return getTopFundsByCategory('Akcie', '6m', '6M', currency);
      case 'top-akcie-1y':
        return getTopFundsByCategory('Akcie', '1y', '1Y', currency);
      case 'top-akcie-3y':
        return getTopFundsByCategory('Akcie', '3y', '3Y', currency);
      case 'top-akcie-5y':
        return getTopFundsByCategory('Akcie', '5y', '5Y', currency);

      // Dluhopisové ETF
      case 'top-dluhopisy-ytd':
        return getTopFundsByCategory('Dluhopisy', 'ytd', 'YTD', currency);
      case 'top-dluhopisy-1m':
        return getTopFundsByCategory('Dluhopisy', '1m', '1M', currency);
      case 'top-dluhopisy-3m':
        return getTopFundsByCategory('Dluhopisy', '3m', '3M', currency);
      case 'top-dluhopisy-6m':
        return getTopFundsByCategory('Dluhopisy', '6m', '6M', currency);
      case 'top-dluhopisy-1y':
        return getTopFundsByCategory('Dluhopisy', '1y', '1Y', currency);
      case 'top-dluhopisy-3y':
        return getTopFundsByCategory('Dluhopisy', '3y', '3Y', currency);
      case 'top-dluhopisy-5y':
        return getTopFundsByCategory('Dluhopisy', '5y', '5Y', currency);

      // Krypto ETF
      case 'top-krypto-ytd':
        return getTopFundsByCategory('Krypto', 'ytd', 'YTD', currency);
      case 'top-krypto-1m':
        return getTopFundsByCategory('Krypto', '1m', '1M', currency);
      case 'top-krypto-3m':
        return getTopFundsByCategory('Krypto', '3m', '3M', currency);
      case 'top-krypto-6m':
        return getTopFundsByCategory('Krypto', '6m', '6M', currency);
      case 'top-krypto-1y':
        return getTopFundsByCategory('Krypto', '1y', '1Y', currency);
      case 'top-krypto-3y':
        return getTopFundsByCategory('Krypto', '3y', '3Y', currency);
      case 'top-krypto-5y':
        return getTopFundsByCategory('Krypto', '5y', '5Y', currency);

      // Komoditní ETF
      case 'top-komodity-ytd':
        return getTopFundsByCategory('Komodity', 'ytd', 'YTD', currency);
      case 'top-komodity-1m':
        return getTopFundsByCategory('Komodity', '1m', '1M', currency);
      case 'top-komodity-3m':
        return getTopFundsByCategory('Komodity', '3m', '3M', currency);
      case 'top-komodity-6m':
        return getTopFundsByCategory('Komodity', '6m', '6M', currency);
      case 'top-komodity-1y':
        return getTopFundsByCategory('Komodity', '1y', '1Y', currency);
      case 'top-komodity-3y':
        return getTopFundsByCategory('Komodity', '3y', '3Y', currency);
      case 'top-komodity-5y':
        return getTopFundsByCategory('Komodity', '5y', '5Y', currency);

      // Nemovitostní ETF
      case 'top-nemovitosti-ytd':
        return getTopFundsByCategory('Nemovitosti', 'ytd', 'YTD', currency);
      case 'top-nemovitosti-1m':
        return getTopFundsByCategory('Nemovitosti', '1m', '1M', currency);
      case 'top-nemovitosti-3m':
        return getTopFundsByCategory('Nemovitosti', '3m', '3M', currency);
      case 'top-nemovitosti-6m':
        return getTopFundsByCategory('Nemovitosti', '6m', '6M', currency);
      case 'top-nemovitosti-1y':
        return getTopFundsByCategory('Nemovitosti', '1y', '1Y', currency);
      case 'top-nemovitosti-3y':
        return getTopFundsByCategory('Nemovitosti', '3y', '3Y', currency);
      case 'top-nemovitosti-5y':
        return getTopFundsByCategory('Nemovitosti', '5y', '5Y', currency);
      
      // Nejlevnější ETF podle TER - kategorie
      case 'nejlevnejsi-akcie':
        return getCheapestETFsByCategory('Akcie');
      case 'nejlevnejsi-dluhopisy':
        return getCheapestETFsByCategory('Dluhopisy');
      case 'nejlevnejsi-krypto':
        return getCheapestETFsByCategory('Krypto');
      case 'nejlevnejsi-komodity':
        return getCheapestETFsByCategory('Komodity');
      case 'nejlevnejsi-nemovitosti':
        return getCheapestETFsByCategory('Nemovitosti');
      
      // Nejlevnější ETF podle indexů
      case 'nejlevnejsi-sp500':
        return getCheapestETFsByIndex(['S&P 500', 'SP500', 'Standard & Poor'], 'S&P 500');
      case 'nejlevnejsi-nasdaq':
        return getCheapestETFsByIndex(['NASDAQ', 'Nasdaq'], 'NASDAQ');
      case 'nejlevnejsi-msci-world':
        return getCheapestETFsByIndex(['MSCI World', 'MSCI WORLD'], 'MSCI WORLD');
      case 'nejlevnejsi-ftse':
        return getCheapestETFsByIndex(['FTSE', 'Financial Times'], 'FTSE');
      case 'nejlevnejsi-stoxx':
        return getCheapestETFsByIndex(['STOXX', 'Euro Stoxx'], 'STOXX');
      
      // Market Heatmap
      case 'heatmap-1d':
      case 'heatmap-wtd':
      case 'heatmap-mtd':
      case 'heatmap-1m':
      case 'heatmap-3m':
      case 'heatmap-6m':
      case 'heatmap-ytd':
      case 'heatmap-1y':
      case 'heatmap-3y':
      case 'heatmap-5y':
      case 'heatmap-10y':
        console.log('🎯 Rendering heatmap - data available:', !!heatmapData, 'selectedType:', selectedType);
        console.log('🎯 Heatmap data object:', heatmapData);
        console.log('🔍 Checking heatmapData structure:');
        console.log('  - Has heatmapData:', !!heatmapData);
        console.log('  - Has sectors:', !!heatmapData?.sectors);
        console.log('  - Sectors keys:', heatmapData?.sectors ? Object.keys(heatmapData.sectors) : 'none');
        console.log('  - Sectors count:', heatmapData?.sectors ? Object.keys(heatmapData.sectors).length : 0);
        
        // Simplified check - render if data exists at all
        if (heatmapData) {
          console.log('✨ Rendering MarketHeatmap with data - any data exists');
          return <MarketHeatmap data={heatmapData} />;
        } else {
          console.log('⏳ Showing heatmap loading state - no data');
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <SparklesIcon className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Načítám market heatmap...</p>
              </div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Generator infografik pro X</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/infographics'}
              className="text-sm"
            >
              🌍 English Version
            </Button>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Vytvořte profesionální infografiky s daty o výkonnosti ETF fondů pro publikování na sociálních sítích.
          </p>
          
          <div className="space-y-6 mb-8">
            {/* Výběr typu infografiky */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Typ infografiky</h3>
              <RadioGroup value={infographicMode} onValueChange={(value: 'performance' | 'ter' | 'heatmap') => setInfographicMode(value)} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performance" id="performance" />
                  <Label htmlFor="performance" className="text-base">📈 Výkonnost (TOP ETF)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ter" id="ter" />
                  <Label htmlFor="ter" className="text-base">💰 Nejlevnější (TER)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="heatmap" id="heatmap" />
                  <Label htmlFor="heatmap" className="text-base">🔥 Market Heatmap</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Nastavení pro výkonnost */}
            {infographicMode === 'performance' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Kategorie ETF</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Akcie">📊 Akciové ETF</SelectItem>
                      <SelectItem value="Dluhopisy">🛡️ Dluhopisové ETF</SelectItem>
                      <SelectItem value="Krypto">₿ Krypto ETF</SelectItem>
                      <SelectItem value="Komodity">💎 Komoditní ETF</SelectItem>
                      <SelectItem value="Nemovitosti">🏢 Nemovitostní ETF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Časové období</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ytd">📅 YTD (od začátku roku)</SelectItem>
                      <SelectItem value="1m">📅 1 měsíc</SelectItem>
                      <SelectItem value="3m">📆 3 měsíce</SelectItem>
                      <SelectItem value="6m">📊 6 měsíců</SelectItem>
                      <SelectItem value="1y">🗓️ 1 rok</SelectItem>
                      <SelectItem value="3y">📆 3 roky</SelectItem>
                      <SelectItem value="5y">📈 5 let</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Měna</Label>
                  <Select value={currency} onValueChange={(value: 'czk' | 'usd' | 'eur') => setCurrency(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="czk">🇨🇿 CZK (Koruna)</SelectItem>
                      <SelectItem value="eur">🇪🇺 EUR (Euro)</SelectItem>
                      <SelectItem value="usd">🇺🇸 USD (Dolar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Nastavení pro TER */}
            {infographicMode === 'ter' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Způsob výběru</Label>
                  <RadioGroup value={terMode} onValueChange={(value: 'category' | 'index') => setTerMode(value)} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="category" id="category" />
                      <Label htmlFor="category">Podle kategorie</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="index" id="index" />
                      <Label htmlFor="index">Podle indexu</Label>
                    </div>
                  </RadioGroup>
                </div>

                {terMode === 'category' ? (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Kategorie ETF</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full md:w-80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Akcie">📊 Akciové ETF</SelectItem>
                        <SelectItem value="Dluhopisy">🛡️ Dluhopisové ETF</SelectItem>
                        <SelectItem value="Krypto">₿ Krypto ETF</SelectItem>
                        <SelectItem value="Komodity">💎 Komoditní ETF</SelectItem>
                        <SelectItem value="Nemovitosti">🏢 Nemovitostní ETF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Index</Label>
                    <Select value={index} onValueChange={setIndex}>
                      <SelectTrigger className="w-full md:w-80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sp500">📈 S&P 500</SelectItem>
                        <SelectItem value="nasdaq">💻 NASDAQ</SelectItem>
                        <SelectItem value="msci-world">🌍 MSCI World</SelectItem>
                        <SelectItem value="ftse">🇬🇧 FTSE</SelectItem>
                        <SelectItem value="stoxx">🇪🇺 STOXX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Nastavení pro heatmap */}
            {infographicMode === 'heatmap' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Časové období</Label>
                    <Select value={heatmapPeriod} onValueChange={(value: '1d' | 'wtd' | 'mtd' | '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | '10y') => setHeatmapPeriod(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">📊 Denní změna</SelectItem>
                        <SelectItem value="wtd">📅 WTD (týden)</SelectItem>
                        <SelectItem value="mtd">📆 MTD (měsíc)</SelectItem>
                        <SelectItem value="1m">📅 1 měsíc</SelectItem>
                        <SelectItem value="3m">📆 3 měsíce</SelectItem>
                        <SelectItem value="6m">📊 6 měsíců</SelectItem>
                        <SelectItem value="ytd">📈 YTD (rok)</SelectItem>
                        <SelectItem value="1y">🗓️ 1 rok</SelectItem>
                        <SelectItem value="3y">📈 3 roky</SelectItem>
                        <SelectItem value="5y">📊 5 let</SelectItem>
                        <SelectItem value="10y">🏆 10 let</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <Badge variant="secondary" className="text-sm">
                {etfs?.length || 0} ETF fondů v databázi
              </Badge>
              <Badge variant="outline" className="text-sm">
                {infographicMode === 'performance' ? 
                  `${category} • ${
                    period === 'ytd' ? 'YTD' : 
                    period === '1m' ? '1 měsíc' :
                    period === '3m' ? '3 měsíce' :
                    period === '6m' ? '6 měsíců' :
                    period === '1y' ? '1 rok' :
                    period === '3y' ? '3 roky' : 
                    period === '5y' ? '5 let' : period
                  } • ${currency.toUpperCase()}` :
                  infographicMode === 'ter' ?
                  `TER • ${terMode === 'category' ? category : index.toUpperCase()}` :
                  `Heatmap • ${
                    heatmapPeriod === '1d' ? 'Denní' :
                    heatmapPeriod === 'wtd' ? 'WTD' :
                    heatmapPeriod === 'mtd' ? 'MTD' :
                    heatmapPeriod === '1m' ? '1 měsíc' :
                    heatmapPeriod === '3m' ? '3 měsíce' :
                    heatmapPeriod === '6m' ? '6 měsíců' :
                    heatmapPeriod === 'ytd' ? 'YTD' :
                    heatmapPeriod === '1y' ? '1 rok' :
                    heatmapPeriod === '3y' ? '3 roky' :
                    heatmapPeriod === '5y' ? '5 let' :
                    heatmapPeriod === '10y' ? '10 let' : heatmapPeriod
                  }`
                }
              </Badge>
            </div>
          </div>
        </div>


        {/* Main Infographic Content */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {infographicMode === 'heatmap' ? '🔥 Market Heatmap' : '🎨 Infografiky pro X/Twitter'}
          </h2>
          
          {/* Render the actual content */}
          <div className="flex justify-center">
            {renderContent()}
          </div>
        </div>

        {/* Twitter/X infografiky - only for non-heatmap modes */}
        {infographicMode !== 'heatmap' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">🎨 Infografiky pro X/Twitter</h2>
            <TwitterVariants
              title={getTitle()}
              subtitle={getSubtitle()}
              data={infographicMode === 'performance' ? getTopPerformingETFs() : getLowestTerETFs()}
              mode={infographicMode === 'performance' ? 'performance' : 'ter'}
            />
          </div>
        )}

      </div>
    </>
  );
};

export default InfographicsContent;