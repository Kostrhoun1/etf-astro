'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PiggyBankIcon, CalendarIcon, AlertIcon, CalculatorIcon, TargetIcon, PercentIcon, TrendingUpIcon } from '../ui/icons';
import { calculateFire, getPortfolioParameters } from '../../utils/retirementCalculations'
import type { FireData, FireCalculationParams } from '../../utils/retirementCalculations';
import RetirementChart from './RetirementChart';
import RetirementResultsSummary from './RetirementResultsSummary';

const FireCalculator: React.FC = () => {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [currentSavings, setCurrentSavings] = useState<number>(500000);
  const [monthlySavings, setMonthlySavings] = useState<number>(15000);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [monthlyExpensesInFire, setMonthlyExpensesInFire] = useState<number>(40000);
  const [investmentStrategy, setInvestmentStrategy] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [results, setResults] = useState<FireData | null>(null);

  const handleCalculate = () => {
    const params: FireCalculationParams = {
      currentAge,
      currentSavings,
      monthlySavings,
      monthlyExpensesInFire,
      inflationRate,
      investmentStrategy
    };
    
    const calculatedResults = calculateFire(params);
    setResults(calculatedResults);
  };

  const fireTarget = monthlyExpensesInFire * 12 * 25; // 4% rule
  const currentExpectedReturn = getPortfolioParameters(investmentStrategy).expectedReturn;
  
  // Odhad kdy dosáhnu FIRE při současných nastaveních
  let estimatedFireAge = currentAge;
  let portfolioValue = currentSavings;
  for (let year = 0; year < 50; year++) {
    if (year > 0) {
      portfolioValue += monthlySavings * 12;
      portfolioValue *= (1 + currentExpectedReturn / 100);
    }
    const inflationAdjustedTarget = fireTarget * Math.pow(1 + inflationRate / 100, year);
    if (portfolioValue >= inflationAdjustedTarget) {
      estimatedFireAge = currentAge + year;
      break;
    }
  }
  const yearsToFire = estimatedFireAge - currentAge;
  const monthlyFireIncome = (fireTarget * 0.04) / 12;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Základní údaje o věku a FIRE cíli */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.2s]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors hover-scale">
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
          </div>
        </div>

        {/* Úspory a pravidelné spoření */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.4s]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-emerald-100 w-10 h-10 group-hover:bg-emerald-200 transition-colors hover-scale">
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
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.6s]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors hover-scale">
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


      <Button onClick={handleCalculate} className="w-full hover-scale bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 animate-fade-in [animation-delay:0.8s]">
        <CalculatorIcon className="mr-2 h-5 w-5" />
        Kdy dosáhnu FIRE? (Vypočítat detailní analýzu)
      </Button>

      {/* Rozbalovací předpoklady */}
      <details className="border-transparent shadow-none hover:shadow-sm transition-shadow duration-200 rounded-lg bg-white animate-fade-in [animation-delay:1.0s]">
        <summary className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors rounded-lg group">
          <span className="font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">📋 Předpoklady FIRE kalkulačky (zjednodušený model)</span>
        </summary>
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>Poznámka:</strong> Tato kalkulačka používá zjednodušený model s průměrnými historickými výnosy.
              Pro realistické projekce s tisíci scénářů založených na skutečných historických datech použijte{' '}
              <a href="/kalkulacky/monte-carlo-simulator" className="text-amber-900 underline font-semibold">
                Monte Carlo simulátor
              </a>.
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
            <li>• <strong>FIRE cíl:</strong> 25x ročních výdajů (4% pravidlo)</li>
            <li>• <strong>Portfolio strategie (průměrné historické výnosy 1995-2024):</strong></li>
            <li className="ml-4">◦ Konzervativní: 30% akcií/70% dluhopisů (7,7% výnos, 6,5% volatilita)</li>
            <li className="ml-4">◦ Vyvážené: 60% akcií/40% dluhopisů (8,8% výnos, 10,5% volatilita)</li>
            <li className="ml-4">◦ Agresivní: 80% akcií/20% dluhopisů (9,8% výnos, 13,6% volatilita)</li>
            <li>• <strong>Scénáře pravděpodobnosti:</strong> Optimistický 20%, Realistický 60%, Pesimistický 20%</li>
            <li>• <strong>Výnosy:</strong> Průměrná historická data 1995-2024 z portfoliovisualizer.com</li>
            <li>• <strong>Volatilita:</strong> Simulována pomocí deterministické funkce (ne skutečná distribuce)</li>
            <li>• <strong>Inflace:</strong> 2-3% ročně (ČR dlouhodobý průměr)</li>
            <li>• <strong>Daně:</strong> Nezahrnuje daň z kapitálových výnosů (po 3 letech 0% v ČR)</li>
            <li>• <strong>Státní důchod:</strong> Nezahrnuje I. a II. pilíř (počítejte jako bonus k FIRE)</li>
          </ul>
        </div>
      </details>

      {results && (
        <div className="space-y-8">
          <RetirementResultsSummary 
            results={results} 
            originalParams={{
              currentAge,
              currentSavings,
              monthlySavings,
              monthlyExpensesInFire,
              inflationRate,
              investmentStrategy
            }}
          />
          <RetirementChart results={results} />
        </div>
      )}
    </div>
  );
};

export default FireCalculator;