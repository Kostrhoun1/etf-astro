'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import ETFDetailedComparison from '@/components/ETFDetailedComparison';
import ETFComparisonContainer from '@/components/comparison/ETFComparisonContainer';
import type { ETF } from '@/types/etf';
import type { ETFBasicInfo } from '@/lib/etf-data';
import { supabase } from '@/lib/supabase';

interface SrovnaniETFWrapperProps {
  initialETFs?: ETFBasicInfo[];
  totalCount?: number;
}

function SrovnaniETFContent({ initialETFs, totalCount }: SrovnaniETFWrapperProps) {
  // Read URL parameters for pre-selected ETFs
  const [compareParam, setCompareParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setCompareParam(urlParams.get('compare'));
    }
  }, []);

  const preSelectedISINs = compareParam ? compareParam.split(',').filter(isin => isin.trim() !== '') : undefined;

  // Check if we have ISINs (already converted from tickers on server)
  const hasISINs = preSelectedISINs && preSelectedISINs.length > 0 &&
    preSelectedISINs.every(param => param.length >= 12 && /^[A-Z]{2}/.test(param));

  // If we have ISINs, start directly with detailed comparison
  const [showDetailedComparison, setShowDetailedComparison] = useState(false);
  const [selectedETFsForComparison, setSelectedETFsForComparison] = useState<ETF[]>([]);

  const handleShowDetailedComparison = (selectedETFs: ETF[]) => {
    setSelectedETFsForComparison(selectedETFs);
    setShowDetailedComparison(true);
  };

  const handleBackToList = () => {
    setShowDetailedComparison(false);
  };

  // Load ETFs from URL parameters when component mounts
  useEffect(() => {
    // Skip if no preSelectedISINs or if already have selected ETFs
    if (!preSelectedISINs || preSelectedISINs.length === 0 || selectedETFsForComparison.length > 0) {
      return;
    }

    const loadETFsFromURL = async () => {
      try {
        // If we got here and have ISINs, load them directly
        if (hasISINs) {
          const { data, error } = await supabase
            .from('etf_funds')
            .select('*')
            .in('isin', preSelectedISINs);

          if (error) {
            console.error('Error loading ETFs from ISINs:', error);
            return;
          }

          const loadedETFs = data as unknown as ETF[];
          setSelectedETFsForComparison(loadedETFs);
          setShowDetailedComparison(true);
          return;
        }

        // Find ETFs by tickers using all ticker fields
        const tickerFields = [
          'primary_ticker',
          'exchange_1_ticker', 'exchange_2_ticker', 'exchange_3_ticker', 'exchange_4_ticker', 'exchange_5_ticker',
          'exchange_6_ticker', 'exchange_7_ticker', 'exchange_8_ticker', 'exchange_9_ticker', 'exchange_10_ticker'
        ];

        const orConditions = preSelectedISINs.map(symbol =>
          tickerFields.map(field => `${field}.eq.${symbol}`).join(',')
        ).join(',');

        const { data, error } = await supabase
          .from('etf_funds')
          .select('*')
          .or(orConditions);

        if (error) {
          console.error('Error looking up tickers:', error);
          return;
        }

        const foundETFs = data as unknown as ETF[];

        if (foundETFs && foundETFs.length > 0) {
          setSelectedETFsForComparison(foundETFs);
          setShowDetailedComparison(true);
        }
      } catch (error) {
        console.error('Error loading ETFs from URL:', error);
      }
    };

    loadETFsFromURL();
  }, [preSelectedISINs, hasISINs, selectedETFsForComparison.length]);

  if (showDetailedComparison) {
    return (
      <ETFDetailedComparison
        selectedETFs={selectedETFsForComparison}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Interactive comparison tool with SSR initial data */}
      <ETFComparisonContainer
        onShowDetailedComparison={handleShowDetailedComparison}
        preSelectedISINs={preSelectedISINs}
        initialETFs={initialETFs}
        totalCount={totalCount}
      />
    </div>
  );
}

export default function SrovnaniETFWrapper(props: SrovnaniETFWrapperProps) {
  return (
    <CurrencyProvider>
      <SrovnaniETFContent {...props} />
    </CurrencyProvider>
  );
}
