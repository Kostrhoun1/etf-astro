
'use client';

import { useState, useEffect } from 'react';
import { useETFData } from './useETFData';
import type { ETFListItem } from '../types/etf';
import type { ETFBasicInfo } from '../lib/etf-data';

// Static list of all categories - always show all tabs
const ALL_CATEGORIES = ['Akcie', 'Dluhopisy', 'Komodity', 'Krypto', 'Nemovitosti'];

// Convert ETFBasicInfo to ETFListItem format
const convertToETFListItem = (etf: ETFBasicInfo): ETFListItem => ({
  isin: etf.isin,
  name: etf.name,
  fund_provider: etf.fund_provider,
  primary_ticker: etf.primary_ticker,
  ticker: etf.primary_ticker || 'N/A',
  ter_numeric: etf.ter_numeric,
  fund_size_numeric: etf.fund_size_numeric,
  rating: etf.rating,
  return_ytd: etf.return_ytd,
  return_1y: etf.return_1y,
  return_3y: etf.return_3y,
  return_5y: etf.return_5y,
  category: etf.category,
  distribution_policy: etf.distribution_policy,
  replication: etf.replication,
} as ETFListItem);

interface UseETFSearchDataOptions {
  initialETFs?: ETFBasicInfo[];
  initialTotalCount?: number;
}

export const useETFSearchData = (options?: UseETFSearchDataOptions) => {
  const { initialETFs, initialTotalCount } = options || {};

  // Initialize with SSR data if provided
  const initialETFListItems = initialETFs?.map(convertToETFListItem) || [];

  const [etfs, setETFs] = useState<ETFListItem[]>(initialETFListItems);
  const [categories] = useState<string[]>(ALL_CATEGORIES); // Always show all categories
  const [maxTerFromData, setMaxTerFromData] = useState<number>(2);
  const [totalETFCount, setTotalETFCount] = useState<number>(initialTotalCount || 0);
  const [hasLoadedFull, setHasLoadedFull] = useState(false);
  const { fetchETFs, isLoading: isLoadingFromHook, lastUpdated, getETFCount } = useETFData();

  // Show loading only if we don't have initial data
  const isLoading = !initialETFs?.length && isLoadingFromHook;

  // True when all data is loaded (not just initial SSR data)
  const isFullDataLoaded = hasLoadedFull;

  // Categories are now static - no need to extract from data

  // Load full data in background
  useEffect(() => {
    if (hasLoadedFull) return;

    const loadFullData = async () => {
      try {
        // Načti všechny ETF najednou
        const allETFs = await fetchETFs();

        // Přidej ticker alias pro kompatibilitu
        const allETFsWithTicker = allETFs.map(etf => ({
          ...etf,
          ticker: etf.primary_ticker || etf.exchange_1_ticker || 'N/A'
        }));
        setETFs(allETFsWithTicker);

        // Spočítej celkový počet ETF
        const totalCount = await getETFCount();
        setTotalETFCount(totalCount);

        // Calculate max TER ze všech dat
        const allTerValues = allETFsWithTicker.map(etf => etf.ter_numeric).filter(ter => ter && ter > 0);
        if (allTerValues.length > 0) {
          const maxTer = Math.max(...allTerValues);
          setMaxTerFromData(Math.ceil(maxTer * 100) / 100);
        }

        setHasLoadedFull(true);
      } catch (error) {
        console.error('Error loading full ETF data:', error);
      }
    };

    loadFullData();
  }, [hasLoadedFull]);

  return {
    etfs,
    categories,
    maxTerFromData,
    totalETFCount,
    isLoading,
    isLoadingComplete: !isLoading || hasLoadedFull,
    lastUpdated
  };
};
