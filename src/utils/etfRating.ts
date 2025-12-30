import type { ETF, ETFListItem } from '../types/etf';

/**
 * Calculates ETF rating based on objective criteria from database data
 * Rating scale: 1-5 stars (only awarded to ETFs with minimum 3 years of track record)
 * 
 * Criteria (exactly 100 points total):
 * - TER (Total Expense Ratio): 0-30 points - Lower is better (most important)
 * - Fund Size: 0-25 points - Larger is better (stability/liquidity)
 * - Track Record: 0-15 points - Longer history is better  
 * - Fund Provider: 0-10 points - Top providers get bonus
 * - Performance: 0-20 points - Risk-adjusted returns and consistency
 * (Tracking quality removed - data not available for most ETFs)
 */

export interface ETFRating {
  rating: number; // 1-5 stars
  score: number; // Raw score (0-100)
  breakdown: {
    ter: number;
    fundSize: number;
    trackRecord: number;
    provider: number;
    performance: number;
    tracking: number;
  };
  category: 'excellent' | 'very-good' | 'good' | 'average' | 'poor';
}

// Top-tier fund providers (get bonus points)
const TOP_PROVIDERS = [
  'iShares', 'Vanguard', 'Xtrackers', 'Amundi', 'SPDR', 'Invesco'
];

// Calculate years since inception
function getYearsSinceInception(inceptionDate: string): number {
  if (!inceptionDate) return 0;
  const inception = new Date(inceptionDate);
  const now = new Date();
  return (now.getTime() - inception.getTime()) / (1000 * 60 * 60 * 24 * 365);
}

// Score TER (0-30 points): Lower TER is better - most important factor
function scoreTER(ter: number): number {
  if (ter <= 0.05) return 30; // <= 0.05% = Excellent
  if (ter <= 0.10) return 26; // <= 0.10% = Very Good  
  if (ter <= 0.15) return 22; // <= 0.15% = Good
  if (ter <= 0.25) return 17; // <= 0.25% = Above Average
  if (ter <= 0.50) return 12; // <= 0.50% = Average
  if (ter <= 0.75) return 6;  // <= 0.75% = Below Average
  return 1; // > 0.75% = Poor
}

// Score Fund Size (0-25 points): Larger funds are more stable - expanded for 100-point scale
function scoreFundSize(sizeInBillion: number): number {
  if (sizeInBillion >= 50) return 25;    // >= 50B = Excellent
  if (sizeInBillion >= 20) return 22;    // >= 20B = Very Good
  if (sizeInBillion >= 10) return 19;    // >= 10B = Good
  if (sizeInBillion >= 5) return 16;     // >= 5B = Above Average
  if (sizeInBillion >= 1) return 13;     // >= 1B = Average
  if (sizeInBillion >= 0.5) return 10;   // >= 500M = Below Average
  if (sizeInBillion >= 0.1) return 5;    // >= 100M = Poor
  return 1; // < 100M = Very Poor
}

// Score Track Record (0-15 points): Longer history is better
function scoreTrackRecord(years: number): number {
  if (years >= 15) return 15;  // >= 15 years = Excellent
  if (years >= 10) return 13;  // >= 10 years = Very Good
  if (years >= 7) return 11;   // >= 7 years = Good
  if (years >= 5) return 9;    // >= 5 years = Above Average
  if (years >= 3) return 6;    // >= 3 years = Average
  if (years >= 1) return 3;    // >= 1 year = Below Average
  return 1; // < 1 year = Poor
}

// Score Fund Provider (0-10 points): Top providers get bonus
function scoreProvider(provider: string): number {
  if (!provider) return 5;
  
  const normalizedProvider = provider.toLowerCase();
  
  // Check for top providers (case insensitive)
  for (const topProvider of TOP_PROVIDERS) {
    if (normalizedProvider.includes(topProvider.toLowerCase())) {
      return 10; // Top provider bonus
    }
  }
  
  return 5; // Standard provider
}

// Score Performance (0-20 points): Risk-adjusted returns and consistency - expanded for 100-point scale
function scorePerformance(etf: ETF | ETFListItem): number {
  const return3y = 'return_3y' in etf ? etf.return_3y : 0;
  const returnPerRisk3y = 'return_per_risk_3y' in etf ? (etf as ETF).return_per_risk_3y : null;
  
  let score = 8; // Base score
  
  // Bonus for good 3-year returns (convert from decimal to percentage for comparison)
  const return3yPct = return3y && return3y < 1 ? return3y * 100 : return3y;
  
  if (return3yPct > 15) score += 9;      // > 15% = Excellent
  else if (return3yPct > 10) score += 7; // > 10% = Very Good
  else if (return3yPct > 7) score += 5;  // > 7% = Good
  else if (return3yPct > 5) score += 3;  // > 5% = Average
  else if (return3yPct > 0) score += 1;  // > 0% = Positive
  
  // Bonus for good risk-adjusted returns - but only if data exists
  // Since 99.9% of ETFs have no return_per_risk_3y data, we give smaller bonus
  if (returnPerRisk3y && returnPerRisk3y > 0.5) score += 3;
  else if (returnPerRisk3y && returnPerRisk3y > 0.3) score += 2;
  else if (returnPerRisk3y && returnPerRisk3y > 0.1) score += 1;
  
  return Math.min(score, 20);
}

// REMOVED: score_tracking - tracking error not available for most ETFs

// Convert total score to star rating - adjusted based on actual distribution
function scoreToStars(score: number): number {
  if (score >= 75) return 5;      // 75+ = 5 stars (Excellent) - was 85+
  if (score >= 65) return 4;      // 65-74 = 4 stars (Very Good) - was 70-84
  if (score >= 50) return 3;      // 50-64 = 3 stars (Good) - was 55-69
  if (score >= 35) return 2;      // 35-49 = 2 stars (Average) - was 40-54
  return 1;                       // < 35 = 1 star (Poor) - was < 40
}

// Get category from score
function getCategory(score: number): ETFRating['category'] {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'very-good';
  if (score >= 55) return 'good';
  if (score >= 40) return 'average';
  return 'poor';
}

/**
 * Calculate comprehensive ETF rating based on database data
 * Rating is only awarded to ETFs with minimum 3 years of track record
 */
export function calculateETFRating(etf: ETF | ETFListItem): ETFRating | null {
  // Handle missing or invalid data gracefully
  const ter = etf.ter_numeric || 0;
  const fundSizeNumeric = etf.fund_size_numeric || 0;
  // Database already stores values in millions EUR, so convert to billions
  const fundSizeInBillion = fundSizeNumeric / 1_000;
  const provider = etf.fund_provider || '';
  const inceptionDate = 'inception_date' in etf ? etf.inception_date : '';
  const trackingError = 'tracking_error' in etf ? (etf as ETF).tracking_error : 0;
  
  const years = getYearsSinceInception(inceptionDate);
  
  // Minimum age requirement: 3 years for rating (same as backend)
  if (years < 3.0) {
    return null; // No rating for young funds
  }
  
  // Calculate individual scores
  const terScore = scoreTER(ter);
  const sizeScore = scoreFundSize(fundSizeInBillion);
  const trackRecordScore = scoreTrackRecord(years);
  const providerScore = scoreProvider(provider);
  const performanceScore = scorePerformance(etf);
  // tracking_score removed - data not available for most ETFs
  
  // Total score (exactly 100) - TER:30 + Size:25 + Track Record:15 + Provider:10 + Performance:20 = 100
  const totalScore = terScore + sizeScore + trackRecordScore + providerScore + performanceScore;
  
  return {
    rating: scoreToStars(totalScore),
    score: totalScore,
    breakdown: {
      ter: terScore,
      fundSize: sizeScore,
      trackRecord: trackRecordScore,
      provider: providerScore,
      performance: performanceScore,
      tracking: 0 // Default tracking score since data is not available
    },
    category: getCategory(totalScore)
  };
}

/**
 * Get star rating only (for simple displays)
 */
export function getETFStarRating(etf: ETF | ETFListItem): number | null {
  const rating = calculateETFRating(etf);
  return rating ? rating.rating : null;
}

/**
 * Get rating category description
 */
export function getRatingDescription(rating: number): string {
  switch (rating) {
    case 5: return 'Vynikající - TOP volba pro portfolia';
    case 4: return 'Velmi dobrý - Kvalitní fond s dobrými parametry';
    case 3: return 'Dobrý - Solidní volba s mírnými kompromisy';
    case 2: return 'Průměrný - Vhodný pro specifické potřeby';
    case 1: return 'Slabý - Zvážit alternativy';
    default: return 'Nehodnoceno';
  }
}

/**
 * Get color class for rating display
 */
export function getRatingColor(rating: number): string {
  switch (rating) {
    case 5: return 'text-green-600';
    case 4: return 'text-blue-600';
    case 3: return 'text-yellow-600';
    case 2: return 'text-orange-600';
    case 1: return 'text-red-600';
    default: return 'text-gray-400';
  }
}