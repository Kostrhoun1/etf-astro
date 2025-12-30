export interface EmergencyFundParams {
  monthlyExpenses: number;
  jobStability: 'stable' | 'moderate' | 'unstable';
  familySize: number;
  hasSecondIncome: boolean;
  hasDebt: boolean;
  currentSavings: number;
  monthlySavingCapacity: number;
  // Volitelné detailní rizikové faktory pro ČR
  contractType?: 'permanent' | 'fixed_term' | 'freelance';
  ageGroup?: 'young' | 'middle' | 'senior';
  education?: 'basic' | 'high_school' | 'university';
  region?: 'prague_brno' | 'industrial' | 'rural';
}

export interface EmergencyFundData {
  recommendedAmount: number;
  recommendedMonths: number;
  currentCoverage: number;
  shortfall: number;
  monthsToTarget: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: {
    whereToKeep: WhereToKeepOption[];
    savingStrategy: SavingStrategy;
    priorityLevel: 'critical' | 'high' | 'moderate' | 'sufficient';
  };
  breakdown: {
    baseAmount: number;
    riskAdjustment: number;
    familyAdjustment: number;
    finalAmount: number;
  };
}

export interface WhereToKeepOption {
  option: string;
  percentage: number;
  pros: string[];
  cons: string[];
  expectedReturn: number;
  liquidity: 'immediate' | 'within_days' | 'within_week';
}

export interface SavingStrategy {
  phase1: {
    target: number;
    description: string;
    timeline: string;
  };
  phase2: {
    target: number;
    description: string;
    timeline: string;
  };
  phase3: {
    target: number;
    description: string;
    timeline: string;
  };
}

export const calculateEmergencyFund = (params: EmergencyFundParams): EmergencyFundData => {
  const {
    monthlyExpenses,
    jobStability,
    familySize,
    hasSecondIncome,
    hasDebt,
    currentSavings,
    monthlySavingCapacity,
    contractType,
    ageGroup,
    education,
    region
  } = params;

  // Základní výpočet podle stability zaměstnání
  let baseMonths: number;
  switch (jobStability) {
    case 'stable':
      baseMonths = 3;
      break;
    case 'moderate':
      baseMonths = 6;
      break;
    case 'unstable':
      baseMonths = 9;
      break;
  }

  // Bodové hodnocení rizika místo multiplikátorů
  let riskPoints = 0;

  // Základní stabilita práce
  if (jobStability === 'moderate') riskPoints += 1;
  if (jobStability === 'unstable') riskPoints += 2;

  // Typ zaměstnavatele odstraněn - duplicitní se stabilitou

  // Typ smlouvy
  if (contractType === 'fixed_term') riskPoints += 1;
  if (contractType === 'freelance') riskPoints += 2;

  // Věk
  if (ageGroup === 'senior') riskPoints += 1;
  if (ageGroup === 'young') riskPoints -= 1;

  // Vzdělání
  if (education === 'basic') riskPoints += 1;
  if (education === 'university') riskPoints -= 1;

  // Druhý příjem a dluhy
  if (!hasSecondIncome) riskPoints += 1;
  if (hasDebt) riskPoints += 1;

  // Velikost rodiny (každá osoba nad 2 = +1 bod)
  if (familySize > 2) riskPoints += (familySize - 2);

  // Kategorizace celkového rizika
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskPoints <= 1) riskLevel = 'low';
  else if (riskPoints <= 4) riskLevel = 'medium';
  else riskLevel = 'high';

  // Finální multiplikátor na základě kategorie rizika
  let riskMultiplier: number;
  switch (riskLevel) {
    case 'low': riskMultiplier = 1.0; break;    // Bez změny
    case 'medium': riskMultiplier = 1.3; break; // +30%
    case 'high': riskMultiplier = 1.6; break;   // +60%
  }

  // Odstraňujeme samostatný rodinný multiplikátor
  const familyMultiplier = 1;

  // Finální výpočet
  const adjustedMonths = baseMonths * riskMultiplier * familyMultiplier;
  const recommendedMonths = Math.max(3, Math.min(12, adjustedMonths)); // Min 3, max 12 měsíců
  const recommendedAmount = monthlyExpenses * recommendedMonths;

  // Současné pokrytí
  const currentCoverage = monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0;
  const shortfall = Math.max(0, recommendedAmount - currentSavings);
  const monthsToTarget = monthlySavingCapacity > 0 && shortfall > 0 ? Math.ceil(shortfall / monthlySavingCapacity) : 0;

  // riskLevel už je definovaný výše podle bodového hodnocení

  // Kde držet peníze
  const whereToKeep: WhereToKeepOption[] = [
    {
      option: 'Spořicí účet CZK',
      percentage: 70,
      pros: ['Okamžitá dostupnost', 'Pojištěno do 100k€', 'Žádné měnové riziko'],
      cons: ['Nižší úrok než TD', 'Reálná ztráta inflací'],
      expectedReturn: 3.8,
      liquidity: 'immediate'
    },
    {
      option: 'Termínovaný vklad CZK (3-6M)',
      percentage: 30,
      pros: ['Mírně vyšší úrok', 'Garance výnosu', 'Pojištěno do 100k€'],
      cons: ['Omezená dostupnost', 'Penále za předčasný výběr', 'Nízký výnos'],
      expectedReturn: 2.8,
      liquidity: 'within_days'
    }
  ];

  // Strategie spoření
  const phase1Target = monthlyExpenses * 1; // První měsíc
  const phase2Target = monthlyExpenses * Math.min(3, recommendedMonths); // 3 měsíce
  const phase3Target = recommendedAmount; // Celá částka

  const savingStrategy: SavingStrategy = {
    phase1: {
      target: phase1Target,
      description: 'Nouzová základna - pokryje první měsíc bez příjmu',
      timeline: monthlySavingCapacity > 0 ? `${Math.ceil(phase1Target / monthlySavingCapacity)} měsíců` : 'N/A'
    },
    phase2: {
      target: phase2Target,
      description: 'Základní rezerva - pokryje 3 měsíce běžných výdajů',
      timeline: monthlySavingCapacity > 0 ? `${Math.ceil(phase2Target / monthlySavingCapacity)} měsíců` : 'N/A'
    },
    phase3: {
      target: phase3Target,
      description: 'Plná rezerva - optimální pokrytí podle vašeho rizikového profilu',
      timeline: monthlySavingCapacity > 0 ? `${Math.ceil(phase3Target / monthlySavingCapacity)} měsíců` : 'N/A'
    }
  };

  // Priorita spoření
  let priorityLevel: 'critical' | 'high' | 'moderate' | 'sufficient';
  if (currentCoverage < 1) priorityLevel = 'critical';
  else if (currentCoverage < 3) priorityLevel = 'high';
  else if (currentCoverage < recommendedMonths * 0.8) priorityLevel = 'moderate';
  else priorityLevel = 'sufficient';

  return {
    recommendedAmount,
    recommendedMonths,
    currentCoverage,
    shortfall,
    monthsToTarget,
    riskLevel,
    recommendations: {
      whereToKeep,
      savingStrategy,
      priorityLevel
    },
    breakdown: {
      baseAmount: monthlyExpenses * baseMonths,
      riskAdjustment: monthlyExpenses * baseMonths * (riskMultiplier - 1),
      familyAdjustment: monthlyExpenses * baseMonths * riskMultiplier * (familyMultiplier - 1),
      finalAmount: recommendedAmount
    }
  };
};