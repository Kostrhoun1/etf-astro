/**
 * Portfolio Projection Engine
 * Calculates realistic investment growth scenarios based on historical data and Monte Carlo principles
 */

export interface ProjectionScenario {
  name: string;
  annualReturn: number;
  volatility: number;
  description: string;
}

export interface ProjectionInput {
  initialAmount: number;
  monthlyContribution: number;
  riskLevel: number;
  timeHorizonYears: number;
  portfolioType: string;
  expectedReturn?: number;
}

export interface ProjectionDataPoint {
  year: number;
  month: number;
  optimistic: number;
  realistic: number;
  pessimistic: number;
  contributions: number;
}

export interface ProjectionResult {
  scenarios: ProjectionScenario[];
  dataPoints: ProjectionDataPoint[];
  finalValues: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
    totalContributions: number;
  };
  averageAnnualReturns: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

// Realistické parametry založené na historických datech ETF a akademickém výzkumu
const portfolioParameters = {
  // Mladé portfolio (80-90% akcie)
  aggressive: {
    expectedReturn: 0.085,    // 8.5% ročně (historický průměr světových akcií)
    volatility: 0.18,         // 18% volatilita
    minReturn: -0.35,         // Nejhorší možný rok (-35%)
    maxReturn: 0.35           // Nejlepší možný rok (+35%)
  },
  // Vyvážené portfolio (60-70% akcie)
  moderate: {
    expectedReturn: 0.07,     // 7% ročně
    volatility: 0.14,         // 14% volatilita
    minReturn: -0.25,         // Nejhorší možný rok (-25%)
    maxReturn: 0.28           // Nejlepší možný rok (+28%)
  },
  // Konzervativní portfolio (40-50% akcie)
  conservative: {
    expectedReturn: 0.055,    // 5.5% ročně
    volatility: 0.10,         // 10% volatilita
    minReturn: -0.15,         // Nejhorší možný rok (-15%)
    maxReturn: 0.20           // Nejlepší možný rok (+20%)
  }
};

function getPortfolioType(riskLevel: number): keyof typeof portfolioParameters {
  if (riskLevel >= 7) return 'aggressive';
  if (riskLevel >= 5) return 'moderate';
  return 'conservative';
}

function getScenarios(riskLevel: number, expectedReturn?: number): ProjectionScenario[] {
  const type = getPortfolioType(riskLevel);
  const params = portfolioParameters[type];
  
  // Použij skutečný očekávaný výnos pokud je k dispozici, jinak fallback na obecný
  const baseReturn = expectedReturn ? expectedReturn / 100 : params.expectedReturn;
  
  return [
    {
      name: 'Pesimistický',
      annualReturn: Math.max(0.005, baseReturn - params.volatility), // Minimálně 0.5% ročně
      volatility: params.volatility * 1.5,
      description: 'Dlouhodobá stagnace trhů, četnější krize'
    },
    {
      name: 'Realistický',
      annualReturn: baseReturn,
      volatility: params.volatility,
      description: 'Průměrný vývoj na základě historických dat'
    },
    {
      name: 'Optimistický',
      annualReturn: baseReturn + params.volatility * 0.5,
      volatility: params.volatility * 0.8,
      description: 'Příznivý vývoj trhů s menšími výkyvy'
    }
  ];
}

/**
 * Simuluje růst portfolia s měsíčními příspěvky a volatilitou
 * Používá složené úročení s random walk pro realistickou volatilitu
 */
function simulateGrowth(
  initialAmount: number,
  monthlyContribution: number,
  annualReturn: number,
  volatility: number,
  years: number,
  scenario: 'optimistic' | 'realistic' | 'pessimistic'
): ProjectionDataPoint[] {
  const months = years * 12;
  const monthlyReturn = annualReturn / 12;
  const monthlyVolatility = volatility / Math.sqrt(12);
  
  const dataPoints: ProjectionDataPoint[] = [];
  let portfolioValue = initialAmount;
  let totalContributions = initialAmount;
  
  // Nastavení volatility podle scénáře
  const volatilityMultiplier = scenario === 'pessimistic' ? 1.3 : 
                              scenario === 'optimistic' ? 0.7 : 1.0;
  
  for (let month = 0; month <= months; month++) {
    const year = Math.floor(month / 12);
    const monthInYear = month % 12;
    
    if (month === 0) {
      // Počáteční stav
      dataPoints.push({
        year,
        month: monthInYear,
        optimistic: scenario === 'optimistic' ? portfolioValue : 0,
        realistic: scenario === 'realistic' ? portfolioValue : 0,
        pessimistic: scenario === 'pessimistic' ? portfolioValue : 0,
        contributions: totalContributions
      });
      continue;
    }
    
    // Přidání měsíčního příspěvku
    portfolioValue += monthlyContribution;
    totalContributions += monthlyContribution;
    
    // Simulace výnosu s volatilitou (Geometric Brownian Motion)
    const randomFactor = scenario === 'realistic' ? 
      (Math.random() - 0.5) * 2 * monthlyVolatility * volatilityMultiplier :
      0; // Pro optimistický/pesimistický bez náhodnosti
    
    const monthReturn = monthlyReturn + randomFactor;
    portfolioValue *= (1 + monthReturn);
    
    // Ochrana proti extrémním hodnotám
    const maxGrowth = totalContributions * (scenario === 'optimistic' ? 4 : 
                                          scenario === 'realistic' ? 3 : 2);
    const minValue = totalContributions * 0.3; // Minimálně 30% příspěvků
    
    portfolioValue = Math.min(portfolioValue, maxGrowth);
    portfolioValue = Math.max(portfolioValue, minValue);
    
    // Uložení dat každý 3. měsíc pro lepší výkon
    if (month % 3 === 0 || month === months) {
      const existingPoint = dataPoints.find(p => p.year === year && p.month === monthInYear);
      if (existingPoint) {
        if (scenario === 'optimistic') existingPoint.optimistic = portfolioValue;
        if (scenario === 'realistic') existingPoint.realistic = portfolioValue;
        if (scenario === 'pessimistic') existingPoint.pessimistic = portfolioValue;
        existingPoint.contributions = totalContributions;
      } else {
        dataPoints.push({
          year,
          month: monthInYear,
          optimistic: scenario === 'optimistic' ? portfolioValue : 0,
          realistic: scenario === 'realistic' ? portfolioValue : 0,
          pessimistic: scenario === 'pessimistic' ? portfolioValue : 0,
          contributions: totalContributions
        });
      }
    }
  }
  
  return dataPoints;
}

/**
 * Hlavní funkce pro výpočet projekcí portfolia
 */
export function calculatePortfolioProjection(input: ProjectionInput): ProjectionResult {
  const scenarios = getScenarios(input.riskLevel, input.expectedReturn);
  
  // Simulace všech tří scénářů
  const optimisticData = simulateGrowth(
    input.initialAmount,
    input.monthlyContribution,
    scenarios[2].annualReturn, // Optimistický
    scenarios[2].volatility,
    input.timeHorizonYears,
    'optimistic'
  );
  
  const realisticData = simulateGrowth(
    input.initialAmount,
    input.monthlyContribution,
    scenarios[1].annualReturn, // Realistický
    scenarios[1].volatility,
    input.timeHorizonYears,
    'realistic'
  );
  
  const pessimisticData = simulateGrowth(
    input.initialAmount,
    input.monthlyContribution,
    scenarios[0].annualReturn, // Pesimistický
    scenarios[0].volatility,
    input.timeHorizonYears,
    'pessimistic'
  );
  
  // Sloučení dat do jednoho datasetu
  const combinedData: ProjectionDataPoint[] = [];
  const maxLength = Math.max(optimisticData.length, realisticData.length, pessimisticData.length);
  
  for (let i = 0; i < maxLength; i++) {
    const opt = optimisticData[i];
    const real = realisticData[i];
    const pess = pessimisticData[i];
    
    combinedData.push({
      year: opt?.year || real?.year || pess?.year || 0,
      month: opt?.month || real?.month || pess?.month || 0,
      optimistic: opt?.optimistic || 0,
      realistic: real?.realistic || 0,
      pessimistic: pess?.pessimistic || 0,
      contributions: opt?.contributions || real?.contributions || pess?.contributions || 0
    });
  }
  
  const totalContributions = input.initialAmount + (input.monthlyContribution * input.timeHorizonYears * 12);
  const lastPoint = combinedData[combinedData.length - 1];
  
  return {
    scenarios,
    dataPoints: combinedData,
    finalValues: {
      optimistic: lastPoint.optimistic,
      realistic: lastPoint.realistic,
      pessimistic: lastPoint.pessimistic,
      totalContributions
    },
    averageAnnualReturns: {
      optimistic: scenarios[2].annualReturn,
      realistic: scenarios[1].annualReturn,
      pessimistic: scenarios[0].annualReturn
    }
  };
}

/**
 * Utility funkce pro formátování měny
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Utility funkce pro formátování procent
 */
export function formatPercentage(value: number): string {
  return (value * 100).toFixed(1) + '%';
}