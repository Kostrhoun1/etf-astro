export type AssetClass =
  | "us_large"
  | "us_small"
  | "emerging"
  | "intl_dev"
  | "canada"
  | "reits"
  | "us_high_yield"
  | "us_quality_bond"
  | "intl_bond"
  | "gold"
  | "cash";

export interface AssetAllocation {
  us_large: number;
  us_small: number;
  emerging: number;
  intl_dev: number;
  canada: number;
  reits: number;
  us_high_yield: number;
  us_quality_bond: number;
  intl_bond: number;
  gold: number;
  cash: number;
}

export interface SimulationParameters {
  allocation: AssetAllocation;
  initialInvestment: number;
  monthlyContribution: number;
  years: number;
  simulations: number;
}

export interface SimulationResult {
  year: number;
  percentile5: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile95: number;
  mean: number;
}