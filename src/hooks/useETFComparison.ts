'use client';

import { useState, useCallback } from 'react';
import type { ETFListItem, ETF } from '../types/etf';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const useETFComparison = () => {
  const [selectedETFs, setSelectedETFs] = useState<ETF[]>([]);
  const { toast } = useToast();

  const fetchFullETFData = async (isin: string): Promise<ETF | null> => {
    try {
      const { data, error } = await supabase
        .from('etf_funds')
        .select(`
          isin,
          name,
          url,
          description_en,
          description_cs,
          ter,
          ter_numeric,
          fund_size,
          fund_size_numeric,
          fund_size_currency,
          fund_currency,
          fund_domicile,
          fund_provider,
          inception_date,
          distribution_policy,
          distribution_frequency,
          replication,
          legal_structure,
          index_name,
          investment_focus,
          sustainability,
          category,
          region,
          total_holdings,
          return_1y,
          return_3y,
          return_5y,
          return_ytd,
          volatility_1y,
          volatility_3y,
          volatility_5y,
          return_per_risk_1y,
          return_per_risk_3y,
          return_per_risk_5y,
          max_drawdown_1y,
          max_drawdown_3y,
          max_drawdown_5y,
          max_drawdown_inception,
          beta,
          correlation,
          tracking_error,
          information_ratio,
          primary_exchange,
          primary_ticker,
          total_exchanges,
          current_dividend_yield,
          current_dividend_yield_numeric,
          dividends_12m,
          dividends_12m_numeric,
          dividends_12m_currency,
          dividend_extraction_method,
          scraping_date,
          scraping_status,
          retry_count,
          degiro_free,
          holding_1_name,
          holding_1_weight,
          holding_2_name,
          holding_2_weight,
          holding_3_name,
          holding_3_weight,
          holding_4_name,
          holding_4_weight,
          holding_5_name,
          holding_5_weight,
          holding_6_name,
          holding_6_weight,
          holding_7_name,
          holding_7_weight,
          holding_8_name,
          holding_8_weight,
          holding_9_name,
          holding_9_weight,
          holding_10_name,
          holding_10_weight,
          country_1_name,
          country_1_weight,
          country_2_name,
          country_2_weight,
          country_3_name,
          country_3_weight,
          country_4_name,
          country_4_weight,
          country_5_name,
          country_5_weight,
          sector_1_name,
          sector_1_weight,
          sector_2_name,
          sector_2_weight,
          sector_3_name,
          sector_3_weight,
          sector_4_name,
          sector_4_weight,
          sector_5_name,
          sector_5_weight,
          exchange_1_name,
          exchange_1_currency,
          exchange_1_ticker,
          exchange_1_bloomberg,
          exchange_1_reuters,
          exchange_1_market_maker,
          exchange_2_name,
          exchange_2_currency,
          exchange_2_ticker,
          exchange_2_bloomberg,
          exchange_2_reuters,
          exchange_2_market_maker,
          exchange_3_name,
          exchange_3_currency,
          exchange_3_ticker,
          exchange_3_bloomberg,
          exchange_3_reuters,
          exchange_3_market_maker,
          exchange_4_name,
          exchange_4_currency,
          exchange_4_ticker,
          exchange_4_bloomberg,
          exchange_4_reuters,
          exchange_4_market_maker,
          exchange_5_name,
          exchange_5_currency,
          exchange_5_ticker,
          exchange_5_bloomberg,
          exchange_5_reuters,
          exchange_5_market_maker,
          return_1m,
          return_3m,
          return_6m,
          return_2021,
          return_2022,
          return_2023,
          return_2024,
          return_inception,
          return_1m_czk,
          return_3m_czk,
          return_6m_czk,
          return_ytd_czk,
          return_1y_czk,
          return_3y_czk,
          return_5y_czk,
          return_2021_czk,
          return_2022_czk,
          return_2023_czk,
          return_2024_czk,
          return_1m_usd,
          return_3m_usd,
          return_6m_usd,
          return_ytd_usd,
          return_1y_usd,
          return_3y_usd,
          return_5y_usd,
          return_2021_usd,
          return_2022_usd,
          return_2023_usd,
          return_2024_usd
        `)
        .eq('isin', isin)
        .single();

      if (error) {
        console.error('Error fetching full ETF data:', error);
        return null;
      }

      return data as ETF;
    } catch (error) {
      console.error('Error fetching full ETF data:', error);
      return null;
    }
  };

  const addETFToComparison = useCallback(async (etf: ETFListItem) => {
    if (selectedETFs.length >= 3) {
      const toastInstance = toast({
        title: "Maximum dosažen",
        description: "Můžete porovnat maximálně 3 ETF fondy současně.",
        variant: "destructive",
      });
      
      // Automatically dismiss after 3 seconds
      setTimeout(() => {
        toastInstance.dismiss();
      }, 3000);
      return false;
    }

    if (selectedETFs.some(selected => selected.isin === etf.isin)) {
      const toastInstance = toast({
        title: "Fond již vybrán",
        description: "Tento fond je již v porovnání.",
        variant: "destructive",
      });
      
      // Automatically dismiss after 3 seconds
      setTimeout(() => {
        toastInstance.dismiss();
      }, 3000);
      return false;
    }

    // Fetch full ETF data with all fields needed for comparison
    const fullETFData = await fetchFullETFData(etf.isin);
    if (!fullETFData) {
      const toastInstance = toast({
        title: "Chyba",
        description: "Nepodařilo se načíst kompletní data fondu.",
        variant: "destructive",
      });
      
      // Automatically dismiss after 3 seconds
      setTimeout(() => {
        toastInstance.dismiss();
      }, 3000);
      return false;
    }

    setSelectedETFs(prev => [...prev, fullETFData]);
    const toastInstance = toast({
      title: "Fond přidán",
      description: `${etf.name} byl přidán do porovnání.`,
    });
    
    // Automatically dismiss after 3 seconds
    setTimeout(() => {
      toastInstance.dismiss();
    }, 3000);
    return true;
  }, [selectedETFs, toast]);

  const removeETFFromComparison = useCallback((isin: string) => {
    setSelectedETFs(prev => prev.filter(etf => etf.isin !== isin));
    const toastInstance = toast({
      title: "Fond odebrán",
      description: "Fond byl odebrán z porovnání.",
    });
    
    // Automatically dismiss after 3 seconds
    setTimeout(() => {
      toastInstance.dismiss();
    }, 3000);
  }, [toast]);

  const clearComparison = useCallback(() => {
    setSelectedETFs([]);
    const toastInstance = toast({
      title: "Porovnání vymazáno",
      description: "Všechny fondy byly odebrány z porovnání.",
    });
    
    // Automatically dismiss after 3 seconds
    setTimeout(() => {
      toastInstance.dismiss();
    }, 3000);
  }, [toast]);

  const isETFSelected = useCallback((isin: string) => {
    return selectedETFs.some(etf => etf.isin === isin);
  }, [selectedETFs]);

  const loadETFsByISIN = useCallback(async (isins: string[]) => {
    const uniqueIsins = isins.filter((isin, index, self) => self.indexOf(isin) === index);
    const etfsToLoad = uniqueIsins.slice(0, 3); // Maximum 3 ETFs
    
    const loadPromises = etfsToLoad.map(async (isin) => {
      return await fetchFullETFData(isin);
    });

    try {
      const results = await Promise.all(loadPromises);
      const validETFs = results.filter((etf): etf is ETF => etf !== null);
      
      setSelectedETFs(validETFs);
      
      if (validETFs.length > 0) {
        const toastInstance = toast({
          title: "ETF fondy načteny",
          description: `Načteno ${validETFs.length} fondů pro porovnání.`,
        });
        
        setTimeout(() => {
          toastInstance.dismiss();
        }, 3000);
      }
      
      return validETFs;
    } catch (error) {
      console.error('Error loading ETFs by ISIN:', error);
      const toastInstance = toast({
        title: "Chyba",
        description: "Nepodařilo se načíst fondy pro porovnání.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        toastInstance.dismiss();
      }, 3000);
      return [];
    }
  }, [toast]);

  return {
    selectedETFs,
    addETFToComparison,
    removeETFFromComparison,
    clearComparison,
    isETFSelected,
    canAddMore: selectedETFs.length < 3,
    loadETFsByISIN,
  };
};
