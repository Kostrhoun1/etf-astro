'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalculatorIcon, PercentIcon, TrendingUpIcon } from '../ui/icons';

interface InvestmentCalculatorFormProps {
  initialInvestment: number;
  setInitialInvestment: (value: number) => void;
  recurringInvestment: number;
  setRecurringInvestment: (value: number) => void;
  recurringFrequency: 'monthly' | 'yearly';
  setRecurringFrequency: (value: 'monthly' | 'yearly') => void;
  averageReturn: number;
  setAverageReturn: (value: number) => void;
  investmentPeriod: number;
  setInvestmentPeriod: (value: number) => void;
  taxRate: number;
  setTaxRate: (value: number) => void;
  onCalculate: () => void;
}

const InvestmentCalculatorForm: React.FC<InvestmentCalculatorFormProps> = ({
  initialInvestment,
  setInitialInvestment,
  recurringInvestment,
  setRecurringInvestment,
  recurringFrequency,
  setRecurringFrequency,
  averageReturn,
  setAverageReturn,
  investmentPeriod,
  setInvestmentPeriod,
  taxRate,
  setTaxRate,
  onCalculate
}) => {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Investiční parametry */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.2s]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors hover-scale">
              <TrendingUpIcon className="h-5 w-5 text-violet-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">Investiční parametry</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="initial">Jednorázová investice (Kč)</Label>
              <Input
                id="initial"
                type="number"
                value={initialInvestment || ''}
                onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)}
                placeholder="0"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="recurring">Pravidelná investice (Kč)</Label>
              <Input
                id="recurring"
                type="number"
                value={recurringInvestment || ''}
                onChange={(e) => setRecurringInvestment(Number(e.target.value) || 0)}
                placeholder="0"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frekvence investování</Label>
              <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                <SelectTrigger id="frequency" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Měsíčně</SelectItem>
                  <SelectItem value="yearly">Ročně</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Parametry výnosu a času */}
        <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.4s]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full bg-emerald-100 w-10 h-10 group-hover:bg-emerald-200 transition-colors hover-scale">
              <PercentIcon className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Parametry výnosu a času</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="return">Průměrný roční výnos (%)</Label>
              <Input
                id="return"
                type="number"
                value={averageReturn || ''}
                onChange={(e) => setAverageReturn(Number(e.target.value) || 0)}
                placeholder="7"
                step="0.1"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="period">Investiční horizont (roky)</Label>
              <Input
                id="period"
                type="number"
                value={investmentPeriod || ''}
                onChange={(e) => setInvestmentPeriod(Number(e.target.value) || 0)}
                placeholder="20"
                min="1"
                max="50"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="tax">Daňová sazba (%)</Label>
              <Input
                id="tax"
                type="number"
                value={taxRate || ''}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                placeholder="0"
                min="0"
                max="50"
                step="0.1"
                className="h-10"
              />
            </div>
          </div>
        </div>
      </div>

      <Button onClick={onCalculate} className="w-full hover-scale bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 animate-fade-in [animation-delay:0.6s]">
        <CalculatorIcon className="mr-2 h-5 w-5" />
        Vypočítat investiční růst
      </Button>
    </div>
  );
};

export default InvestmentCalculatorForm;