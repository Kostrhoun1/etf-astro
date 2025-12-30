'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalculatorIcon, TrendingUpIcon, DollarIcon } from '../ui/icons';
import { calculateCurrencyImpact } from '../../utils/currencyImpactCalculations'
import type { CurrencyImpactData } from '../../utils/currencyImpactCalculations';
import CurrencyImpactResults from './CurrencyImpactResults';

const CurrencyImpactAnalyzer: React.FC = () => {
  const [portfolioValue, setPortfolioValue] = useState<number>(1000000);
  const [usdAllocation, setUsdAllocation] = useState<number>(60);
  const [eurAllocation, setEurAllocation] = useState<number>(30);
  const [czkAllocation, setCzkAllocation] = useState<number>(10);
  const [investmentHorizon, setInvestmentHorizon] = useState<number>(10);
  const [currentUsdCzk, setCurrentUsdCzk] = useState<number>(23.5);
  const [currentEurCzk, setCurrentEurCzk] = useState<number>(25.2);
  const [results, setResults] = useState<CurrencyImpactData | null>(null);
  
  // Nové stavy pro carry cost kalkulačku
  const [usdInterestRate, setUsdInterestRate] = useState<number>(5.5);
  const [eurInterestRate, setEurInterestRate] = useState<number>(4.5);
  const [unhedgedTer, setUnhedgedTer] = useState<number>(0.07);
  const [hedgedTer, setHedgedTer] = useState<number>(0.10);
  const [showCarryCost, setShowCarryCost] = useState<boolean>(false);

  const handleCalculate = () => {
    // Normalizace alokace na 100%
    const totalAllocation = usdAllocation + eurAllocation + czkAllocation;
    const normalizedUsd = (usdAllocation / totalAllocation) * 100;
    const normalizedEur = (eurAllocation / totalAllocation) * 100;
    const normalizedCzk = (czkAllocation / totalAllocation) * 100;

    const params = {
      portfolioValue,
      allocations: {
        usd: normalizedUsd,
        eur: normalizedEur,
        czk: normalizedCzk
      },
      investmentHorizon,
      currentRates: {
        usdCzk: currentUsdCzk,
        eurCzk: currentEurCzk
      }
    };
    
    const calculatedResults = calculateCurrencyImpact(params);
    setResults(calculatedResults);
  };

  const totalAllocation = usdAllocation + eurAllocation + czkAllocation;
  const isAllocationValid = Math.abs(totalAllocation - 100) < 0.1;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Portfolio základna */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.2s]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors hover-scale">
              <TrendingUpIcon className="h-5 w-5 text-violet-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">Portfolio základna</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="portfolioValue" className="">Celková hodnota portfolia (Kč)</Label>
              <Input
                id="portfolioValue"
                type="number"
                value={portfolioValue || ''}
                onChange={(e) => setPortfolioValue(Number(e.target.value) || 0)}
                min="10000"
                step="50000"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="investmentHorizon" className="">Investiční horizont (roky)</Label>
              <Input
                id="investmentHorizon"
                type="number"
                value={investmentHorizon || ''}
                onChange={(e) => setInvestmentHorizon(Number(e.target.value) || 0)}
                min="1"
                max="30"
                className="h-10"
              />
            </div>
          </div>
        </div>

        {/* Aktuální kurzy */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.4s]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-emerald-100 w-10 h-10 group-hover:bg-emerald-200 transition-colors hover-scale">
              <DollarIcon className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Aktuální kurzy</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="currentUsdCzk" className="">USD/CZK kurz</Label>
              <Input
                id="currentUsdCzk"
                type="number"
                value={currentUsdCzk || ''}
                onChange={(e) => setCurrentUsdCzk(Number(e.target.value) || 0)}
                min="15"
                max="35"
                step="0.1"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="currentEurCzk" className="">EUR/CZK kurz</Label>
              <Input
                id="currentEurCzk"
                type="number"
                value={currentEurCzk || ''}
                onChange={(e) => setCurrentEurCzk(Number(e.target.value) || 0)}
                min="20"
                max="30"
                step="0.1"
                className="h-10"
              />
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-800">
                <strong>Tip:</strong> Zadejte aktuální kurzy nebo je upravte pro analýzu různých scénářů.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Měnová expozice */}
      <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.6s]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center rounded-full bg-blue-100 w-10 h-10 group-hover:bg-blue-200 transition-colors hover-scale">
            <span className="h-5 w-5 text-blue-700 flex items-center justify-center">€</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">Měnová expozice portfolia</h3>
        </div>
        <div className="space-y-3">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="usdAllocation" className="">USD alokace (%)</Label>
              <Input
                id="usdAllocation"
                type="number"
                value={usdAllocation || ''}
                onChange={(e) => setUsdAllocation(Number(e.target.value) || 0)}
                min="0"
                max="100"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="eurAllocation" className="">EUR alokace (%)</Label>
              <Input
                id="eurAllocation"
                type="number"
                value={eurAllocation || ''}
                onChange={(e) => setEurAllocation(Number(e.target.value) || 0)}
                min="0"
                max="100"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="czkAllocation" className="">CZK alokace (%)</Label>
              <Input
                id="czkAllocation"
                type="number"
                value={czkAllocation || ''}
                onChange={(e) => setCzkAllocation(Number(e.target.value) || 0)}
                min="0"
                max="100"
                className="h-10"
              />
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-sm text-amber-800 mb-1">
              <strong>⚠️ Důležité:</strong> Zadejte expozici podle <strong>podkladových aktiv</strong>, ne podle měny fondu!
            </p>
            <p className="text-xs text-amber-700">
              Například: SXR8 (EUR fond kupující US akcie) = 100% USD expozice
            </p>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="font-medium text-blue-800">Celková expozice:</span>
            <span className={`font-bold ${isAllocationValid ? 'text-green-600' : 'text-red-600'}`}>
              {totalAllocation.toFixed(1)}%
            </span>
          </div>
          {!isAllocationValid && (
            <p className="text-sm text-red-600">
              ⚠️ Celková expozice by měla být 100%. Automaticky se normalizuje při výpočtu.
            </p>
          )}
        </div>
      </div>


      <Button 
        onClick={handleCalculate} 
        className="w-full hover-scale bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 animate-fade-in [animation-delay:0.8s]"
      >
        <CalculatorIcon className="mr-2 h-5 w-5" />
        Analyzovat kurzový dopad
      </Button>
      

      {results && (
        <CurrencyImpactResults results={results} />
      )}
    </div>
  );
};

export default CurrencyImpactAnalyzer;