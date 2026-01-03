
'use client';

import { useState, useCallback, useRef } from 'react';
import { useToast } from '../use-toast';
import { supabase } from '../../lib/supabase';
import type { ETFListItem } from '../../types/etf';

export const useETFFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const loadingRef = useRef(false);

  const fetchETFs = useCallback(async (limit?: number): Promise<ETFListItem[]> => {
    // Prevent duplicate calls
    if (loadingRef.current) {
      console.log('fetchETFs already in progress, skipping...');
      return [];
    }

    loadingRef.current = true;
    setIsLoading(true);

    try {
      console.log('Starting to fetch ETFs from database...');

      // If no limit specified, fetch all records in batches to avoid Supabase limits
      if (!limit) {
        console.log('Fetching all ETFs without limit...');
        let allData: any[] = [];
        let hasMore = true;
        let offset = 0;
        let latestUpdate: Date | null = null;
        const batchSize = 1000;

        while (hasMore) {
          const { data, error } = await supabase
            .from('etf_funds')
            .select(`
              isin,
              name,
              fund_provider,
              category,
              ter_numeric,
              return_1m,
              return_3m,
              return_6m,
              return_1y,
              return_3y,
              return_5y,
              return_ytd,
              return_1m_czk,
              return_3m_czk,
              return_6m_czk,
              return_1y_czk,
              return_3y_czk,
              return_5y_czk,
              return_ytd_czk,
              return_1m_usd,
              return_3m_usd,
              return_6m_usd,
              return_1y_usd,
              return_3y_usd,
              return_5y_usd,
              return_ytd_usd,
              fund_size_numeric,
              degiro_free,
              primary_ticker,
              distribution_policy,
              index_name,
              fund_currency,
              replication,
              region,
              current_dividend_yield_numeric,
              exchange_1_ticker,
              exchange_2_ticker,
              exchange_3_ticker,
              exchange_4_ticker,
              exchange_5_ticker,
              exchange_6_ticker,
              exchange_7_ticker,
              exchange_8_ticker,
              exchange_9_ticker,
              exchange_10_ticker,
              rating,
              rating_score,
              updated_at,
              is_leveraged
            `)
            .order('fund_size_numeric', { ascending: false, nullsFirst: false })
            .range(offset, offset + batchSize - 1);

          if (error) {
            console.error('Error fetching ETFs batch:', error);
            throw new Error(`Failed to fetch ETFs: ${error.message}`);
          }

          if (data && data.length > 0) {
            allData = [...allData, ...data];

            // Track the latest update date
            data.forEach(item => {
              if (item.updated_at) {
                const updateDate = new Date(item.updated_at);
                if (!latestUpdate || updateDate > latestUpdate) {
                  latestUpdate = updateDate;
                }
              }
            });

            offset += batchSize;
            console.log(`Loaded batch: ${data.length} ETFs, total so far: ${allData.length}`);

            // If we got less than batchSize, we've reached the end
            if (data.length < batchSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        setLastUpdated(latestUpdate);
        console.log('Successfully loaded', allData.length, 'ETFs from database (all records)');
        console.log('Latest update date:', latestUpdate);
        return allData || [];
      } else {
        // Original logic for when limit is specified
        let query = supabase
          .from('etf_funds')
          .select(`
            isin,
            name,
            fund_provider,
            category,
            ter_numeric,
            return_1m,
            return_3m,
            return_6m,
            return_1y,
            return_3y,
            return_5y,
            return_ytd,
            return_1m_czk,
            return_3m_czk,
            return_6m_czk,
            return_1y_czk,
            return_3y_czk,
            return_5y_czk,
            return_ytd_czk,
            return_1m_usd,
            return_3m_usd,
            return_6m_usd,
            return_1y_usd,
            return_3y_usd,
            return_5y_usd,
            return_ytd_usd,
            fund_size_numeric,
            degiro_free,
            primary_ticker,
            distribution_policy,
            index_name,
            fund_currency,
            replication,
            region,
            current_dividend_yield_numeric,
            exchange_1_ticker,
            exchange_2_ticker,
            exchange_3_ticker,
            exchange_4_ticker,
            exchange_5_ticker,
            exchange_6_ticker,
            exchange_7_ticker,
            exchange_8_ticker,
            exchange_9_ticker,
            exchange_10_ticker,
            rating,
            rating_score,
            updated_at,
            is_leveraged
          `)
          .order('fund_size_numeric', { ascending: false, nullsFirst: false })
          .limit(limit);

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching ETFs:', error);
          throw new Error(`Failed to fetch ETFs: ${error.message}`);
        }

        // Track the latest update date
        let latestUpdate: Date | null = null;
        if (data) {
          data.forEach(item => {
            // Use created_at since updated_at might not be available in all queries
            const updateDate = new Date(item.updated_at || '');
            if (updateDate && !isNaN(updateDate.getTime())) {
              if (!latestUpdate || updateDate > latestUpdate) {
                latestUpdate = updateDate;
              }
            }
          });
        }

        setLastUpdated(latestUpdate);
        console.log('Successfully loaded', data?.length || 0, 'ETFs from database');
        console.log('Latest update date:', latestUpdate);
        return data || [];
      }
    } catch (error) {
      console.error('Error in fetchETFs:', error);
      toast({
        title: "Chyba při načítání",
        description: error instanceof Error ? error.message : "Nepodařilo se načíst data z databáze.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [toast]);

  return { fetchETFs, isLoading, lastUpdated };
};
