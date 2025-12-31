'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalendarIcon, CalculatorIcon, TargetIcon, TrendingUpIcon, LoaderIcon, AlertIcon } from '../ui/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Portfolio strategies mapped to actual ETF indexes (same as Monte Carlo)
const PORTFOLIO_STRATEGIES = {
  conservative: {
    name: 'Konzervativní (30/70)',
    description: '30% akcie, 70% dluhopisy',
    portfolio: [
      { isin: 'IE00B5BMR087', name: 'iShares Core S&P 500', weight: 0.30, ter: 0.0007, indexCode: 'sp500' },
      { isin: 'IE00B4WXJJ64', name: 'iShares Core EUR Govt Bond', weight: 0.70, ter: 0.0007, indexCode: 'eur_govt_bond' },
    ],
  },
  moderate: {
    name: 'Vyvážené (60/40)',
    description: '60% akcie, 40% dluhopisy',
    portfolio: [
      { isin: 'IE00B5BMR087', name: 'iShares Core S&P 500', weight: 0.60, ter: 0.0007, indexCode: 'sp500' },
      { isin: 'IE00B4WXJJ64', name: 'iShares Core EUR Govt Bond', weight: 0.40, ter: 0.0007, indexCode: 'eur_govt_bond' },
    ],
  },
  aggressive: {
    name: 'Agresivní (80/20)',
    description: '80% akcie, 20% dluhopisy',
    portfolio: [
      { isin: 'IE00B5BMR087', name: 'iShares Core S&P 500', weight: 0.80, ter: 0.0007, indexCode: 'sp500' },
      { isin: 'IE00B4WXJJ64', name: 'iShares Core EUR Govt Bond', weight: 0.20, ter: 0.0007, indexCode: 'eur_govt_bond' },
    ],
  },
};

interface FireResults {
  fireTarget: number;
  chartData: Array<{
    year: number;
    age: number;
    percentile5: number;
    percentile16: number;
    percentile50: number;
    percentile84: number;
    percentile95: number;
    fireTarget: number;
    contributions: number;
  }>;
  fireAges: {
    pessimistic: number | null; // 16th percentile
    realistic: number | null;   // 50th percentile
    optimistic: number | null;  // 84th percentile
  };
  stats: {
    annualMean: number;
    annualStdDev: number;
  };
  finalValues: {
    veryBad: number;
    bad: number;
    average: number;
    good: number;
    great: number;
  };
}

const FireCalculatorBacktest: React.FC = () => {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [currentSavings, setCurrentSavings] = useState<number>(500000);
  const [monthlySavings, setMonthlySavings] = useState<number>(15000);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [monthlyExpensesInFire, setMonthlyExpensesInFire] = useState<number>(40000);
  const [investmentStrategy, setInvestmentStrategy] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  const [results, setResults] = useState<FireResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fireTarget = monthlyExpensesInFire * 12 * 25; // 4% rule

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const strategy = PORTFOLIO_STRATEGIES[investmentStrategy];

      // Call Monte Carlo API with 50 years forecast
      // useInitialAmountAsStart: true means Monte Carlo starts from currentSavings
      // (not from historical backtest final value)
      const response = await fetch('/api/backtest/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio: strategy.portfolio,
          startDate: '2005-01-01',
          endDate: new Date().toISOString().split('T')[0],
          initialAmount: currentSavings,
          forecastYears: 50,
          simulations: 800,
          useInitialAmountAsStart: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run simulation');
      }

      const data = await response.json();

      // Process chart data with contributions and inflation-adjusted FIRE target
      const chartData: FireResults['chartData'] = [];
      const yearlyContribution = monthlySavings * 12;
      const yearlyInflation = inflationRate / 100;

      // Annual growth rate from historical data (for contribution growth estimation)
      const annualGrowthRate = 1 + data.stats.annualMean;

      // Initialize fire ages
      const fireAges: FireResults['fireAges'] = {
        pessimistic: null,
        realistic: null,
        optimistic: null,
      };

      // Track cumulative contributions with estimated growth
      let contributionValue = 0;
      let totalContributed = currentSavings;

      for (let year = 0; year <= 50; year++) {
        const month = year * 12;
        const monthData = data.chartData[month];

        if (!monthData) continue;

        const age = currentAge + year;

        // Add yearly contribution with growth
        if (year > 0) {
          // Previous contributions grow by one year
          contributionValue *= annualGrowthRate;
          // Add new contribution
          contributionValue += yearlyContribution;
          totalContributed += yearlyContribution;
        }

        // Monte Carlo values represent growth of initial savings
        // Add contribution value to each percentile
        const scaledP5 = monthData.percentile5 + contributionValue;
        const scaledP16 = monthData.percentile16 + contributionValue;
        const scaledP50 = monthData.percentile50 + contributionValue;
        const scaledP84 = monthData.percentile84 + contributionValue;
        const scaledP95 = monthData.percentile95 + contributionValue;

        // Inflation-adjusted FIRE target
        const currentFireTarget = fireTarget * Math.pow(1 + yearlyInflation, year);

        chartData.push({
          year,
          age,
          percentile5: scaledP5,
          percentile16: scaledP16,
          percentile50: scaledP50,
          percentile84: scaledP84,
          percentile95: scaledP95,
          fireTarget: currentFireTarget,
          contributions: totalContributed,
        });

        // Check when each percentile crosses FIRE target
        if (fireAges.pessimistic === null && scaledP16 >= currentFireTarget) {
          fireAges.pessimistic = age;
        }
        if (fireAges.realistic === null && scaledP50 >= currentFireTarget) {
          fireAges.realistic = age;
        }
        if (fireAges.optimistic === null && scaledP84 >= currentFireTarget) {
          fireAges.optimistic = age;
        }
      }

      setResults({
        fireTarget,
        chartData,
        fireAges,
        stats: {
          annualMean: data.stats.annualMean,
          annualStdDev: data.stats.annualStdDev,
        },
        finalValues: data.finalValues,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h4 className="font-semibold text-emerald-800">Realistické projekce z historických dat</h4>
            <p className="text-sm text-emerald-700">
              Tato kalkulačka používá Monte Carlo simulaci s reálnými historickými daty (2005-2024).
              Výsledky ukazují percentilové rozsahy založené na tisících možných scénářů.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Základní údaje o věku a FIRE cíli */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors">
              <CalendarIcon className="h-5 w-5 text-violet-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">Věk a FIRE cíl</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="currentAge">Současný věk</Label>
              <Input
                id="currentAge"
                type="number"
                value={currentAge || ''}
                onChange={(e) => setCurrentAge(Number(e.target.value) || 0)}
                min="18"
                max="80"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="monthlyExpensesInFire">Měsíční výdaje při FIRE v dnešních cenách (Kč)</Label>
              <Input
                id="monthlyExpensesInFire"
                type="number"
                value={monthlyExpensesInFire || ''}
                onChange={(e) => setMonthlyExpensesInFire(Number(e.target.value) || 0)}
                min="10000"
                step="5000"
                className="h-10"
              />
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              FIRE cíl (25x): <strong>{formatCurrency(fireTarget)}</strong>
            </div>
          </div>
        </div>

        {/* Úspory a pravidelné spoření */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-emerald-100 w-10 h-10 group-hover:bg-emerald-200 transition-colors">
              <TrendingUpIcon className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Úspory a spoření</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="currentSavings">Současné úspory (Kč)</Label>
              <Input
                id="currentSavings"
                type="number"
                value={currentSavings || ''}
                onChange={(e) => setCurrentSavings(Number(e.target.value) || 0)}
                min="0"
                step="10000"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="monthlySavings">Měsíční spoření (Kč)</Label>
              <Input
                id="monthlySavings"
                type="number"
                value={monthlySavings || ''}
                onChange={(e) => setMonthlySavings(Number(e.target.value) || 0)}
                min="0"
                step="1000"
                className="h-10"
              />
            </div>
          </div>
        </div>

        {/* Investiční strategie */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors">
              <TargetIcon className="h-5 w-5 text-violet-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">Investiční strategie</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="investmentStrategy">Portfolio strategie</Label>
              <Select value={investmentStrategy} onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => setInvestmentStrategy(value)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">🛡️ Konzervativní - 30% akcií/70% dluhopisů</SelectItem>
                  <SelectItem value="moderate">⚖️ Vyvážené - 60% akcií/40% dluhopisů</SelectItem>
                  <SelectItem value="aggressive">🚀 Agresivní - 80% akcií/20% dluhopisů</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="inflationRate">Roční inflace (%)</Label>
              <Input
                id="inflationRate"
                type="number"
                value={inflationRate || ''}
                onChange={(e) => setInflationRate(Number(e.target.value) || 0)}
                min="0"
                max="10"
                step="0.1"
                className="h-10"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleCalculate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white font-semibold py-3"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoaderIcon className="h-5 w-5 animate-spin" />
            Generuji Monte Carlo simulaci...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CalculatorIcon className="h-5 w-5" />
            Kdy dosáhnu FIRE? (Monte Carlo simulace)
          </span>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">Chyba</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6 mt-8">
          {/* FIRE Ages Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Kdy dosáhnete FIRE? (na základě {800} historických scénářů)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-700 mb-1">Pesimistický scénář (16. percentil)</p>
                <p className="text-3xl font-bold text-amber-800">
                  {results.fireAges.pessimistic ? `${results.fireAges.pessimistic} let` : 'Nedosaženo'}
                </p>
                {results.fireAges.pessimistic && (
                  <p className="text-sm text-amber-600 mt-1">
                    za {results.fireAges.pessimistic - currentAge} let
                  </p>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-700 mb-1">Realistický scénář (50. percentil)</p>
                <p className="text-3xl font-bold text-blue-800">
                  {results.fireAges.realistic ? `${results.fireAges.realistic} let` : 'Nedosaženo'}
                </p>
                {results.fireAges.realistic && (
                  <p className="text-sm text-blue-600 mt-1">
                    za {results.fireAges.realistic - currentAge} let
                  </p>
                )}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Optimistický scénář (84. percentil)</p>
                <p className="text-3xl font-bold text-green-800">
                  {results.fireAges.optimistic ? `${results.fireAges.optimistic} let` : 'Nedosaženo'}
                </p>
                {results.fireAges.optimistic && (
                  <p className="text-sm text-green-600 mt-1">
                    za {results.fireAges.optimistic - currentAge} let
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Historical Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiky z historických dat (2005-2024)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Průměrný roční výnos</p>
                <p className="text-xl font-bold text-gray-900">{(results.stats.annualMean * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Roční volatilita</p>
                <p className="text-xl font-bold text-gray-900">{(results.stats.annualStdDev * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">FIRE cíl</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(results.fireTarget)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Portfolio</p>
                <p className="text-xl font-bold text-gray-900">{PORTFOLIO_STRATEGIES[investmentStrategy].name}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Projekce portfolia vs FIRE cíl
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Barevná pásma ukazují rozsah možných hodnot portfolia na základě historických scénářů.
              Červená čára je váš FIRE cíl upravený o inflaci.
            </p>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={results.chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fireColorP95" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fireColorP84" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84CC16" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#84CC16" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fireColorP16" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    label={{ value: 'Věk', position: 'bottom', offset: -5 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        percentile95: 'Skvělý scénář (97.7%)',
                        percentile84: 'Optimistický (84%)',
                        percentile50: 'Realistický (50%)',
                        percentile16: 'Pesimistický (16%)',
                        percentile5: 'Velmi špatný (2.3%)',
                        fireTarget: 'FIRE cíl',
                        contributions: 'Investováno',
                      };
                      return [formatCurrency(value), labels[name] || name];
                    }}
                    labelFormatter={(label) => `Věk: ${label} let`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile95"
                    stroke="#22C55E"
                    strokeWidth={1}
                    fill="url(#fireColorP95)"
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile84"
                    stroke="#84CC16"
                    strokeWidth={1}
                    fill="url(#fireColorP84)"
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile50"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile16"
                    stroke="#F59E0B"
                    strokeWidth={1}
                    fill="url(#fireColorP16)"
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile5"
                    stroke="#EF4444"
                    strokeWidth={1}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="fireTarget"
                    stroke="#DC2626"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    stroke="#9CA3AF"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">Skvělý (+2σ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <span className="text-gray-600">Optimistický (+σ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Realistický</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600">Pesimistický (-σ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">Velmi špatný (-2σ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-red-600" style={{ borderTop: '2px dashed #DC2626' }} />
                <span className="text-gray-600">FIRE cíl</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Důležité upozornění</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Výsledky jsou založeny na historických datech 2005-2024 a Monte Carlo simulaci</li>
              <li>Budoucí výnosy mohou být odlišné od historických</li>
              <li>Nezohledňuje daně, transakční poplatky ani změny v inflaci</li>
              <li>Pro komplexnější analýzu použijte více scénářů a strategií</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireCalculatorBacktest;
