'use client';

import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PercentIcon, PiggyBankIcon, GlobeIcon, TrendingUpIcon, BuildingIcon } from '../ui/icons';

interface FeeCalculatorFormProps {
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
}

const FeeCalculatorForm: React.FC<FeeCalculatorFormProps> = ({
  initialInvestment,
  setInitialInvestment,
  recurringInvestment,
  setRecurringInvestment,
  recurringFrequency,
  setRecurringFrequency,
  averageReturn,
  setAverageReturn,
  investmentPeriod,
  setInvestmentPeriod
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Investiční parametry */}
      <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.2s]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors hover-scale">
            <PiggyBankIcon className="h-5 w-5 text-violet-700" />
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
              placeholder="100 000"
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
              placeholder="5 000"
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="frequency">Frekvence pravidelné investice</Label>
            <Select value={recurringFrequency} onValueChange={(value: 'monthly' | 'yearly') => setRecurringFrequency(value)}>
              <SelectTrigger className="h-10">
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
            <TrendingUpIcon className="h-5 w-5 text-emerald-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Parametry výnosu a času</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="return">Průměrný roční výnos (%)</Label>
            <Input
              id="return"
              type="number"
              step="0.1"
              value={averageReturn || ''}
              onChange={(e) => setAverageReturn(Number(e.target.value) || 0)}
              placeholder="7"
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="period">Doba investice (roky)</Label>
            <Input
              id="period"
              type="number"
              value={investmentPeriod || ''}
              onChange={(e) => setInvestmentPeriod(Number(e.target.value) || 0)}
              placeholder="20"
              className="h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeCalculatorForm;