export interface NetSalaryParams {
  grossSalary: number;
  isPensioner: boolean;
  hasChildren: boolean;
  numberOfChildren: number;
  isStudent: boolean;
  hasDisability: boolean;
}

export interface NetSalaryData {
  grossSalary: number;
  socialInsurance: number;
  healthInsurance: number;
  totalInsurance: number;
  taxableBase: number;
  incomeTax: number;
  taxRate: number;
  taxDeductions: number;
  netTax: number;
  netSalary: number;
  employerCosts: number;
  taxEffectiveRate: number;
  breakdown: {
    monthlyTaxCredit: number;
    childTaxCredit: number;
    studentTaxCredit: number;
    disabilityTaxCredit: number;
    totalTaxCredits: number;
  };
}

// Konstanty pro rok 2026
const SOCIAL_INSURANCE_RATE = 0.071; // 7.1% (6.5% důchodové + 0.6% nemocenské)
const HEALTH_INSURANCE_RATE = 0.045; // 4.5%
const PENSIONER_SOCIAL_INSURANCE_RATE = 0.006; // 0.6% nemocenské pro důchodce (po slevě na důchodovém)
const PENSIONER_HEALTH_INSURANCE_RATE = 0.045; // 4.5% pro důchodce (zůstává)
const SICKNESS_INSURANCE_RATE = 0.006; // 0.6% nemocenské (součást sociálního pojištění)

const INCOME_TAX_RATE_BASIC = 0.15; // 15%
const INCOME_TAX_RATE_HIGH = 0.23; // 23%
const AVERAGE_SALARY_2026 = 46557; // Kč
const HIGH_TAX_THRESHOLD_MONTHLY = AVERAGE_SALARY_2026 * 36; // 1,676,052 Kč ročně = 139,671 Kč měsíčně

const MONTHLY_TAX_CREDIT = 2570; // Kč
const CHILD_TAX_CREDIT_FIRST = 1267; // Kč za 1. dítě
const CHILD_TAX_CREDIT_SECOND = 1860; // Kč za 2. dítě  
const CHILD_TAX_CREDIT_THIRD_PLUS = 2320; // Kč za 3. a další dítě
const DISABILITY_TAX_CREDIT_1_2_MONTHLY = 210; // Kč pro invaliditu 1./2. stupeň
const DISABILITY_TAX_CREDIT_3_MONTHLY = 420; // Kč pro invaliditu 3. stupeň
const ZTP_P_TAX_CREDIT_MONTHLY = 1345; // Kč pro držitele průkazu ZTP/P (16 140 Kč/rok)

const EMPLOYER_SOCIAL_INSURANCE_RATE = 0.248; // 24.8%
const EMPLOYER_HEALTH_INSURANCE_RATE = 0.09; // 9%

export const calculateNetSalary = (params: NetSalaryParams): NetSalaryData => {
  const { 
    grossSalary, 
    isPensioner, 
    hasChildren, 
    numberOfChildren, 
    isStudent, 
    hasDisability 
  } = params;

  // Výpočet pojistného
  let socialInsurance: number;
  let healthInsurance: number;

  if (isPensioner) {
    // Pracující důchodci - 0% sociální, 4.5% zdravotní
    socialInsurance = 0;
    healthInsurance = grossSalary * PENSIONER_HEALTH_INSURANCE_RATE;
  } else {
    socialInsurance = grossSalary * SOCIAL_INSURANCE_RATE;
    healthInsurance = grossSalary * HEALTH_INSURANCE_RATE;
  }

  const totalInsurance = socialInsurance + healthInsurance;

  // Daňový základ = hrubá mzda - pojistné
  const taxableBase = grossSalary - totalInsurance;

  // Určení daňové sazby
  const annualGross = grossSalary * 12;
  const annualThreshold = HIGH_TAX_THRESHOLD_MONTHLY * 12; // Převod na roční limit
  const taxRate = annualGross > annualThreshold ? INCOME_TAX_RATE_HIGH : INCOME_TAX_RATE_BASIC;

  // Výpočet daně z příjmu (počítá se z hrubé mzdy, ne z daňového základu)
  let incomeTax = 0;
  if (annualGross > annualThreshold) {
    // Progresivní zdanění - 15% do limitu, 23% nad limit
    const basicTaxBase = annualThreshold;
    const highTaxBase = annualGross - annualThreshold;
    const annualTax = basicTaxBase * INCOME_TAX_RATE_BASIC + highTaxBase * INCOME_TAX_RATE_HIGH;
    incomeTax = annualTax / 12; // Převod na měsíční daň
  } else {
    // Základní sazba 15%
    incomeTax = grossSalary * INCOME_TAX_RATE_BASIC;
  }

  // Slevy na dani
  const monthlyTaxCredit = MONTHLY_TAX_CREDIT;
  
  // Výpočet slevy na děti (progresivní)
  let childTaxCredit = 0;
  if (hasChildren && numberOfChildren > 0) {
    for (let i = 1; i <= numberOfChildren; i++) {
      if (i === 1) {
        childTaxCredit += CHILD_TAX_CREDIT_FIRST;
      } else if (i === 2) {
        childTaxCredit += CHILD_TAX_CREDIT_SECOND;
      } else {
        childTaxCredit += CHILD_TAX_CREDIT_THIRD_PLUS;
      }
    }
  }
  
  // Studentská sleva byla zrušena od 1.1.2024
  const studentTaxCredit = 0;
  
  const disabilityTaxCredit = hasDisability ? DISABILITY_TAX_CREDIT_1_2_MONTHLY : 0; // Defaultně invalidita 1./2. stupeň

  const totalTaxCredits = monthlyTaxCredit + childTaxCredit + studentTaxCredit + disabilityTaxCredit;

  // Čistá daň (nemůže být záporná)
  const netTax = Math.max(0, incomeTax - totalTaxCredits);

  // Čistá mzda
  const netSalary = grossSalary - totalInsurance - netTax;

  // Náklady zaměstnavatele
  const employerSocialInsurance = grossSalary * EMPLOYER_SOCIAL_INSURANCE_RATE;
  const employerHealthInsurance = grossSalary * EMPLOYER_HEALTH_INSURANCE_RATE;
  const employerCosts = grossSalary + employerSocialInsurance + employerHealthInsurance;

  // Efektivní daňová sazba
  const taxEffectiveRate = (totalInsurance + netTax) / grossSalary;

  return {
    grossSalary,
    socialInsurance,
    healthInsurance,
    totalInsurance,
    taxableBase,
    incomeTax,
    taxRate,
    taxDeductions: totalTaxCredits,
    netTax,
    netSalary,
    employerCosts,
    taxEffectiveRate,
    breakdown: {
      monthlyTaxCredit,
      childTaxCredit,
      studentTaxCredit,
      disabilityTaxCredit,
      totalTaxCredits
    }
  };
};

// Helper funkce pro formátování peněz
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper funkce pro formátování procent
export const formatPercentage = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`;
};