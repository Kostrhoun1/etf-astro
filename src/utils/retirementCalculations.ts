export interface FireCalculationParams {
  currentAge: number;
  currentSavings: number;
  monthlySavings: number;
  monthlyExpensesInFire: number;
  inflationRate: number;
  investmentStrategy: 'conservative' | 'moderate' | 'aggressive';
}

export interface FireScenario {
  name: string;
  probability: number;
  fireAge: number | null; // null if never achieved within 50 years
  fireAmount: number;
  yearsToFire: number | null;
  projectionData: FireProjection[];
}

export interface FireData {
  scenarios: {
    optimistic: FireScenario;
    realistic: FireScenario;
    pessimistic: FireScenario;
  };
  fireTarget: number; // 25x annual expenses
  recommendedMonthlySavings: number;
  averageFireAge: number;
  strategy: ReturnType<typeof getPortfolioParameters>;
}

export interface FireProjection {
  year: number;
  age: number;
  yearlyContribution: number;
  portfolioValue: number;
  realValue: number;
  cumulativeContributions: number;
  fireProgress: number; // 0-1, how close to FIRE target
}

// Missing interfaces for retirement calculations
export interface RetirementParams {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlySavings: number;
  inflationRate: number;
  monthlyExpensesInRetirement: number;
  withdrawalStrategy: 'percentage' | 'fixed' | 'dynamic';
  safeWithdrawalRate: number;
  accumulationStrategy?: 'conservative' | 'moderate' | 'aggressive';
  withdrawalPortfolioStrategy?: 'conservative' | 'moderate' | 'aggressive';
}

export interface RetirementProjection {
  year: number;
  age: number;
  yearlyContribution: number;
  portfolioValue: number;
  realValue: number;
  cumulativeContributions: number;
}

export interface RetirementScenario {
  name: string;
  probability: number;
  totalSavingsAtRetirement: number;
  realPurchasingPower: number;
  monthlyIncomeInRetirement: number;
  yearsMoneyWillLast: number;
  isFinanciallySecure: boolean;
  projectionData: RetirementProjection[];
  withdrawalData: WithdrawalProjection[];
}

export interface RetirementData {
  scenarios: {
    optimistic: RetirementScenario;
    realistic: RetirementScenario;
    pessimistic: RetirementScenario;
  };
  recommendedMonthlySavings: number;
  summary: {
    totalContributed: number;
    averageInvestmentGains: number;
    inflationImpact: number;
    successProbability: number;
    portfolioStrategy: {
      accumulation: ReturnType<typeof getPortfolioParameters>;
      withdrawal: ReturnType<typeof getPortfolioParameters>;
    };
  };
}

export interface WithdrawalProjection {
  year: number;
  age: number;
  portfolioValue: number;
  realPortfolioValue: number;
  yearlyWithdrawal: number;
  realWithdrawal: number;
  isDepletion: boolean;
}

// Historické výnosy a volatility podle portfolio strategií (na základě reálných dat 1995-2024)
export const getPortfolioParameters = (strategy: 'conservative' | 'moderate' | 'aggressive') => {
  switch (strategy) {
    case 'conservative':
      // 30% akcií, 70% dluhopisy - data z portfoliovisualizer.com
      return {
        expectedReturn: 7.7, // Historické průměrné výnosy 30/70 portfolia (1995-2024)
        volatility: 0.065,   // Nízká volatilita díky vysokému podílu dluhopisů
        stockAllocation: 0.30,
        bondAllocation: 0.70,
        description: '30% akcií, 70% dluhopisy - stabilní růst'
      };
    case 'moderate':
      // 60% akcií, 40% dluhopisy - data z portfoliovisualizer.com
      return {
        expectedReturn: 8.8, // Historické průměrné výnosy 60/40 portfolia (1995-2024)
        volatility: 0.105,   // 10.5% standardní odchylka (historická data)
        stockAllocation: 0.60,
        bondAllocation: 0.40,
        description: '60% akcií, 40% dluhopisy - vyvážený růst'
      };
    case 'aggressive':
      // 80% akcií, 20% dluhopisy - reálná historická data (místo 90/10)
      return {
        expectedReturn: 9.8, // Historický průměr 80/20 portfolia
        volatility: 0.136,   // 13.6% standardní odchylka (10-year data)
        stockAllocation: 0.80,
        bondAllocation: 0.20,
        description: '80% akcií, 20% dluhopisy - rychlý růst'
      };
    default:
      return getPortfolioParameters('moderate');
  }
};

// Portfolio alokace podle věku a rizikového profilu - upraveno pro český trh
const getPortfolioAllocation = (age: number, riskProfile: 'conservative' | 'moderate' | 'aggressive' = 'moderate') => {
  let baseStockAllocation: number;
  
  // Modernější přístup než klasické "100 - věk" - více akcií v mládí, postupný pokles
  if (riskProfile === 'conservative') {
    // Konzervativní: začíná na 60% akcií, klesá k 30%
    if (age <= 30) baseStockAllocation = 60;
    else if (age <= 40) baseStockAllocation = 55;
    else if (age <= 50) baseStockAllocation = 50;
    else if (age <= 60) baseStockAllocation = 45;
    else if (age <= 70) baseStockAllocation = 40;
    else baseStockAllocation = 30;
  } else if (riskProfile === 'aggressive') {
    // Agresivní: začíná na 90% akcií, klesá k 60%
    if (age <= 30) baseStockAllocation = 90;
    else if (age <= 40) baseStockAllocation = 85;
    else if (age <= 50) baseStockAllocation = 80;
    else if (age <= 60) baseStockAllocation = 75;
    else if (age <= 70) baseStockAllocation = 70;
    else baseStockAllocation = 60;
  } else {
    // Vyvážené: začíná na 80% akcií, klesá k 50%
    if (age <= 30) baseStockAllocation = 80;
    else if (age <= 40) baseStockAllocation = 75;
    else if (age <= 50) baseStockAllocation = 70;
    else if (age <= 60) baseStockAllocation = 65;
    else if (age <= 70) baseStockAllocation = 55;
    else baseStockAllocation = 50;
  }
  
  // Zajištění minimálních a maximálních hodnot
  baseStockAllocation = Math.max(20, Math.min(95, baseStockAllocation));
  const bondAllocation = 100 - baseStockAllocation;
  
  return {
    stocks: baseStockAllocation / 100,
    bonds: bondAllocation / 100
  };
};

// Výpočet výnosu podle scénáře a strategie
const getPortfolioReturn = (
  strategy: 'conservative' | 'moderate' | 'aggressive', 
  year: number, 
  scenario: 'optimistic' | 'realistic' | 'pessimistic' = 'realistic'
): number => {
  const params = getPortfolioParameters(strategy);
  
  // Úprava očekávaného výnosu podle scénáře
  let returnMultiplier: number;
  let volatilityMultiplier: number;
  
  switch (scenario) {
    case 'optimistic':
      returnMultiplier = 1.3; // +30% nad průměr
      volatilityMultiplier = 0.8; // Méně volatility v dobrých časech
      break;
    case 'pessimistic':
      returnMultiplier = 0.6; // -40% pod průměr
      volatilityMultiplier = 1.4; // Více volatility v špatných časech
      break;
    default: // realistic
      returnMultiplier = 1.0; // Průměrný výnos
      volatilityMultiplier = 1.0; // Průměrná volatilita
  }
  
  const adjustedReturn = params.expectedReturn * returnMultiplier;
  const adjustedVolatility = params.volatility * volatilityMultiplier;
  
  // Deterministická volatilita pro konzistentní výsledky
  const cycleFactor = Math.sin((year * 1.618) % (2 * Math.PI));
  const volatilityFactor = cycleFactor * adjustedVolatility * 0.6;
  
  const finalReturn = adjustedReturn + (adjustedReturn * volatilityFactor);
  
  // Realistické limity podle scénáře
  const minReturn = scenario === 'pessimistic' ? -0.40 : -0.25;
  const maxReturn = scenario === 'optimistic' ? 0.50 : 0.35;
  
  return Math.max(minReturn, Math.min(maxReturn, finalReturn / 100));
};

// Výpočet FIRE scénáře
const calculateFireScenario = (
  params: FireCalculationParams,
  scenario: 'optimistic' | 'realistic' | 'pessimistic'
): FireScenario => {
  const {
    currentAge,
    currentSavings,
    monthlySavings,
    monthlyExpensesInFire,
    inflationRate,
    investmentStrategy
  } = params;

  const strategyParams = getPortfolioParameters(investmentStrategy);
  const yearlyInflation = inflationRate / 100;
  
  // FIRE target: 25x annual expenses (4% rule)
  const annualExpensesInFire = monthlyExpensesInFire * 12;
  const fireTarget = annualExpensesInFire * 25;

  const projectionData: FireProjection[] = [];
  let portfolioValue = currentSavings;
  let totalContributed = currentSavings;
  let fireAge: number | null = null;
  let fireAmount = 0;

  // Simulace až 50 let do budoucna
  for (let year = 0; year < 50; year++) {
    const age = currentAge + year;
    const yearlyContribution = year === 0 ? 0 : monthlySavings * 12;
    
    if (year > 0) {
      // Přidání ročních příspěvků
      portfolioValue += yearlyContribution;
      totalContributed += yearlyContribution;
      
      // Výnos podle scénáře
      const portfolioReturn = getPortfolioReturn(investmentStrategy, year, scenario);
      portfolioValue *= (1 + portfolioReturn);
      
      // Ochrana proti extrémním ztrátám
      portfolioValue = Math.max(portfolioValue, totalContributed * 0.6);
    }

    const realValue = portfolioValue / Math.pow(1 + yearlyInflation, year);
    
    // Aktuální FIRE target adjustovaný o inflaci
    const currentFireTarget = fireTarget * Math.pow(1 + yearlyInflation, year);
    const fireProgress = Math.min(1, portfolioValue / currentFireTarget);

    projectionData.push({
      year,
      age,
      yearlyContribution,
      portfolioValue,
      realValue,
      cumulativeContributions: totalContributed,
      fireProgress
    });

    // Kontrola dosažení FIRE
    if (fireAge === null && portfolioValue >= currentFireTarget) {
      fireAge = age;
      fireAmount = portfolioValue;
    }
  }

  const scenarioNames = {
    optimistic: 'Optimistický (20%)',
    realistic: 'Realistický (60%)', 
    pessimistic: 'Pesimistický (20%)'
  };

  const scenarioProbabilities = {
    optimistic: 20,
    realistic: 60,
    pessimistic: 20
  };

  return {
    name: scenarioNames[scenario],
    probability: scenarioProbabilities[scenario],
    fireAge,
    fireAmount: fireAge ? fireAmount : portfolioValue,
    yearsToFire: fireAge ? fireAge - currentAge : null,
    projectionData
  };
};

export const calculateFire = (params: FireCalculationParams): FireData => {
  // Výpočet všech scénářů
  const optimistic = calculateFireScenario(params, 'optimistic');
  const realistic = calculateFireScenario(params, 'realistic'); 
  const pessimistic = calculateFireScenario(params, 'pessimistic');

  // FIRE target
  const fireTarget = params.monthlyExpensesInFire * 12 * 25;

  // Průměrný FIRE věk
  const fireAges = [optimistic.fireAge, realistic.fireAge, pessimistic.fireAge].filter(age => age !== null) as number[];
  const averageFireAge = fireAges.length > 0 ? 
    fireAges.reduce((sum, age) => sum + age, 0) / fireAges.length : 
    params.currentAge + 50; // Pokud nedosáhne FIRE

  // Doporučené měsíční spoření pro dosažení FIRE do realistického scénáře
  const yearsToRealisticFire = realistic.yearsToFire || 30;
  const strategyParams = getPortfolioParameters(params.investmentStrategy);
  const monthlyReturn = strategyParams.expectedReturn / 100 / 12;
  
  const futureValueOfCurrentSavings = params.currentSavings * Math.pow(1 + strategyParams.expectedReturn/100, yearsToRealisticFire);
  const additionalNeeded = Math.max(0, fireTarget - futureValueOfCurrentSavings);
  
  const recommendedMonthlySavings = additionalNeeded > 0 && yearsToRealisticFire > 0 && monthlyReturn > 0
    ? (additionalNeeded * monthlyReturn) / (Math.pow(1 + monthlyReturn, yearsToRealisticFire * 12) - 1)
    : additionalNeeded > 0 && yearsToRealisticFire > 0 
      ? additionalNeeded / (yearsToRealisticFire * 12)
      : 0;

  return {
    scenarios: {
      optimistic,
      realistic,
      pessimistic
    },
    fireTarget,
    recommendedMonthlySavings,
    averageFireAge,
    strategy: strategyParams
  };
};

// Pomocná funkce pro výpočet jednoho scénáře
const calculateScenario = (
  params: RetirementParams,
  scenario: 'optimistic' | 'realistic' | 'pessimistic',
  accumulationParams: ReturnType<typeof getPortfolioParameters>
): RetirementScenario => {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlySavings,
    inflationRate,
    monthlyExpensesInRetirement,
    withdrawalStrategy,
    safeWithdrawalRate,
    accumulationStrategy = 'moderate',
    withdrawalPortfolioStrategy = 'conservative'
  } = params;

  const yearsToRetirement = retirementAge - currentAge;
  const monthlyReturn = accumulationParams.expectedReturn / 100 / 12;
  const yearlyReturn = accumulationParams.expectedReturn / 100;
  const yearlyInflation = inflationRate / 100;

  // Akumulační fáze
  const projectionData: RetirementProjection[] = [];
  let portfolioValue = currentSavings;
  let totalContributed = currentSavings;

  for (let year = 0; year <= yearsToRetirement; year++) {
    const age = currentAge + year;
    const yearlyContribution = year === 0 ? 0 : monthlySavings * 12;
    
    if (year > 0) {
      portfolioValue += yearlyContribution;
      totalContributed += yearlyContribution;
      
      const portfolioReturn = getPortfolioReturn(accumulationStrategy, year, scenario);
      portfolioValue *= (1 + portfolioReturn);
      portfolioValue = Math.max(portfolioValue, totalContributed * 0.7);
    }

    const realValue = portfolioValue / Math.pow(1 + yearlyInflation, year);

    projectionData.push({
      year,
      age,
      yearlyContribution,
      portfolioValue,
      realValue,
      cumulativeContributions: totalContributed
    });
  }

  const totalSavingsAtRetirement = portfolioValue;
  const realPurchasingPower = totalSavingsAtRetirement / Math.pow(1 + yearlyInflation, yearsToRetirement);

  // Výběrová fáze
  const withdrawalData: WithdrawalProjection[] = [];
  let remainingPortfolio = totalSavingsAtRetirement;
  let yearsMoneyWillLast = 0;
  
  const adjustedYearlyExpenses = monthlyExpensesInRetirement * 12 * Math.pow(1 + yearlyInflation, yearsToRetirement);
  
  for (let year = 0; year < 50; year++) {
    const age = retirementAge + year;
    
    let yearlyWithdrawal: number;
    
    switch (withdrawalStrategy) {
      case 'percentage':
        yearlyWithdrawal = remainingPortfolio * (safeWithdrawalRate / 100);
        break;
      case 'fixed':
        yearlyWithdrawal = adjustedYearlyExpenses * Math.pow(1 + yearlyInflation, year);
        break;
      case 'dynamic':
        const baseWithdrawal = remainingPortfolio * (safeWithdrawalRate / 100);
        const inflationAdjusted = adjustedYearlyExpenses * Math.pow(1 + yearlyInflation, year);
        yearlyWithdrawal = Math.min(baseWithdrawal, inflationAdjusted * 1.2);
        break;
      default:
        yearlyWithdrawal = remainingPortfolio * (safeWithdrawalRate / 100);
    }

    remainingPortfolio -= yearlyWithdrawal;
    
    if (remainingPortfolio > 0) {
      const portfolioReturn = getPortfolioReturn(withdrawalPortfolioStrategy, yearsToRetirement + year, scenario);
      remainingPortfolio *= (1 + portfolioReturn);
      remainingPortfolio = Math.max(0, remainingPortfolio);
    }

    const realWithdrawal = yearlyWithdrawal / Math.pow(1 + yearlyInflation, yearsToRetirement + year);
    const realPortfolioValue = Math.max(0, remainingPortfolio) / Math.pow(1 + yearlyInflation, yearsToRetirement + year);
    const isDepletion = remainingPortfolio <= 0;

    withdrawalData.push({
      year,
      age,
      portfolioValue: Math.max(0, remainingPortfolio),
      realPortfolioValue,
      yearlyWithdrawal,
      realWithdrawal,
      isDepletion
    });

    if (!isDepletion && remainingPortfolio > 0) {
      yearsMoneyWillLast = year + 1;
    }

    if (remainingPortfolio <= 0) break;
  }

  // Výpočet měsíčního příjmu
  let monthlyIncomeInRetirement: number;
  
  switch (withdrawalStrategy) {
    case 'percentage':
      monthlyIncomeInRetirement = (totalSavingsAtRetirement * (safeWithdrawalRate / 100)) / 12;
      break;
    case 'fixed':
      monthlyIncomeInRetirement = adjustedYearlyExpenses / 12;
      break;
    case 'dynamic':
      const percentageAmount = (totalSavingsAtRetirement * (safeWithdrawalRate / 100)) / 12;
      const fixedAmount = adjustedYearlyExpenses / 12;
      monthlyIncomeInRetirement = Math.min(percentageAmount, fixedAmount * 1.2);
      break;
    default:
      monthlyIncomeInRetirement = (totalSavingsAtRetirement * (safeWithdrawalRate / 100)) / 12;
  }

  const monthlyIncomeNeeded = monthlyExpensesInRetirement * Math.pow(1 + yearlyInflation, yearsToRetirement);
  const isFinanciallySecure = monthlyIncomeInRetirement >= monthlyIncomeNeeded && yearsMoneyWillLast >= 30;

  const scenarioNames = {
    optimistic: 'Optimistický (20%)',
    realistic: 'Realistický (60%)',
    pessimistic: 'Pesimistický (20%)'
  };

  const scenarioProbabilities = {
    optimistic: 20,
    realistic: 60,
    pessimistic: 20
  };

  return {
    name: scenarioNames[scenario],
    probability: scenarioProbabilities[scenario],
    totalSavingsAtRetirement,
    realPurchasingPower,
    monthlyIncomeInRetirement,
    yearsMoneyWillLast,
    isFinanciallySecure,
    projectionData,
    withdrawalData
  };
};

export const calculateRetirement = (params: RetirementParams): RetirementData => {
  const {
    accumulationStrategy = 'moderate',
    withdrawalPortfolioStrategy = 'conservative'
  } = params;

  // Získání parametrů strategií
  const accumulationParams = getPortfolioParameters(accumulationStrategy);
  const withdrawalParams = getPortfolioParameters(withdrawalPortfolioStrategy);

  // Výpočet všech tří scénářů
  const optimistic = calculateScenario(params, 'optimistic', accumulationParams);
  const realistic = calculateScenario(params, 'realistic', accumulationParams);
  const pessimistic = calculateScenario(params, 'pessimistic', accumulationParams);

  // Výpočet doporučeného měsíčního spoření na základě realistického scénáře
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlySavings,
    inflationRate,
    monthlyExpensesInRetirement,
    withdrawalStrategy,
    safeWithdrawalRate
  } = params;

  const yearsToRetirement = retirementAge - currentAge;
  const monthlyReturn = accumulationParams.expectedReturn / 100 / 12;
  const yearlyReturn = accumulationParams.expectedReturn / 100;
  const yearlyInflation = inflationRate / 100;

  // Výpočet doporučeného měsíčního spoření na základě realistického scénáře
  const adjustedExpenses = monthlyExpensesInRetirement * 12 * Math.pow(1 + yearlyInflation, yearsToRetirement);
  
  let targetPortfolio: number;
  if (withdrawalStrategy === 'percentage') {
    const multiplier = 100 / safeWithdrawalRate; // 4% = 25x, 3% = 33x, 5% = 20x
    targetPortfolio = adjustedExpenses * multiplier;
  } else if (withdrawalStrategy === 'fixed') {
    let totalNeeded = 0;
    for (let year = 0; year < 30; year++) {
      const yearlyExpense = adjustedExpenses * Math.pow(1 + yearlyInflation, year);
      const discountedExpense = yearlyExpense / Math.pow(1 + yearlyReturn, year);
      totalNeeded += discountedExpense;
    }
    targetPortfolio = totalNeeded * 1.2; // 20% rezerva
  } else { // dynamic
    const percentageTarget = adjustedExpenses * (100 / safeWithdrawalRate);
    let fixedTarget = 0;
    for (let year = 0; year < 30; year++) {
      const yearlyExpense = adjustedExpenses * Math.pow(1 + yearlyInflation, year);
      const discountedExpense = yearlyExpense / Math.pow(1 + yearlyReturn, year);
      fixedTarget += discountedExpense;
    }
    fixedTarget *= 1.2;
    targetPortfolio = Math.max(percentageTarget, fixedTarget);
  }
  
  const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + yearlyReturn, yearsToRetirement);
  const additionalNeeded = Math.max(0, targetPortfolio - futureValueOfCurrentSavings);
  
  const recommendedMonthlySavings = additionalNeeded > 0 && yearsToRetirement > 0 && monthlyReturn > 0
    ? (additionalNeeded * monthlyReturn) / (Math.pow(1 + monthlyReturn, yearsToRetirement * 12) - 1)
    : additionalNeeded > 0 && yearsToRetirement > 0 
      ? additionalNeeded / (yearsToRetirement * 12)
      : 0;

  // Výpočet celkové pravděpodobnosti úspěchu (vážený průměr scénářů)
  const successProbability = (
    optimistic.probability * (optimistic.isFinanciallySecure ? 95 : 40) +
    realistic.probability * (realistic.isFinanciallySecure ? 85 : 50) +
    pessimistic.probability * (pessimistic.isFinanciallySecure ? 60 : 25)
  ) / 100;

  // Průměrné hodnoty pro summary
  const totalContributed = realistic.projectionData[realistic.projectionData.length - 1]?.cumulativeContributions || 0;
  const averageInvestmentGains = (
    (optimistic.totalSavingsAtRetirement - totalContributed) * (optimistic.probability / 100) +
    (realistic.totalSavingsAtRetirement - totalContributed) * (realistic.probability / 100) +
    (pessimistic.totalSavingsAtRetirement - totalContributed) * (pessimistic.probability / 100)
  );

  return {
    scenarios: {
      optimistic,
      realistic,
      pessimistic
    },
    recommendedMonthlySavings,
    summary: {
      totalContributed,
      averageInvestmentGains,
      inflationImpact: realistic.totalSavingsAtRetirement - realistic.realPurchasingPower,
      successProbability,
      portfolioStrategy: {
        accumulation: accumulationParams,
        withdrawal: withdrawalParams
      }
    }
  };
};