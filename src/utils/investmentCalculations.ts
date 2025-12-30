export interface CalculationData {
  year: number;
  totalInvested: number;
  grossValue: number;
  netValue: number;
  grossGain: number;
  netGain: number;
  tax: number;
}

export interface InvestmentParams {
  initialInvestment: number;
  recurringInvestment: number;
  recurringFrequency: 'monthly' | 'yearly';
  averageReturn: number;
  investmentPeriod: number;
  taxRate: number;
}

export const calculateInvestment = (params: InvestmentParams): CalculationData[] => {
  const {
    initialInvestment,
    recurringInvestment,
    recurringFrequency,
    averageReturn,
    investmentPeriod,
    taxRate
  } = params;

  const data: CalculationData[] = [];
  const annualReturn = averageReturn / 100;
  
  console.log('Starting calculation with:', params);

  let currentValue = initialInvestment;
  let totalInvested = initialInvestment;

  for (let year = 1; year <= investmentPeriod; year++) {
    if (recurringFrequency === 'monthly') {
      // Měsíční investování - simulujeme měsíc po měsíci pro přesný výpočet
      const monthlyReturn = annualReturn / 12; // Převod na měsíční výnos
      
      for (let month = 1; month <= 12; month++) {
        // Přidej měsíční investici
        currentValue += recurringInvestment;
        totalInvested += recurringInvestment;
        
        // Aplikuj měsíční výnos na celou aktuální hodnotu
        currentValue = currentValue * (1 + monthlyReturn);
      }
    } else {
      // Roční investování
      // Přidej roční investici na začátku roku
      currentValue += recurringInvestment;
      totalInvested += recurringInvestment;
      
      // Aplikuj roční výnos
      currentValue = currentValue * (1 + annualReturn);
    }

    const grossGain = currentValue - totalInvested;
    
    // Daň z kapitálových výnosů v ČR:
    // - 0% při držení 3+ roky (časový test) 
    // - 15%/23% při aktivním obchodování (kratší držení)
    // Pro aktivní obchodníky simulujeme roční zdanění realizovaných zisků
    const tax = (taxRate > 0 && grossGain > 0) ? grossGain * (taxRate / 100) : 0;
    const netValue = currentValue - tax;
    const netGain = netValue - totalInvested;

    console.log(`Year ${year}:`, {
      totalInvested,
      currentValue,
      grossGain,
      tax,
      netValue,
      netGain
    });

    data.push({
      year,
      totalInvested: Math.round(totalInvested),
      grossValue: Math.round(currentValue),
      netValue: Math.round(netValue),
      grossGain: Math.round(grossGain),
      netGain: Math.round(netGain),
      tax: Math.round(tax)
    });
  }

  console.log('Final results:', data);
  return data;
};

/**
 * Výpočet kolik potřebuji spořit měsíčně pro dosažení cíle
 */
export const calculateRequiredMonthlySavings = (
  targetAmount: number,
  currentSavings: number,
  years: number,
  annualReturn: number,
  taxRate: number = 0
): number => {
  const monthlyReturn = (annualReturn / 100) / 12;
  const months = years * 12;
  const effectiveReturn = monthlyReturn * (1 - taxRate / 100);
  
  // Budoucí hodnota současných úspor
  const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + annualReturn / 100, years);
  
  // Kolik ještě potřebuji
  const additionalNeeded = Math.max(0, targetAmount - futureValueOfCurrentSavings);
  
  if (additionalNeeded === 0) return 0;
  
  // Výpočet měsíčního spoření pomocí annuity vzorce
  if (effectiveReturn > 0) {
    return (additionalNeeded * effectiveReturn) / (Math.pow(1 + effectiveReturn, months) - 1);
  } else {
    // Pokud je výnos 0, jednoduché dělení
    return additionalNeeded / months;
  }
};

/**
 * Výpočet jak dlouho potrvá dosažení cíle při současném spoření
 */
export const calculateTimeToTarget = (
  targetAmount: number,
  currentSavings: number,
  monthlySavings: number,
  annualReturn: number,
  taxRate: number = 0
): number => {
  if (monthlySavings <= 0) return Infinity;
  
  const monthlyReturn = (annualReturn / 100) / 12;
  const effectiveReturn = monthlyReturn * (1 - taxRate / 100);
  
  let portfolioValue = currentSavings;
  let months = 0;
  
  while (portfolioValue < targetAmount && months < 600) { // max 50 let
    portfolioValue += monthlySavings;
    portfolioValue *= (1 + effectiveReturn);
    months++;
  }
  
  return months / 12; // vrátí roky
};

/**
 * Formátování částky v CZK
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formátování procent
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};