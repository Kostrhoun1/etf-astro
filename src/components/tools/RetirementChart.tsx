'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FireData } from '../../utils/retirementCalculations';

interface RetirementChartProps {
  results: FireData;
}

const RetirementChart: React.FC<RetirementChartProps> = ({ results }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Příprava dat pro FIRE scénáře - kombinujeme všechny tři scénáře
  const maxLength = Math.max(
    results.scenarios.optimistic.projectionData.length,
    results.scenarios.realistic.projectionData.length,
    results.scenarios.pessimistic.projectionData.length
  );

  const scenarioData = [];
  for (let i = 0; i < maxLength; i++) {
    const optimistic = results.scenarios.optimistic.projectionData[i];
    const realistic = results.scenarios.realistic.projectionData[i];
    const pessimistic = results.scenarios.pessimistic.projectionData[i];
    
    if (realistic) {
      scenarioData.push({
        age: realistic.age,
        year: realistic.year,
        optimisticValue: optimistic?.portfolioValue || 0,
        realisticValue: realistic.portfolioValue,
        pessimisticValue: pessimistic?.portfolioValue || 0,
        optimisticReal: optimistic?.realValue || 0,
        realisticReal: realistic.realValue,
        pessimisticReal: pessimistic?.realValue || 0,
        contributions: realistic.cumulativeContributions,
        fireProgress: realistic.fireProgress * 100, // Konverze na procenta
        fireTarget: results.fireTarget
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* FIRE Timeline Scénáře */}
      <div className="border-transparent shadow-none hover:shadow-xl transition-all duration-300 group bg-white rounded-2xl p-8 card-hover animate-fade-in [animation-delay:0.2s]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center rounded-full bg-violet-100 w-12 h-12 group-hover:bg-violet-200 transition-colors hover-scale">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-violet-800 transition-colors">
            FIRE Scénáře - Cesta k finanční nezávislosti
          </h2>
        </div>
        <div className="rounded-xl p-4">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={scenarioData} margin={{ top: 10, right: 20, left: 100, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Věk', position: 'insideBottom', offset: -10, style: { fontSize: '14px', fontWeight: 'bold', fill: '#475569' } }}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                width={100}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(age: number) => `Věk: ${age} let`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  fontSize: '14px',
                  padding: '12px 16px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '25px', fontSize: '13px', fontWeight: '500' }}
                iconType="circle"
                verticalAlign="bottom"
                height={40}
              />
              <Area
                type="monotone"
                dataKey="optimisticValue"
                stroke="#10b981"
                fill="url(#optimisticGradient)"
                strokeWidth={3}
                name="Optimistický scénář (20%)"
              />
              <Area
                type="monotone"
                dataKey="realisticValue"
                stroke="#8b5cf6"
                fill="url(#realisticGradient)"
                strokeWidth={4}
                name="Realistický scénář (60%)"
              />
              <Area
                type="monotone"
                dataKey="pessimisticValue"
                stroke="#ef4444"
                fill="url(#pessimisticGradient)"
                strokeWidth={3}
                name="Pesimistický scénář (20%)"
              />
              <defs>
                <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="realisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="pessimisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FIRE Progress */}
      <div className="border-transparent shadow-none hover:shadow-xl transition-all duration-300 group bg-white rounded-2xl p-8 card-hover animate-fade-in [animation-delay:0.4s]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center rounded-full bg-emerald-100 w-12 h-12 group-hover:bg-emerald-200 transition-colors hover-scale">
            <span className="text-2xl">📈</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
            Pokrok k FIRE cíli
          </h2>
        </div>
        <div className="rounded-xl p-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={scenarioData} margin={{ top: 10, right: 20, left: 60, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" strokeOpacity={0.8} />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Věk', position: 'insideBottom', offset: -10, style: { fontSize: '14px', fontWeight: 'bold', fill: '#059669' } }}
                tick={{ fontSize: 12, fill: '#047857' }}
                axisLine={{ stroke: '#10b981', strokeWidth: 2 }}
                tickLine={{ stroke: '#10b981' }}
              />
              <YAxis 
                domain={[0, 100]}
                label={{ value: 'Pokrok k FIRE (%)', angle: -90, position: 'insideLeft', style: { fontSize: '14px', fontWeight: 'bold', fill: '#059669' } }}
                tick={{ fontSize: 12, fill: '#047857' }}
                axisLine={{ stroke: '#10b981', strokeWidth: 2 }}
                tickLine={{ stroke: '#10b981' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Pokrok k FIRE']}
                labelFormatter={(age: number) => `Věk: ${age} let`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  fontSize: '14px',
                  padding: '12px 16px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#047857' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '25px', fontSize: '13px', fontWeight: '500' }}
                iconType="circle"
                verticalAlign="bottom"
                height={40}
              />
              <Line
                type="monotone"
                dataKey="fireProgress"
                stroke="#10b981"
                strokeWidth={4}
                name="Pokrok k FIRE (realistický scénář)"
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#059669', strokeWidth: 3, stroke: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reálná vs Nominální hodnota */}
      <div className="border-transparent shadow-none hover:shadow-xl transition-all duration-300 group bg-white rounded-2xl p-8 card-hover animate-fade-in [animation-delay:0.6s]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center rounded-full bg-orange-100 w-12 h-12 group-hover:bg-orange-200 transition-colors hover-scale">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-800 transition-colors">
            Reálná vs Nominální hodnota portfolia
          </h2>
        </div>
        <div className="rounded-xl p-4">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={scenarioData} margin={{ top: 10, right: 20, left: 100, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.8} />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Věk', position: 'insideBottom', offset: -10, style: { fontSize: '14px', fontWeight: 'bold', fill: '#ea580c' } }}
                tick={{ fontSize: 12, fill: '#c2410c' }}
                axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
                tickLine={{ stroke: '#f97316' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                width={100}
                tick={{ fontSize: 12, fill: '#c2410c' }}
                axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
                tickLine={{ stroke: '#f97316' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(age: number) => `Věk: ${age} let`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  fontSize: '14px',
                  padding: '12px 16px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#c2410c' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '25px', fontSize: '13px', fontWeight: '500' }}
                iconType="circle"
                verticalAlign="bottom"
                height={40}
              />
              <Area
                type="monotone"
                dataKey="realisticValue"
                stroke="#8b5cf6"
                fill="url(#nominalGradient)"
                strokeWidth={3}
                name="Nominální hodnota"
              />
              <Area
                type="monotone"
                dataKey="realisticReal"
                stroke="#10b981"
                fill="url(#realGradient)"
                strokeWidth={4}
                name="Reálná hodnota (kupní síla)"
              />
              <Area
                type="monotone"
                dataKey="contributions"
                stroke="#f59e0b"
                fill="url(#contributionsGradient)"
                strokeWidth={3}
                name="Celkové příspěvky"
              />
              <defs>
                <linearGradient id="nominalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="contributionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default RetirementChart;