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
} from 'recharts'

interface EvolutionPoint {
  date: string
  value: number
}

interface EvolutionChartProps {
  data: EvolutionPoint[]
  currency?: string
  initialAmount: number
}

export function EvolutionChart({
  data,
  currency = 'EUR',
  initialAmount,
}: EvolutionChartProps) {
  const [isLogScale, setIsLogScale] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
    })
  }

  const chartData = data.map((point) => ({
    date: point.date,
    value: point.value,
    dateFormatted: formatDate(point.date),
  }))

  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Vývoj portfolia
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsLogScale(false)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogScale
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Lineární
          </button>
          <button
            onClick={() => setIsLogScale(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogScale
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Logaritmický
          </button>
        </div>
      </div>

      <div className="h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
              scale={isLogScale ? 'log' : 'auto'}
              domain={isLogScale ? ['auto', 'auto'] : [minValue * 0.9, maxValue * 1.1]}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Hodnota']}
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2 text-sm bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Investováno:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(initialAmount)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Konečná:</span>
          <span className="font-semibold text-green-600">{formatCurrency(data[data.length - 1]?.value || 0)}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Logaritmické zobrazení je vhodné pro dlouhá období, protože lépe ukazuje procentuální změny
      </p>
    </div>
  )
}
