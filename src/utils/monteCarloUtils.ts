import type { SimulationParameters, SimulationResult, AssetClass } from "../types/monteCarlo";

// Asset return, volatility
export const ASSETS: Record<AssetClass, { label: string; annualReturn: number; volatility: number }> = {
  us_large:         { label: "US velké akcie",             annualReturn: 0.086, volatility: 0.168 },
  us_small:         { label: "US malé akcie",              annualReturn: 0.076, volatility: 0.205 },
  emerging:         { label: "Akcie rozvíjejících se trhů",annualReturn: 0.073, volatility: 0.231 },
  intl_dev:         { label: "Rozvinuté zahraniční akcie", annualReturn: 0.062, volatility: 0.194 },
  canada:           { label: "Kanadské akcie",             annualReturn: 0.060, volatility: 0.172 },
  reits:            { label: "REITs (nemovitosti)",        annualReturn: 0.058, volatility: 0.187 },
  us_high_yield:    { label: "US vysoce výnosné dluhopisy",annualReturn: 0.048, volatility: 0.089 },
  us_quality_bond:  { label: "US vysokokvalitní dluhopisy",annualReturn: 0.042, volatility: 0.054 },
  intl_bond:        { label: "Mezinárodní dluhopisy",      annualReturn: 0.026, volatility: 0.108 },
  gold:             { label: "Zlato",                      annualReturn: 0.023, volatility: 0.162 },
  cash:             { label: "Hotovost (T-bills)",         annualReturn: 0.004, volatility: 0.015 }
};

// Korelační matice (dle pořadí AssetClass v ASSET_KEYS)
export const ASSET_KEYS: AssetClass[] = [
  "us_large", "us_small", "intl_dev", "emerging", "canada",
  "us_quality_bond", "us_high_yield", "intl_bond", "reits", "gold", "cash"
];

// Matice je symetrická, řádky (=assets) x sloupce (=assets)
export const CORRELATION_MATRIX: number[][] = [
  //        us_large us_small intl_dev emerging canada us_quality_bond us_high_yield intl_bond reits   gold   cash
  /*us_large*/       [1,    0.85,   0.78,   0.65,   0.74,     0.15,        0.45,        0.25,    0.65,  0.05, -0.05],
  /*us_small*/       [0.85, 1,      0.72,   0.7,    0.68,     0.1,         0.5,         0.2,     0.7,   0,    -0.1 ],
  /*intl_dev*/       [0.78, 0.72,   1,      0.8,    0.82,     0.25,        0.4,         0.45,    0.55,  0.15, 0   ],
  /*emerging*/       [0.65, 0.7,    0.8,    1,      0.6,      0.2,         0.35,        0.3,     0.5,   0.1,  0.05],
  /*canada*/         [0.74, 0.68,   0.82,   0.6,    1,        0.22,        0.42,        0.35,    0.58,  0.12, 0.02],
  /*us_quality_bond*/[0.15, 0.1,    0.25,   0.2,    0.22,     1,           0.65,        0.55,    0.2,   0.3,  0.35],
  /*us_high_yield*/  [0.45, 0.5,    0.4,    0.35,   0.42,     0.65,        1,           0.45,    0.55,  0.15, 0.2 ],
  /*intl_bond*/      [0.25, 0.2,    0.45,   0.3,    0.35,     0.55,        0.45,        1,       0.3,   0.25, 0.3 ],
  /*reits*/          [0.65, 0.7,    0.55,   0.5,    0.58,     0.2,         0.55,        0.3,     1,     0.15, -0.1],
  /*gold*/           [0.05, 0,      0.15,   0.1,    0.12,     0.3,         0.15,        0.25,    0.15,  1,    0.2 ],
  /*cash*/           [-0.05,-0.1,   0,      0.05,   0.02,     0.35,        0.2,         0.3,    -0.1,   0.2,  1   ]
];

// Spotřebujeme: cholesky dekompozici pro generovaní návratností respektujících korelace
function choleskyDecomposition(matrix: number[][]): number[][] {
  // Simple Cholesky, no checks. Only for symmetric positive-definite.
  const n = matrix.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
      if (i === j)
        L[i][j] = Math.sqrt(matrix[i][i] - sum);
      else
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
    }
  }
  return L;
}
const CHOLESKY = choleskyDecomposition(CORRELATION_MATRIX);

// Generování jednoho vektoru výnosů ¨~ N(0,1), poté násobíme Choleskym a dostaneme korelovaná náhodná čísla
function generateCorrelatedStandardNormals(): number[] {
  const n = ASSET_KEYS.length;
  const z: number[] = Array.from({ length: n }, () => {
    // Box-Muller pro N(0,1)
    const u = Math.random();
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  });
  // korelované N(0,1)
  const correlated: number[] = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let k = 0; k <= i; k++) {
      sum += CHOLESKY[i][k] * z[k];
    }
    correlated.push(sum);
  }
  return correlated;
}

// Generování měsíčních výnosů pro všechna aktiva, respektuje korelaci!
function generateMonthlyReturns(): number[] {
  // Vygenerujeme vektor korelovaných N(0,1)
  const normals = generateCorrelatedStandardNormals();
  return ASSET_KEYS.map((key, i) => {
    const annualR = ASSETS[key].annualReturn;
    const vol = ASSETS[key].volatility;
    const monthlyMu = Math.log(1 + annualR) / 12;
    const monthlySigma = vol / Math.sqrt(12);
    // exp(mu + sigma * z) - 1
    return Math.exp(monthlyMu + monthlySigma * normals[i]) - 1;
  });
}

export async function runMonteCarloSimulation(params: SimulationParameters): Promise<SimulationResult[]> {
  console.log("runMonteCarloSimulation started with params:", params);
  
  const { allocation, initialInvestment, monthlyContribution, years, simulations } = params;
  const nAssets = ASSET_KEYS.length;
  const monthsTotal = years * 12;
  const allSimulations: number[][] = [];

  console.log(`Running ${simulations} simulations for ${years} years (${monthsTotal} months)`);

  for (let sim = 0; sim < simulations; sim++) {
    if (sim % 100 === 0) {
      console.log(`Running simulation ${sim}/${simulations}`);
    }
    
    let value = initialInvestment;
    const values: number[] = [initialInvestment];
    
    for (let month = 1; month <= monthsTotal; month++) {
      // Přidej měsíční příspěvek na začátku měsíce
      value += monthlyContribution;
      
      // Korelované výnosy pro všechna aktiva
      const rets = generateMonthlyReturns();
      // Vážený výnos portfolia
      let portRet = 0;
      for (let i = 0; i < nAssets; i++) {
        const key = ASSET_KEYS[i];
        const weight = allocation[key];
        portRet += (weight / 100) * rets[i];
      }
      
      // Aplikace výnosu na celou hodnotu (včetně nového příspěvku)
      value = value * (1 + portRet);
      
      // Zaznamenej hodnotu na konci každého roku
      if (month % 12 === 0) values.push(value);
    }
    allSimulations.push(values);
  }

  console.log("Simulations completed, calculating percentiles...");

  // Výpočet percentilů pro každý rok
  const results: SimulationResult[] = [];
  for (let year = 0; year <= years; year++) {
    const yearVals = allSimulations.map(sim => sim[year]).sort((a, b) => a - b);
    const p = (q: number) => yearVals[Math.floor(simulations * q)];
    const mean = yearVals.reduce((acc, v) => acc + v, 0) / yearVals.length;
    results.push({
      year,
      percentile5: p(0.05),
      percentile25: p(0.25),
      percentile50: p(0.50),
      percentile75: p(0.75),
      percentile95: p(0.95),
      mean
    });
  }
  
  console.log("Final results:", results);
  return results;
}