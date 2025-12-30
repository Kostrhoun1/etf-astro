export interface Broker {
  id: string;
  name: string;
  logo: string;
  description: string;
  rating: number;
  regulation: string;
  protection: string;
  etfFee: string;
  managementFee: string;
  fxFee: string;
  fractional: boolean;
  czSupport: boolean;
  czDividends: string;
  minDeposit: string;
  platforms: string[];
  markets: string[];
  etfCount: string;
  languages: string[];
  customerSupport: string;
  specialFeatures: string[];
  pros: string[];
  cons: string[];
}

export interface BrokerFeature {
  id: string;
  name: string;
  description?: string;
  is_available: boolean;
}

export interface BrokerFees {
  etf_transaction_fee?: number;
  stock_transaction_fee?: number;
  monthly_fee?: number;
  custody_fee?: number;
  currency_conversion_fee?: number;
  inactivity_fee?: number;
  withdrawal_fee?: number;
  deposit_fee?: number;
  free_etf_transactions?: number;
  free_stock_transactions?: number;
}

export interface BrokerComparison {
  brokers: Broker[];
  comparison_criteria: ComparisonCriterion[];
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  category: string;
  weight?: number;
  description?: string;
}

export interface BrokerReview {
  id: string;
  broker_id: string;
  user_name?: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BrokerAnalysis {
  broker: Broker;
  score: number;
  strengths: string[];
  weaknesses: string[];
  best_for: string[];
  alternatives: Broker[];
}

// Enums
export enum BrokerType {
  DISCOUNT = 'discount',
  FULL_SERVICE = 'full_service',
  ROBO_ADVISOR = 'robo_advisor',
  CRYPTO = 'crypto',
  CFD = 'cfd'
}

export enum BrokerRegulation {
  ESMA = 'ESMA',
  FCA = 'FCA',
  BAFIN = 'BAFIN',
  CNB = 'CNB',
  CYPRUS_CySEC = 'CySEC',
  SEC = 'SEC',
  FINRA = 'FINRA'
}

export enum BrokerCategory {
  STOCKS = 'stocks',
  ETF = 'etf',
  OPTIONS = 'options',
  FUTURES = 'futures',
  FOREX = 'forex',
  CRYPTO = 'crypto',
  BONDS = 'bonds',
  COMMODITIES = 'commodities'
}

export interface ComparisonRow {
  feature: string;
  degiro: string;
  xtb: string;
  fio: string;
  trading212: string;
  ibkr: string;
  portu: string;
}