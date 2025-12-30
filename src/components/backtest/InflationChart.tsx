'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface TimeSeriesPoint {
  date: string
  value: number
}

interface InflationChartProps {
  evolution: TimeSeriesPoint[]
  nominalCAGR: number
  inflationRate?: number // Default 3.3% for Czech Republic geometric average (2004-2024)
  currency?: string
}

export function InflationChart({
  evolution,
  nominalCAGR,
  inflationRate = 0.033,
  currency = 'EUR',
}: InflationChartProps) {
  const [scale, setScale] = useState<'linear' | 'log'>('linear')

  const realCAGR = ((1 + nominalCAGR) / (1 + inflationRate)) - 1

  // Calculate real values adjusted for inflation
  const startDate = evolution.length > 0 ? new Date(evolution[0].date) : new Date()

  const chartData = evolution.map((point) => {
    const currentDate = new Date(point.date)
    const years = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    const inflationFactor = Math.pow(1 + inflationRate, years)
    const realValue = point.value / inflationFactor

    return {
      date: point.date,
      dateFormatted: currentDate.toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'short',
      }),
      nominal: point.value,
      real: realValue,
    }
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Dopad inflace
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Nominální výnosy nezohledňují inflaci. Reálné výnosy ano.
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700">Nominální roční růst</p>
          <p className="text-2xl font-bold text-blue-600">
            {(nominalCAGR * 100).toFixed(2)}%
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700">Reálný roční růst</p>
          <p className="text-2xl font-bold text-green-600">
            {(realCAGR * 100).toFixed(2)}%
            <span className="text-sm font-normal text-gray-500 ml-1">
              ({((realCAGR - nominalCAGR) * 100).toFixed(2)}%)
            </span>
          </p>
        </div>
      </div>

      {/* Scale toggle */}
      <div className="flex justify-end mb-2">
        <div className="inline-flex rounded-lg border border-gray-200">
          <button
            onClick={() => setScale('linear')}
            className={`px-3 py-1 text-sm ${
              scale === 'linear'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'
            } rounded-l-lg`}
          >
            Linear
          </button>
          <button
            onClick={() => setScale('log')}
            className={`px-3 py-1 text-sm ${
              scale === 'log'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'
            } rounded-r-lg`}
          >
            Log
          </button>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="dateFormatted"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              scale={scale}
              domain={scale === 'log' ? ['auto', 'auto'] : [0, 'auto']}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              width={80}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'nominal' ? 'Nominální' : 'Reálná',
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend
              formatter={(value) => (value === 'nominal' ? 'Nominální hodnota' : 'Reálná hodnota')}
            />
            <Area
              type="monotone"
              dataKey="nominal"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNominal)"
            />
            <Area
              type="monotone"
              dataKey="real"
              stroke="#22C55E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Pozn.:</strong> Pro výpočet reálných výnosů používáme průměrnou roční inflaci {(inflationRate * 100).toFixed(1)}% (průměr ČR 2004-2024 dle ČSÚ).
          Skutečná inflace se v jednotlivých letech výrazně liší (např. 2022: 15,1%, 2015: 0,3%).
        </p>
      </div>
    </div>
  )
}
