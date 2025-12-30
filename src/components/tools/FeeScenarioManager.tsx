'use client';

import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface FeeScenario {
  name: string;
  totalExpenseRatio: number;
  entryFee: number;
  color: string;
}

interface FeeScenarioManagerProps {
  scenarios: FeeScenario[];
  updateScenario: (index: number, field: keyof FeeScenario, value: string | number) => void;
}

const FeeScenarioManager: React.FC<FeeScenarioManagerProps> = ({
  scenarios,
  updateScenario
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Scénáře poplatků</h3>
      <div className="grid gap-4">
        {scenarios.map((scenario, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>Název scénáře</Label>
              <Input
                value={scenario.name}
                onChange={(e) => updateScenario(index, 'name', e.target.value)}
                placeholder="Název"
              />
            </div>
            <div className="space-y-2">
              <Label>TER - celkové % roční náklady</Label>
              <Input
                type="number"
                step="0.01"
                value={scenario.totalExpenseRatio || ''}
                onChange={(e) => updateScenario(index, 'totalExpenseRatio', e.target.value)}
                placeholder="0.15"
              />
            </div>
            <div className="space-y-2">
              <Label>Vstupní poplatek (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={scenario.entryFee || ''}
                onChange={(e) => updateScenario(index, 'entryFee', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Vysvětlení poplatků:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>TER (Total Expense Ratio):</strong> Roční náklady na správu fondu v % z investované částky</li>
          <li><strong>Vstupní poplatek:</strong> Jednorázový poplatek při nákupu v % z investované částky</li>
        </ul>
      </div>
    </div>
  );
};

export default FeeScenarioManager;