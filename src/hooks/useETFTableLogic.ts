'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ETFListItem } from '../types/etf';
import { calculateETFRating } from '@/utils/etfRating';
import { detectHedging, filterByHedging } from '@/utils/hedgingDetection';

type AdvancedFilterValue = string | number | boolean | [number, number];

export interface AdvancedFiltersState {
  distributionPolicy: string;
  indexName: string;
  fundCurrency: string;
  maxTer: number;
  replicationMethod: string;
  fundSizeRange: string;
  region: string;
  terRange: [number, number];
  fundSizeRangeValues: [number, number];
  dividendYieldRange: [number, number];
  includeLeveragedETFs: boolean;
  minRating: number;
  hedgingType?: string;
}

// Static list of all categories - always show all tabs
const ALL_CATEGORIES = ['Akcie', 'Dluhopisy', 'Komodity', 'Krypto', 'Nemovitosti'];

export const useETFTableLogic = (etfs: ETFListItem[], staticCategories?: string[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [sortBy, setSortBy] = useState<string>('ter_numeric');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [minRating, setMinRating] = useState(0);
  const itemsPerPage = 50;

  const ranges = useMemo(() => {
    const ters = etfs.map(etf => etf.ter_numeric || 0).filter(ter => ter > 0);
    const sizes = etfs.map(etf => etf.fund_size_numeric || 0).filter(size => size > 0);
    const dividendYields = etfs.map(etf => etf.current_dividend_yield_numeric || 0).filter(dividendYield => dividendYield > 0);
    
    return {
      ter: { min: 0, max: Math.max(...ters, 1) },
      fundSize: { min: 0, max: Math.max(...sizes, 100000) },
      dividendYield: { min: 0, max: Math.max(...dividendYields, 10) }
    };
  }, [etfs]);

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
    distributionPolicy: 'all',
    indexName: 'all',
    fundCurrency: 'all',
    maxTer: 1,
    replicationMethod: 'all',
    fundSizeRange: 'all',
    region: 'all',
    terRange: [0, 1],
    fundSizeRangeValues: [0, 100000],
    dividendYieldRange: [0, 10],
    includeLeveragedETFs: false,
    minRating: 0,
    hedgingType: 'all',
  });

  // Use static categories if provided, otherwise extract from data
  const categories = useMemo(() => {
    if (staticCategories) {
      return staticCategories;
    }
    // Fallback: extract from data (legacy behavior)
    const uniqueCategories = [...new Set(etfs.map(etf => etf.category).filter(Boolean))];

    // Filter out 'Ostatní' category as it only contains 1 ETF
    return uniqueCategories
      .filter(category => category !== 'Ostatní')
      .sort((a, b) => a.localeCompare(b));
  }, [etfs, staticCategories]);

  const activeCategory = selectedCategory ?? (categories.includes('Akcie') ? 'Akcie' : categories[0] ?? '');

  useEffect(() => {
    if (etfs.length > 0) {
      setAdvancedFilters(prev => ({
        ...prev,
        maxTer: ranges.ter.max,
        terRange: [ranges.ter.min, ranges.ter.max],
        fundSizeRangeValues: [ranges.fundSize.min, ranges.fundSize.max],
        dividendYieldRange: [ranges.dividendYield.min, ranges.dividendYield.max],
      }));
    }
  }, [etfs, ranges.ter.max, ranges.fundSize.max, ranges.dividendYield.max]);

  const filteredETFs = useMemo(() => {
    const result = etfs
      .filter(etf => {
        const searchLower = searchTerm.toLowerCase();
        
        const basicFieldsMatch = 
          etf.name.toLowerCase().includes(searchLower) ||
          etf.isin.toLowerCase().includes(searchLower) ||
          etf.fund_provider.toLowerCase().includes(searchLower);
        
        // Rozšířené vyhledávání ve všech ticker polích s intelligent matching
        const isTickerSearch = searchLower.length >= 3 && searchLower.match(/^[A-Z0-9]+$/i);
        
        const tickerFieldsMatch = isTickerSearch ? (
          // Pro ticker search: přesná shoda nebo začátek tickeru (ROZŠÍŘENO na 10 exchanges)
          (etf.primary_ticker && (etf.primary_ticker.toLowerCase() === searchLower || etf.primary_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_1_ticker && (etf.exchange_1_ticker.toLowerCase() === searchLower || etf.exchange_1_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_2_ticker && (etf.exchange_2_ticker.toLowerCase() === searchLower || etf.exchange_2_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_3_ticker && (etf.exchange_3_ticker.toLowerCase() === searchLower || etf.exchange_3_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_4_ticker && (etf.exchange_4_ticker.toLowerCase() === searchLower || etf.exchange_4_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_5_ticker && (etf.exchange_5_ticker.toLowerCase() === searchLower || etf.exchange_5_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_6_ticker && (etf.exchange_6_ticker.toLowerCase() === searchLower || etf.exchange_6_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_7_ticker && (etf.exchange_7_ticker.toLowerCase() === searchLower || etf.exchange_7_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_8_ticker && (etf.exchange_8_ticker.toLowerCase() === searchLower || etf.exchange_8_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_9_ticker && (etf.exchange_9_ticker.toLowerCase() === searchLower || etf.exchange_9_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_10_ticker && (etf.exchange_10_ticker.toLowerCase() === searchLower || etf.exchange_10_ticker.toLowerCase().startsWith(searchLower)))
        ) : (
          // Pro obyčejný text search: substring match (ROZŠÍŘENO na 10 exchanges)
          (etf.primary_ticker && etf.primary_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_1_ticker && etf.exchange_1_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_2_ticker && etf.exchange_2_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_3_ticker && etf.exchange_3_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_4_ticker && etf.exchange_4_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_5_ticker && etf.exchange_5_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_6_ticker && etf.exchange_6_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_7_ticker && etf.exchange_7_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_8_ticker && etf.exchange_8_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_9_ticker && etf.exchange_9_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_10_ticker && etf.exchange_10_ticker.toLowerCase().includes(searchLower))
        );
        
        return basicFieldsMatch || tickerFieldsMatch;
      })
      .filter(etf => etf.category === activeCategory)
      .filter(etf => {
        // Rating filter - use database rating if available, fallback to calculated
        if (advancedFilters.minRating > 0) {
          const rating = etf.rating || calculateETFRating(etf)?.rating;
          if (!rating || rating < advancedFilters.minRating) {
            return false;
          }
        }
        return true;
      })
      .filter(etf => {
        // Filter out leveraged ETFs if not included
        if (!advancedFilters.includeLeveragedETFs && etf.is_leveraged) {
          return false;
        }
        return true;
      })
      .filter(etf => {
        const { distributionPolicy, indexName, fundCurrency, maxTer, replicationMethod, fundSizeRange, region, terRange, fundSizeRangeValues, dividendYieldRange, hedgingType } = advancedFilters;
        const distPolicyMatch = distributionPolicy === 'all' || etf.distribution_policy === distributionPolicy;
        const indexMatch = indexName === 'all' || etf.index_name === indexName;
        const currencyMatch = fundCurrency === 'all' || etf.fund_currency === fundCurrency;
        const terMatch = (etf.ter_numeric || 0) <= maxTer;
        const regionMatch = region === 'all' || etf.region === region;
        
        const terRangeMatch = (etf.ter_numeric || 0) >= terRange[0] && (etf.ter_numeric || 0) <= terRange[1];
        const fundSizeRangeMatch = !etf.fund_size_numeric || (etf.fund_size_numeric >= fundSizeRangeValues[0] && etf.fund_size_numeric <= fundSizeRangeValues[1]);
        const dividendYieldRangeMatch = !etf.current_dividend_yield_numeric || (etf.current_dividend_yield_numeric >= dividendYieldRange[0] && etf.current_dividend_yield_numeric <= dividendYieldRange[1]);
        
        const replicationMatch = replicationMethod === 'all' || etf.replication === replicationMethod;
        
        let fundSizeMatch = true;
        if (fundSizeRange !== 'all' && etf.fund_size_numeric) {
          const fundSizeInMillions = etf.fund_size_numeric;
          
          switch (fundSizeRange) {
            case 'small':
              fundSizeMatch = fundSizeInMillions < 100;
              break;
            case 'medium':
              fundSizeMatch = fundSizeInMillions >= 100 && fundSizeInMillions < 1000;
              break;
            case 'large':
              fundSizeMatch = fundSizeInMillions >= 1000 && fundSizeInMillions < 10000;
              break;
            case 'xlarge':
              fundSizeMatch = fundSizeInMillions >= 10000;
              break;
            default:
              fundSizeMatch = true;
          }
        }
        
        // Hedging filter - VYLEPŠENO: používá currency_risk pole z databáze
        let hedgingMatch = true;
        if (hedgingType && hedgingType !== 'all') {
          const hedgingInfo = detectHedging(etf.name, etf.currency_risk);
          
          switch (hedgingType) {
            case 'unhedged':
              hedgingMatch = !hedgingInfo.isHedged;
              break;
            case 'hedged':
              hedgingMatch = hedgingInfo.isHedged;
              break;
            case 'eur_hedged':
              hedgingMatch = hedgingInfo.hedgingType === 'eur_hedged';
              break;
            case 'usd_hedged':
              hedgingMatch = hedgingInfo.hedgingType === 'usd_hedged';
              break;
            case 'gbp_hedged':
              hedgingMatch = hedgingInfo.hedgingType === 'gbp_hedged';
              break;
            case 'chf_hedged':
              hedgingMatch = hedgingInfo.hedgingType === 'chf_hedged';
              break;
            default:
              hedgingMatch = true;
          }
        }
        
        return distPolicyMatch && indexMatch && currencyMatch && terMatch && replicationMatch && fundSizeMatch && regionMatch && terRangeMatch && fundSizeRangeMatch && dividendYieldRangeMatch && hedgingMatch;
      })
      .sort((a, b) => {
        // Search relevance sorting - exact ticker matches first
        if (searchTerm.length >= 3 && searchTerm.match(/^[A-Z0-9]+$/i)) {
          const searchLower = searchTerm.toLowerCase();
          
          const getTickerRelevance = (etf: ETFListItem) => {
            // Check for exact ticker match (highest relevance)
            if (
              (etf.primary_ticker && etf.primary_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_1_ticker && etf.exchange_1_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_2_ticker && etf.exchange_2_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_3_ticker && etf.exchange_3_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_4_ticker && etf.exchange_4_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_5_ticker && etf.exchange_5_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_6_ticker && etf.exchange_6_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_7_ticker && etf.exchange_7_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_8_ticker && etf.exchange_8_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_9_ticker && etf.exchange_9_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_10_ticker && etf.exchange_10_ticker.toLowerCase() === searchLower)
            ) {
              return 3; // Exact match
            }
            
            // Check for prefix ticker match (medium relevance)
            if (
              (etf.primary_ticker && etf.primary_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_1_ticker && etf.exchange_1_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_2_ticker && etf.exchange_2_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_3_ticker && etf.exchange_3_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_4_ticker && etf.exchange_4_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_5_ticker && etf.exchange_5_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_6_ticker && etf.exchange_6_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_7_ticker && etf.exchange_7_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_8_ticker && etf.exchange_8_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_9_ticker && etf.exchange_9_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_10_ticker && etf.exchange_10_ticker.toLowerCase().startsWith(searchLower))
            ) {
              return 2; // Prefix match
            }
            
            return 1; // Other matches (name, ISIN, etc.)
          };
          
          const aRelevance = getTickerRelevance(a);
          const bRelevance = getTickerRelevance(b);
          
          if (aRelevance !== bRelevance) {
            return bRelevance - aRelevance; // Higher relevance first
          }
        }

        let aValue: any = a[sortBy as keyof ETFListItem];
        let bValue: any = b[sortBy as keyof ETFListItem];
        
        if (sortBy === 'ter_numeric') {
          const aTer = aValue || 0;
          const bTer = bValue || 0;
          
          if (aTer === 0 && bTer !== 0) {
            return sortOrder === 'asc' ? 1 : -1;
          }
          if (bTer === 0 && aTer !== 0) {
            return sortOrder === 'asc' ? -1 : 1;
          }
          if (aTer === 0 && bTer === 0) {
            return 0;
          }
          
          if (sortOrder === 'asc') {
            return aTer - bTer;
          } else {
            return bTer - aTer;
          }
        }
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    
    return result;
  }, [etfs, searchTerm, activeCategory, advancedFilters, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredETFs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedETFs = filteredETFs.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleAdvancedFilterChange = (key: keyof AdvancedFiltersState, value: AdvancedFilterValue) => {
    console.log(`🔄 Filter change: ${key} = ${value}`);
    setAdvancedFilters(prevFilters => {
      const newFilters = {...prevFilters, [key]: value};
      console.log('🔄 New filters:', newFilters);
      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleMinRatingChange = (value: number) => {
    setMinRating(value);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    sortBy,
    sortOrder,
    currentPage,
    minRating,
    advancedFilters,
    paginatedETFs,
    filteredETFs,
    totalPages,
    itemsPerPage,
    categories,
    activeCategory,
    startIndex,
    endIndex,
    ranges,
    handleSort,
    handleSearch,
    handleCategoryChange,
    setCurrentPage,
    handleAdvancedFilterChange,
    handleMinRatingChange
  };
};