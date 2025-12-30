import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ETFLiveData {
  isin: string;
  name: string;
  ter_numeric: number | null;
  fund_size_numeric: number | null;
  return_1y: number | null;
  return_3y: number | null;
  return_5y: number | null;
  return_ytd: number | null;
  return_1y_czk: number | null;
  return_3y_czk: number | null;
  return_5y_czk: number | null;
  return_ytd_czk: number | null;
  return_1y_usd: number | null;
  return_3y_usd: number | null;
  return_5y_usd: number | null;
  return_ytd_usd: number | null;
  current_dividend_yield_numeric: number | null;
  rating: number | null;
  rating_score: number | null;
  fund_provider: string | null;
  primary_ticker: string | null;
  degiro_free: boolean | null;
}

interface ETFTemplate {
  isin: string;
  ticker: string;
  name: string;
  provider: string;
  reason: string;
  degiroFree: boolean;
}

export const useETFLiveData = (etfTemplates?: ETFTemplate[]) => {
  const [liveData, setLiveData] = useState<ETFLiveData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLiveData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const isins = etfTemplates?.map(etf => etf.isin) || [];
        
        console.log(`🔄 Loading live data for ISINs:`, isins);
        
        const { data, error } = await supabase
          .from('etf_funds')
          .select(`
            isin,
            name,
            ter_numeric,
            fund_size_numeric,
            return_1y,
            return_3y,
            return_5y,
            return_ytd,
            return_1y_czk,
            return_3y_czk,
            return_5y_czk,
            return_ytd_czk,
            return_1y_usd,
            return_3y_usd,
            return_5y_usd,
            return_ytd_usd,
            current_dividend_yield_numeric,
            rating,
            rating_score,
            fund_provider,
            primary_ticker,
            degiro_free
          `)
          .in('isin', isins);

        if (error) {
          console.error('❌ Error loading live ETF data:', error);
          setError(`Chyba při načítání dat: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ No live data found for provided ISINs');
          setLiveData([]);
          return;
        }

        console.log(`✅ Loaded live data for ${data.length} ETFs`);
        setLiveData(data as ETFLiveData[]);
        
      } catch (err) {
        console.error('❌ Unexpected error loading live data:', err);
        setError(`Neočekávaná chyba: ${err instanceof Error ? err.message : 'Neznámá chyba'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (etfTemplates && etfTemplates.length > 0) {
      loadLiveData();
    }
  }, [etfTemplates]);

  // Merge template data with live data
  const mergedData = etfTemplates?.map(template => {
    const liveETF = liveData.find(live => live.isin === template.isin);
    
    return {
      // Template data (editorial choice)
      isin: template.isin,
      ticker: template.ticker,
      provider: template.provider,
      reason: template.reason,
      degiroFree: template.degiroFree,
      
      // Live data from database (always current)
      name: liveETF?.name || template.name,
      ter: liveETF?.ter_numeric || null,
      fundSize: liveETF?.fund_size_numeric || null,
      return1Y: liveETF?.return_1y || null,
      return3Y: liveETF?.return_3y || null,
      return5Y: liveETF?.return_5y || null,
      returnYTD: liveETF?.return_ytd || null,
      return1Y_czk: liveETF?.return_1y_czk || null,
      return3Y_czk: liveETF?.return_3y_czk || null,
      return5Y_czk: liveETF?.return_5y_czk || null,
      returnYTD_czk: liveETF?.return_ytd_czk || null,
      return1Y_usd: liveETF?.return_1y_usd || null,
      return3Y_usd: liveETF?.return_3y_usd || null,
      return5Y_usd: liveETF?.return_5y_usd || null,
      returnYTD_usd: liveETF?.return_ytd_usd || null,
      dividendYield: liveETF?.current_dividend_yield_numeric || null,
      rating: liveETF?.rating || null,
      ratingScore: liveETF?.rating_score || null,
      
      // Flags
      hasLiveData: !!liveETF,
    };
  });

  return {
    etfs: mergedData || [],
    isLoading,
    error,
    totalETFs: etfTemplates?.length || 0,
    etfsWithData: liveData.length
  };
};