
export interface ETF {
  isin: string;
  name: string;
  url: string;
  description_en: string;
  description_cs: string;
  updated_at?: string;
  created_at?: string;
  ter: string;
  ter_numeric: number;
  fund_size: string;
  fund_size_numeric: number;
  fund_size_currency: string;
  fund_currency: string;
  fund_domicile: string;
  fund_provider: string;
  inception_date: string;
  distribution_policy: string;
  distribution_frequency: string;
  replication: string;
  legal_structure: string;
  index_name: string;
  investment_focus: string;
  currency_risk?: string;
  strategy_risk?: string;
  parsed_asset_class?: string;
  parsed_region?: string;
  parsed_sector?: string;
  parsed_market_cap?: string;
  parsed_investment_style?: string;
  sustainability: string;
  category: string;
  is_leveraged: boolean;
  region: string;
  total_holdings: number;
  return_1y: number;
  return_3y: number;
  return_5y: number;
  return_ytd: number;
  volatility_1y: number;
  volatility_3y: number;
  volatility_5y: number;
  return_per_risk_1y: number;
  return_per_risk_3y: number;
  return_per_risk_5y: number;
  max_drawdown_1y: number;
  max_drawdown_3y: number;
  max_drawdown_5y: number;
  max_drawdown_inception: number;
  beta: number;
  correlation: number;
  tracking_error: number;
  information_ratio: number;
  primary_exchange: string;
  primary_ticker: string;
  total_exchanges: number;
  // Dividend fields that were missing
  current_dividend_yield: string;
  current_dividend_yield_numeric: number;
  dividends_12m: string;
  dividends_12m_numeric: number;
  dividends_12m_currency: string;
  dividend_extraction_method: string;
  scraping_date: string;
  scraping_status: string;
  retry_count: number;
  degiro_free: boolean;
  // Holdings (top 10)
  holding_1_name: string;
  holding_1_weight: number;
  holding_2_name: string;
  holding_2_weight: number;
  holding_3_name: string;
  holding_3_weight: number;
  holding_4_name: string;
  holding_4_weight: number;
  holding_5_name: string;
  holding_5_weight: number;
  holding_6_name: string;
  holding_6_weight: number;
  holding_7_name: string;
  holding_7_weight: number;
  holding_8_name: string;
  holding_8_weight: number;
  holding_9_name: string;
  holding_9_weight: number;
  holding_10_name: string;
  holding_10_weight: number;
  // Countries (top 5)
  country_1_name: string;
  country_1_weight: number;
  country_2_name: string;
  country_2_weight: number;
  country_3_name: string;
  country_3_weight: number;
  country_4_name: string;
  country_4_weight: number;
  country_5_name: string;
  country_5_weight: number;
  // Sectors (top 5)
  sector_1_name: string;
  sector_1_weight: number;
  sector_2_name: string;
  sector_2_weight: number;
  sector_3_name: string;
  sector_3_weight: number;
  sector_4_name: string;
  sector_4_weight: number;
  sector_5_name: string;
  sector_5_weight: number;
  // Exchanges (up to 10 - ROZŠÍŘENO)
  exchange_1_name: string;
  exchange_1_currency: string;
  exchange_1_ticker: string;
  exchange_1_bloomberg: string;
  exchange_1_reuters: string;
  exchange_1_market_maker: string;
  exchange_2_name: string;
  exchange_2_currency: string;
  exchange_2_ticker: string;
  exchange_2_bloomberg: string;
  exchange_2_reuters: string;
  exchange_2_market_maker: string;
  exchange_3_name: string;
  exchange_3_currency: string;
  exchange_3_ticker: string;
  exchange_3_bloomberg: string;
  exchange_3_reuters: string;
  exchange_3_market_maker: string;
  exchange_4_name: string;
  exchange_4_currency: string;
  exchange_4_ticker: string;
  exchange_4_bloomberg: string;
  exchange_4_reuters: string;
  exchange_4_market_maker: string;
  exchange_5_name: string;
  exchange_5_currency: string;
  exchange_5_ticker: string;
  exchange_5_bloomberg: string;
  exchange_5_reuters: string;
  exchange_5_market_maker: string;
  // NOVÁ POLE exchanges 6-10
  exchange_6_name: string;
  exchange_6_currency: string;
  exchange_6_ticker: string;
  exchange_6_bloomberg: string;
  exchange_6_reuters: string;
  exchange_6_market_maker: string;
  exchange_7_name: string;
  exchange_7_currency: string;
  exchange_7_ticker: string;
  exchange_7_bloomberg: string;
  exchange_7_reuters: string;
  exchange_7_market_maker: string;
  exchange_8_name: string;
  exchange_8_currency: string;
  exchange_8_ticker: string;
  exchange_8_bloomberg: string;
  exchange_8_reuters: string;
  exchange_8_market_maker: string;
  exchange_9_name: string;
  exchange_9_currency: string;
  exchange_9_ticker: string;
  exchange_9_bloomberg: string;
  exchange_9_reuters: string;
  exchange_9_market_maker: string;
  exchange_10_name: string;
  exchange_10_currency: string;
  exchange_10_ticker: string;
  exchange_10_bloomberg: string;
  exchange_10_reuters: string;
  exchange_10_market_maker: string;
  // Rating fields from database
  rating?: number;
  rating_score?: number;
  // Rating component scores
  rating_ter_score?: number;
  rating_size_score?: number;
  rating_track_record_score?: number;
  rating_provider_score?: number;
  rating_performance_score?: number;
  // New performance periods
  return_1m?: number;
  return_3m?: number;
  return_6m?: number;
  return_2024?: number;
  return_2023?: number;
  return_2022?: number;
  return_2021?: number;
  return_inception?: number;
  performance_last_updated?: string;
  
  // Currency Performance - CZK
  return_1m_czk?: number;
  return_3m_czk?: number;
  return_6m_czk?: number;
  return_ytd_czk?: number;
  return_1y_czk?: number;
  return_3y_czk?: number;
  return_5y_czk?: number;
  return_2021_czk?: number;
  return_2022_czk?: number;
  return_2023_czk?: number;
  return_2024_czk?: number;
  
  // Currency Performance - USD
  return_1m_usd?: number;
  return_3m_usd?: number;
  return_6m_usd?: number;
  return_ytd_usd?: number;
  return_1y_usd?: number;
  return_3y_usd?: number;
  return_5y_usd?: number;
  return_2021_usd?: number;
  return_2022_usd?: number;
  return_2023_usd?: number;
  return_2024_usd?: number;
  
  // Currency Metadata
  currency_performance_updated_at?: string;
}

// Simplified ETF type for list displays
export interface ETFListItem {
  isin: string;
  name: string;
  fund_provider: string;
  category: string;
  is_leveraged: boolean;
  ter_numeric: number;
  return_1y: number;
  return_3y: number;
  return_5y: number;
  return_ytd: number;
  fund_size_numeric: number;
  degiro_free: boolean;
  primary_ticker?: string;
  ticker?: string; // Alias pro primary_ticker pro kompatibilitu
  distribution_policy: string;
  index_name: string;
  fund_currency: string;
  replication: string;
  region: string;
  current_dividend_yield_numeric?: number;
  // Pole potřebná pro konzistentní rating
  inception_date?: string;
  tracking_error?: number;
  // Přidání všech ticker polí pro rozšířené vyhledávání (až 10 exchanges)
  exchange_1_ticker?: string;
  exchange_2_ticker?: string;
  exchange_3_ticker?: string;
  exchange_4_ticker?: string;
  exchange_5_ticker?: string;
  exchange_6_ticker?: string;
  exchange_7_ticker?: string;
  exchange_8_ticker?: string;
  exchange_9_ticker?: string;
  exchange_10_ticker?: string;
  // Rating z databáze
  rating?: number;
  rating_score?: number;
  // Rating component scores
  rating_ter_score?: number;
  rating_size_score?: number;
  rating_track_record_score?: number;
  rating_provider_score?: number;
  rating_performance_score?: number;
  // New performance periods
  return_1m?: number;
  return_3m?: number;
  return_6m?: number;
  return_2024?: number;
  return_2023?: number;
  return_2022?: number;
  return_2021?: number;
  return_inception?: number;
  performance_last_updated?: string;
  
  // Currency Performance - CZK
  return_1m_czk?: number;
  return_3m_czk?: number;
  return_6m_czk?: number;
  return_ytd_czk?: number;
  return_1y_czk?: number;
  return_3y_czk?: number;
  return_5y_czk?: number;
  return_2021_czk?: number;
  return_2022_czk?: number;
  return_2023_czk?: number;
  return_2024_czk?: number;
  
  // Currency Performance - USD
  return_1m_usd?: number;
  return_3m_usd?: number;
  return_6m_usd?: number;
  return_ytd_usd?: number;
  return_1y_usd?: number;
  return_3y_usd?: number;
  return_5y_usd?: number;
  return_2021_usd?: number;
  return_2022_usd?: number;
  return_2023_usd?: number;
  return_2024_usd?: number;
  
  // Currency Metadata
  currency_performance_updated_at?: string;
}
