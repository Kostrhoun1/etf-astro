
'use client';

import { useState, useCallback } from 'react';
import { useToast } from '../use-toast';
import { supabase } from '../../lib/supabase';
import type { ETF } from '../../types/etf';

export const useETFUpsert = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const upsertETFs = useCallback(async (etfs: ETF[]) => {
    setIsLoading(true);
    try {
      console.log('Starting upsert of', etfs.length, 'ETFs');
      
      // Transform ETF data to match database schema
      const transformedETFs = etfs.map(etf => ({
        isin: etf.isin,
        name: etf.name,
        url: etf.url,
        description_en: etf.description_en,
        description_cs: etf.description_cs,
        ter: etf.ter,
        ter_numeric: etf.ter_numeric || 0,
        fund_size: etf.fund_size,
        fund_size_numeric: etf.fund_size_numeric || 0,
        fund_size_currency: etf.fund_size_currency,
        fund_currency: etf.fund_currency,
        fund_domicile: etf.fund_domicile,
        fund_provider: etf.fund_provider,
        inception_date: etf.inception_date,
        distribution_policy: etf.distribution_policy,
        distribution_frequency: etf.distribution_frequency,
        replication: etf.replication,
        legal_structure: etf.legal_structure,
        index_name: etf.index_name,
        investment_focus: etf.investment_focus,
        sustainability: etf.sustainability,
        category: etf.category,
        region: etf.region,
        total_holdings: etf.total_holdings || 0,
        return_1y: etf.return_1y || 0,
        return_3y: etf.return_3y || 0,
        return_5y: etf.return_5y || 0,
        return_ytd: etf.return_ytd || 0,
        volatility_1y: etf.volatility_1y || 0,
        volatility_3y: etf.volatility_3y || 0,
        volatility_5y: etf.volatility_5y || 0,
        return_per_risk_1y: etf.return_per_risk_1y || 0,
        return_per_risk_3y: etf.return_per_risk_3y || 0,
        return_per_risk_5y: etf.return_per_risk_5y || 0,
        max_drawdown_1y: etf.max_drawdown_1y || 0,
        max_drawdown_3y: etf.max_drawdown_3y || 0,
        max_drawdown_5y: etf.max_drawdown_5y || 0,
        max_drawdown_inception: etf.max_drawdown_inception || 0,
        beta: etf.beta || 0,
        correlation: etf.correlation || 0,
        tracking_error: etf.tracking_error || 0,
        information_ratio: etf.information_ratio || 0,
        primary_exchange: etf.primary_exchange,
        primary_ticker: etf.primary_ticker,
        total_exchanges: etf.total_exchanges || 0,
        // Dividend fields that were missing
        current_dividend_yield: etf.current_dividend_yield,
        current_dividend_yield_numeric: etf.current_dividend_yield_numeric || 0,
        dividends_12m: etf.dividends_12m,
        dividends_12m_numeric: etf.dividends_12m_numeric || 0,
        dividends_12m_currency: etf.dividends_12m_currency,
        dividend_extraction_method: etf.dividend_extraction_method,
        scraping_date: etf.scraping_date,
        scraping_status: etf.scraping_status,
        retry_count: etf.retry_count || 0,
        degiro_free: etf.degiro_free || false,
        // Holdings
        holding_1_name: etf.holding_1_name,
        holding_1_weight: etf.holding_1_weight || 0,
        holding_2_name: etf.holding_2_name,
        holding_2_weight: etf.holding_2_weight || 0,
        holding_3_name: etf.holding_3_name,
        holding_3_weight: etf.holding_3_weight || 0,
        holding_4_name: etf.holding_4_name,
        holding_4_weight: etf.holding_4_weight || 0,
        holding_5_name: etf.holding_5_name,
        holding_5_weight: etf.holding_5_weight || 0,
        holding_6_name: etf.holding_6_name,
        holding_6_weight: etf.holding_6_weight || 0,
        holding_7_name: etf.holding_7_name,
        holding_7_weight: etf.holding_7_weight || 0,
        holding_8_name: etf.holding_8_name,
        holding_8_weight: etf.holding_8_weight || 0,
        holding_9_name: etf.holding_9_name,
        holding_9_weight: etf.holding_9_weight || 0,
        holding_10_name: etf.holding_10_name,
        holding_10_weight: etf.holding_10_weight || 0,
        // Countries
        country_1_name: etf.country_1_name,
        country_1_weight: etf.country_1_weight || 0,
        country_2_name: etf.country_2_name,
        country_2_weight: etf.country_2_weight || 0,
        country_3_name: etf.country_3_name,
        country_3_weight: etf.country_3_weight || 0,
        country_4_name: etf.country_4_name,
        country_4_weight: etf.country_4_weight || 0,
        country_5_name: etf.country_5_name,
        country_5_weight: etf.country_5_weight || 0,
        // Sectors
        sector_1_name: etf.sector_1_name,
        sector_1_weight: etf.sector_1_weight || 0,
        sector_2_name: etf.sector_2_name,
        sector_2_weight: etf.sector_2_weight || 0,
        sector_3_name: etf.sector_3_name,
        sector_3_weight: etf.sector_3_weight || 0,
        sector_4_name: etf.sector_4_name,
        sector_4_weight: etf.sector_4_weight || 0,
        sector_5_name: etf.sector_5_name,
        sector_5_weight: etf.sector_5_weight || 0,
        // Exchanges
        exchange_1_name: etf.exchange_1_name,
        exchange_1_currency: etf.exchange_1_currency,
        exchange_1_ticker: etf.exchange_1_ticker,
        exchange_1_bloomberg: etf.exchange_1_bloomberg,
        exchange_1_reuters: etf.exchange_1_reuters,
        exchange_1_market_maker: etf.exchange_1_market_maker,
        exchange_2_name: etf.exchange_2_name,
        exchange_2_currency: etf.exchange_2_currency,
        exchange_2_ticker: etf.exchange_2_ticker,
        exchange_2_bloomberg: etf.exchange_2_bloomberg,
        exchange_2_reuters: etf.exchange_2_reuters,
        exchange_2_market_maker: etf.exchange_2_market_maker,
        exchange_3_name: etf.exchange_3_name,
        exchange_3_currency: etf.exchange_3_currency,
        exchange_3_ticker: etf.exchange_3_ticker,
        exchange_3_bloomberg: etf.exchange_3_bloomberg,
        exchange_3_reuters: etf.exchange_3_reuters,
        exchange_3_market_maker: etf.exchange_3_market_maker,
        exchange_4_name: etf.exchange_4_name,
        exchange_4_currency: etf.exchange_4_currency,
        exchange_4_ticker: etf.exchange_4_ticker,
        exchange_4_bloomberg: etf.exchange_4_bloomberg,
        exchange_4_reuters: etf.exchange_4_reuters,
        exchange_4_market_maker: etf.exchange_4_market_maker,
        exchange_5_name: etf.exchange_5_name,
        exchange_5_currency: etf.exchange_5_currency,
        exchange_5_ticker: etf.exchange_5_ticker,
        exchange_5_bloomberg: etf.exchange_5_bloomberg,
        exchange_5_reuters: etf.exchange_5_reuters,
        exchange_5_market_maker: etf.exchange_5_market_maker,
      }));

      console.log('Sample transformed ETF dividend/region data:', transformedETFs[0] ? {
        name: transformedETFs[0].name,
        current_dividend_yield: transformedETFs[0].current_dividend_yield,
        current_dividend_yield_numeric: transformedETFs[0].current_dividend_yield_numeric,
        region: transformedETFs[0].region
      } : 'No data');

      // Use upsert to insert or update records
      const { data, error } = await supabase
        .from('etf_funds')
        .upsert(transformedETFs, { 
          onConflict: 'isin',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error upserting ETFs:', error);
        throw error;
      }

      console.log('Successfully upserted ETFs:', data);
      
      toast({
        title: "Data úspěšně uložena",
        description: `${etfs.length} ETF fondů bylo úspěšně uloženo do databáze.`,
      });

      return data;
    } catch (error) {
      console.error('Error in upsertETFs:', error);
      toast({
        title: "Chyba při ukládání",
        description: "Nepodařilo se uložit data do databáze.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { upsertETFs, isLoading };
};
