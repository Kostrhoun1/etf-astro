'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface ETFTemplate {
  isin: string;
  [key: string]: any;
}

export const useETFArticleData = (etfTemplate: ETFTemplate[]) => {
  const [etfsWithData, setEtfsWithData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadETFData = async () => {
      setIsLoading(true);
      try {
        // Načti data z databáze podle ISIN
        const isins = etfTemplate.map(etf => etf.isin);
        const { data: etfData, error } = await supabase
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
            fund_size,
            primary_ticker,
            current_dividend_yield_numeric
          `)
          .in('isin', isins);

        if (error) {
          console.error("Chyba při načítání ETF dat:", error);
          setEtfsWithData(etfTemplate.map(etf => ({ ...etf, isLoading: false })));
          return;
        }

        // Spojí template data s databázovými daty
        const enrichedETFs = etfTemplate.map(templateETF => {
          const dbETF = etfData?.find(d => d.isin === templateETF.isin);
          if (dbETF) {
            return {
              ...templateETF,
              ter: dbETF.ter_numeric ? `${dbETF.ter_numeric}%` : 'N/A',
              size: dbETF.fund_size || 'N/A',
              companies: getCompanyCount(templateETF.type || templateETF.index),
              historicalReturn: getHistoricalReturn(dbETF),
              dividendYield: dbETF.current_dividend_yield_numeric ? `${dbETF.current_dividend_yield_numeric}%` : templateETF.dividendYield || 'N/A',
              isLoading: false
            };
          }
          return { ...templateETF, isLoading: false };
        });

        setEtfsWithData(enrichedETFs);
      } catch (error) {
        console.error("Chyba při načítání dat:", error);
        setEtfsWithData(etfTemplate.map(etf => ({ ...etf, isLoading: false })));
      } finally {
        setIsLoading(false);
      }
    };

    loadETFData();
  }, [etfTemplate]);

  return { etfsWithData, isLoading };
};

const getCompanyCount = (type: string): string => {
  const typeMap: Record<string, string> = {
    'S&P 500': '500',
    'NASDAQ 100': '100',
    'Celý trh USA': '630+',
    'Dividendové': '65',
    'Technologie': '160+',
    'Rozvíjející se trhy': '1,400+',
    'Evropské akcie': '600+',
    'Globální akcie': '1,500+',
    'Dividend Aristocrats': '65',
    'High Dividend Yield': '1,700+',
    'High Dividend': '100',
    'Euro Dividend': '30',
    'Global Dividend': '100',
  };
  return typeMap[type] || 'N/A';
};

const getHistoricalReturn = (etf: any): string => {
  if (etf.return_1y) return `${etf.return_1y}% (1 rok)`;
  if (etf.return_ytd) return `${etf.return_ytd}% (YTD)`;
  return 'N/A';
};