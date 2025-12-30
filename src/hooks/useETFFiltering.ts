import { useState, useMemo, useEffect } from 'react';
import type { ETFListItem } from '../types/etf';
import { calculateETFRating } from '@/utils/etfRating';

export interface ETFFilters {
  searchTerm: string;
  category: string;
  distributionPolicy: string;
  replicationMethod: string;
  fundSizeRange: string;
  region: string;
  indexName: string;
  fundCurrency: string;
  minRating: number;
  terRange: [number, number];
  fundSizeRangeValues: [number, number];
  dividendYieldRange: [number, number];
  includeLeveragedETFs: boolean;
}

export interface ETFRanges {
  ter: { min: number; max: number };
  fundSize: { min: number; max: number };
  dividendYield: { min: number; max: number };
}

export interface ETFSorting {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ETFPagination {
  currentPage: number;
  itemsPerPage: number;
}

export const useETFFiltering = (etfs: ETFListItem[], defaultCategory?: string) => {
  const [sortBy, setSortBy] = useState<string>('ter_numeric');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;


  // Calculate ranges from data
  const ranges = useMemo<ETFRanges>(() => {
    const ters = etfs.map(etf => etf.ter_numeric || 0).filter(ter => ter > 0);
    const sizes = etfs.map(etf => etf.fund_size_numeric || 0).filter(size => size > 0);
    const dividendYields = etfs.map(etf => etf.current_dividend_yield_numeric || 0).filter(dividendYield => dividendYield > 0);
    
    return {
      ter: { min: 0, max: Math.max(...ters, 1) },
      fundSize: { min: 0, max: Math.max(...sizes, 100000) },
      dividendYield: { min: 0, max: Math.max(...dividendYields, 10) }
    };
  }, [etfs]);

  // Categories from data
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(etfs.map(etf => etf.category).filter(Boolean))];
    // Filter out 'Ostatní' category as it only contains 1 ETF
    return uniqueCategories
      .filter(category => category !== 'Ostatní')
      .sort((a, b) => a.localeCompare(b));
  }, [etfs]);

  // Initialize filters with global leveraged ETF state
  const getInitialLeveragedState = () => {
    try {
      const saved = localStorage.getItem('includeLeveragedETFs');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  };

  const [filters, setFilters] = useState<ETFFilters>({
    searchTerm: '',
    category: defaultCategory || (categories.includes('Akciové') ? 'Akciové' : categories[0] || ''),
    distributionPolicy: 'all',
    replicationMethod: 'all',
    fundSizeRange: 'all',
    region: 'all',
    indexName: 'all',
    fundCurrency: 'all',
    minRating: 0,
    terRange: [0, 1],
    fundSizeRangeValues: [0, 100000],
    dividendYieldRange: [0, 10],
    includeLeveragedETFs: getInitialLeveragedState(),
  });

  // Update ranges and category when data first loads (only once)
  useEffect(() => {
    if (etfs.length > 0 && filters.category === '') {
      setFilters(prev => ({
        ...prev,
        category: categories.includes('Akciové') ? 'Akciové' : categories[0] || '',
        terRange: [ranges.ter.min, ranges.ter.max],
        fundSizeRangeValues: [ranges.fundSize.min, ranges.fundSize.max],
        dividendYieldRange: [ranges.dividendYield.min, ranges.dividendYield.max],
      }));
    }
  }, [etfs.length > 0]); // Only run when data is first loaded

  // Listen for leveraged ETF changes from other components
  useEffect(() => {
    const handleLeveragedChange = (e: CustomEvent) => {
      setFilters(prev => ({ ...prev, includeLeveragedETFs: e.detail }));
    };
    
    window.addEventListener('leveragedETFChanged', handleLeveragedChange as EventListener);
    return () => window.removeEventListener('leveragedETFChanged', handleLeveragedChange as EventListener);
  }, []);

  // Main filtering logic
  const filteredETFs = useMemo(() => {
    return etfs
      .filter(etf => {
        // Search filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const matchesBasic = 
            etf.name.toLowerCase().includes(searchLower) ||
            etf.isin.toLowerCase().includes(searchLower) ||
            etf.fund_provider.toLowerCase().includes(searchLower);
          
          const matchesTickers = 
            (etf.primary_ticker && etf.primary_ticker.toLowerCase().includes(searchLower)) ||
            (etf.exchange_1_ticker && etf.exchange_1_ticker.toLowerCase().includes(searchLower)) ||
            (etf.exchange_2_ticker && etf.exchange_2_ticker.toLowerCase().includes(searchLower)) ||
            (etf.exchange_3_ticker && etf.exchange_3_ticker.toLowerCase().includes(searchLower)) ||
            (etf.exchange_4_ticker && etf.exchange_4_ticker.toLowerCase().includes(searchLower)) ||
            (etf.exchange_5_ticker && etf.exchange_5_ticker.toLowerCase().includes(searchLower));
          
          if (!matchesBasic && !matchesTickers) return false;
        }

        // Category filter
        if (etf.category !== filters.category) return false;

        // Leveraged ETF filter
        if (!filters.includeLeveragedETFs && etf.is_leveraged) return false;

        // Distribution policy filter
        if (filters.distributionPolicy !== 'all' && etf.distribution_policy !== filters.distributionPolicy) return false;

        // Replication method filter
        if (filters.replicationMethod !== 'all' && etf.replication !== filters.replicationMethod) return false;

        // Region filter
        if (filters.region !== 'all' && etf.region !== filters.region) return false;

        // Index name filter (case insensitive)
        if (filters.indexName !== 'all' && etf.index_name?.toLowerCase() !== filters.indexName.toLowerCase()) return false;

        // Fund currency filter
        if (filters.fundCurrency !== 'all' && etf.fund_currency !== filters.fundCurrency) return false;

        // Rating filter
        if (filters.minRating > 0) {
          const rating = etf.rating || calculateETFRating(etf)?.rating;
          if (!rating || rating < filters.minRating) return false;
        }

        // TER range filter
        const ter = etf.ter_numeric || 0;
        if (ter < filters.terRange[0] || ter > filters.terRange[1]) return false;

        // Fund size range filter
        if (etf.fund_size_numeric) {
          if (etf.fund_size_numeric < filters.fundSizeRangeValues[0] || 
              etf.fund_size_numeric > filters.fundSizeRangeValues[1]) return false;
        }

        // Dividend yield range filter
        if (etf.current_dividend_yield_numeric) {
          if (etf.current_dividend_yield_numeric < filters.dividendYieldRange[0] || 
              etf.current_dividend_yield_numeric > filters.dividendYieldRange[1]) return false;
        }

        // Fund size category filter
        if (filters.fundSizeRange !== 'all' && etf.fund_size_numeric) {
          const fundSizeInMillions = etf.fund_size_numeric;
          switch (filters.fundSizeRange) {
            case 'small':
              if (fundSizeInMillions >= 100) return false;
              break;
            case 'medium':
              if (fundSizeInMillions < 100 || fundSizeInMillions >= 1000) return false;
              break;
            case 'large':
              if (fundSizeInMillions < 1000 || fundSizeInMillions >= 10000) return false;
              break;
            case 'xlarge':
              if (fundSizeInMillions < 10000) return false;
              break;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let aValue: any = a[sortBy as keyof ETFListItem];
        let bValue: any = b[sortBy as keyof ETFListItem];
        
        // Special handling for TER - move 0 values to end
        if (sortBy === 'ter_numeric') {
          const aTer = aValue || 0;
          const bTer = bValue || 0;
          
          if (aTer === 0 && bTer !== 0) return sortOrder === 'asc' ? 1 : -1;
          if (bTer === 0 && aTer !== 0) return sortOrder === 'asc' ? -1 : 1;
          if (aTer === 0 && bTer === 0) return 0;
          
          return sortOrder === 'asc' ? aTer - bTer : bTer - aTer;
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
  }, [etfs, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredETFs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedETFs = filteredETFs.slice(startIndex, endIndex);

  // Helper functions
  const updateFilter = <K extends keyof ETFFilters>(key: K, value: ETFFilters[K]) => {
    // Save leveraged ETF preference globally
    if (key === 'includeLeveragedETFs') {
      localStorage.setItem('includeLeveragedETFs', JSON.stringify(value));
      // Trigger update in other components by dispatching custom event
      window.dispatchEvent(new CustomEvent('leveragedETFChanged', { detail: value }));
    }
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      category: defaultCategory || (categories.includes('Akciové') ? 'Akciové' : categories[0] || ''),
      distributionPolicy: 'all',
      replicationMethod: 'all',
      fundSizeRange: 'all',
      region: 'all',
      indexName: 'all',
      fundCurrency: 'all',
      minRating: 0,
      terRange: [ranges.ter.min, ranges.ter.max],
      fundSizeRangeValues: [ranges.fundSize.min, ranges.fundSize.max],
      dividendYieldRange: [ranges.dividendYield.min, ranges.dividendYield.max],
      includeLeveragedETFs: false,
    });
    setCurrentPage(1);
  };

  return {
    // Data
    filteredETFs,
    paginatedETFs,
    categories,
    ranges,
    
    // State
    filters,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    
    // Actions
    updateFilter,
    handleSort,
    setCurrentPage,
    resetFilters,
  };
};