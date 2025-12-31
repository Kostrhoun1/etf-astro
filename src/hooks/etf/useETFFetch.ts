
'use client';

import { useState, useCallback, useRef } from 'react';
import { useToast } from '../use-toast';
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
      console.log('Starting to fetch ETFs from API...');

      // If no limit specified, fetch all records in batches
      if (!limit) {
        console.log('Fetching all ETFs without limit...');
        let allData: any[] = [];
        let hasMore = true;
        let offset = 0;
        let latestUpdate: Date | null = null;
        const batchSize = 1000;

        while (hasMore) {
          const response = await fetch(`/api/etfs?offset=${offset}&limit=${batchSize}`);

          if (!response.ok) {
            throw new Error(`Failed to fetch ETFs: ${response.statusText}`);
          }

          const { data, error } = await response.json();

          if (error) {
            console.error('Error fetching ETFs batch:', error);
            throw new Error(`Failed to fetch ETFs: ${error}`);
          }

          if (data && data.length > 0) {
            allData = [...allData, ...data];

            // Track the latest update date
            data.forEach((item: any) => {
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
        console.log('Successfully loaded', allData.length, 'ETFs from API (all records)');
        console.log('Latest update date:', latestUpdate);
        return allData || [];
      } else {
        // Fetch with limit
        const response = await fetch(`/api/etfs?limit=${limit}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch ETFs: ${response.statusText}`);
        }

        const { data, error } = await response.json();

        if (error) {
          console.error('Error fetching ETFs:', error);
          throw new Error(`Failed to fetch ETFs: ${error}`);
        }

        // Track the latest update date
        let latestUpdate: Date | null = null;
        if (data) {
          data.forEach((item: any) => {
            const updateDate = new Date(item.updated_at || '');
            if (updateDate && !isNaN(updateDate.getTime())) {
              if (!latestUpdate || updateDate > latestUpdate) {
                latestUpdate = updateDate;
              }
            }
          });
        }

        setLastUpdated(latestUpdate);
        console.log('Successfully loaded', data?.length || 0, 'ETFs from API');
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
