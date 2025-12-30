export interface CurrencyImpactParams {
  portfolioValue: number;
  allocations: {
    usd: number;
    eur: number;
    czk: number;
  };
  investmentHorizon: number;
  currentRates: {
    usdCzk: number;
    eurCzk: number;
  };
}

export interface CurrencyImpactData {
  currentExposure: {
    unhedgedUsd: number;
    unhedgedEur: number;
    czkAmount: number;
  };
  scenarios: CurrencyScenario[];
  riskMetrics: {
    portfolioVolatility: number;
    currencyVolatility: number;
    maxDrawdown: number;
    valueAtRisk: number;
  };
  historicalAnalysis: {
    worstCase: HistoricalPeriod;
    bestCase: HistoricalPeriod;
    averageImpact: number;
  };
}

export interface CurrencyScenario {
  name: string;
  description: string;
  usdCzkChange: number;
  eurCzkChange: number;
  probability: number;
  portfolioImpact: number;
  portfolioValueCzk: number;
}

export interface HistoricalPeriod {
  period: string;
  usdCzkImpact: number;
  eurCzkImpact: number;
  totalPortfolioImpact: number;
}

export const calculateCurrencyImpact = (params: CurrencyImpactParams): CurrencyImpactData => {
  const {
    portfolioValue,
    allocations,
    investmentHorizon,
    currentRates
  } = params;

  // Výpočet současné expozice - všechny zahraniční pozice jsou nezajištěné
  const usdValue = (portfolioValue * allocations.usd) / 100;
  const eurValue = (portfolioValue * allocations.eur) / 100;
  const czkValue = (portfolioValue * allocations.czk) / 100;

  // Veškerá zahraniční expozice je nezajištěná (žádný hedging)
  const unhedgedUsd = usdValue;
  const unhedgedEur = eurValue;

  // Definice reálnějších scénářů na základě historických dat
  const scenarios: CurrencyScenario[] = [
    {
      name: 'Oslabení CZK',
      description: 'CZK oslabí vůči USD o 12%, EUR o 8% (ekonomická nejistota)',
      usdCzkChange: 12,
      eurCzkChange: 8,
      probability: 20,
      portfolioImpact: 0,
      portfolioValueCzk: 0
    },
    {
      name: 'Posílení CZK',
      description: 'CZK posílí vůči USD o 8%, EUR o 5% (CNB intervence)',
      usdCzkChange: -8,
      eurCzkChange: -5,
      probability: 15,
      portfolioImpact: 0,
      portfolioValueCzk: 0
    },
    {
      name: 'Silný USD',
      description: 'USD posílí o 15%, EUR oslabí o 3% (Fed hawkish)',
      usdCzkChange: 15,
      eurCzkChange: -3,
      probability: 20,
      portfolioImpact: 0,
      portfolioValueCzk: 0
    },
    {
      name: 'Slabý USD',
      description: 'USD oslabí o 10%, EUR posílí o 4% (dovish Fed)',
      usdCzkChange: -10,
      eurCzkChange: 4,
      probability: 15,
      portfolioImpact: 0,
      portfolioValueCzk: 0
    },
    {
      name: 'Stabilita',
      description: 'Kurzy oscilují v úzkém pásmu ±3%',
      usdCzkChange: 0,
      eurCzkChange: 0,
      probability: 30,
      portfolioImpact: 0,
      portfolioValueCzk: 0
    }
  ];

  // Výpočet dopadů jednotlivých scénářů
  scenarios.forEach(scenario => {
    const newUsdCzk = currentRates.usdCzk * (1 + scenario.usdCzkChange / 100);
    const newEurCzk = currentRates.eurCzk * (1 + scenario.eurCzkChange / 100);

    // Dopad na nezajištěné pozice
    const usdImpact = unhedgedUsd * (scenario.usdCzkChange / 100);
    const eurImpact = unhedgedEur * (scenario.eurCzkChange / 100);
    
    const totalImpact = usdImpact + eurImpact;
    
    scenario.portfolioImpact = portfolioValue > 0 ? (totalImpact / portfolioValue) * 100 : 0;
    scenario.portfolioValueCzk = portfolioValue + totalImpact;
  });

  // Vylepšené rizikové metriky s reálnými volatilitami
  const currencyExposure = portfolioValue > 0 ? (unhedgedUsd + unhedgedEur) / portfolioValue : 0;
  
  // Historické volatility: CZK/USD ~12%, CZK/EUR ~8%, korelace ~0.6
  const usdVolatility = 0.12;
  const eurVolatility = 0.08;
  const correlation = 0.6;
  
  // Složená volatilita měnového rizika s korelací
  const usdWeight = unhedgedUsd / (unhedgedUsd + unhedgedEur + 0.001); // Avoid division by zero
  const eurWeight = unhedgedEur / (unhedgedUsd + unhedgedEur + 0.001);
  
  const currencyVolatility = Math.sqrt(
    Math.pow(usdWeight * usdVolatility, 2) + 
    Math.pow(eurWeight * eurVolatility, 2) + 
    2 * usdWeight * eurWeight * usdVolatility * eurVolatility * correlation
  );
  
  // Portfolio volatilita = měnová vol. * expozice + asset vol. * (1-expozice)
  const assetVolatility = 0.16; // Typická volatilita akcií
  const portfolioVolatility = (currencyVolatility * currencyExposure + assetVolatility * (1 - currencyExposure)) * 100;
  
  // Max drawdown na základě složené volatility
  const maxDrawdown = portfolioVolatility * 2.2;
  
  // 95% VaR = 1.65 * volatilita * portfolio value
  const valueAtRisk = portfolioValue * currencyVolatility * 1.65;

  // Vylepšená historická analýza založená na reálných datech
  const currentUnhedgedExposure = unhedgedUsd + unhedgedEur;
  const historicalAnalysis = {
    worstCase: {
      period: 'COVID-19 krize 2020 (březen)',
      usdCzkImpact: -22, // USD oslabil z 23 na 27 CZK
      eurCzkImpact: -15, // EUR oslabil z 25 na 28.5 CZK
      totalPortfolioImpact: (currentUnhedgedExposure > 0 && portfolioValue > 0) ? 
        (unhedgedUsd * -0.22 + unhedgedEur * -0.15) / portfolioValue * 100 : 0
    },
    bestCase: {
      period: 'CNB intervence 2017',
      usdCzkImpact: 18, // Ukončení oslabování, CZK posílila
      eurCzkImpact: 12,
      totalPortfolioImpact: (currentUnhedgedExposure > 0 && portfolioValue > 0) ? 
        (unhedgedUsd * 0.18 + unhedgedEur * 0.12) / portfolioValue * 100 : 0
    },
    averageImpact: currencyExposure * 100 * 0.08 // 8% roční volatilita na expozici
  };

  return {
    currentExposure: {
      unhedgedUsd,
      unhedgedEur,
      czkAmount: czkValue
    },
    scenarios,
    riskMetrics: {
      portfolioVolatility,
      currencyVolatility,
      maxDrawdown,
      valueAtRisk
    },
    historicalAnalysis
  };
};