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

interface MonteCarloResult {
  month: number
  percentile5: number
  percentile16: number
  percentile50: number
  percentile84: number
  percentile95: number
}

interface MonteCarloChartProps {
  currentValue: number
  monthlyMean: number
  monthlyStdDev: number
  onCompute: () => Promise<MonteCarloResult[]>
  currency?: string
}

export function MonteCarloChart({
  currentValue,
  monthlyMean,
  monthlyStdDev,
  onCompute,
  currency = 'EUR',
}: MonteCarloChartProps) {
  const [results, setResults] = useState<MonteCarloResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [computed, setComputed] = useState(false)

  const handleCompute = async () => {
    setLoading(true)
    try {
      const data = await onCompute()
      setResults(data)
      setComputed(true)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const chartData = results?.map((r) => ({
    ...r,
    monthLabel: `${Math.floor(r.month / 12)}r ${r.month % 12}m`,
    yearLabel: r.month % 12 === 0 ? `${r.month / 12} let` : '',
  }))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Prognóza (Monte Carlo)
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Nikdo nemůže předpovědět budoucnost. Pro práci s touto nejistotou generujeme rozsah pravděpodobných výsledků pomocí Monte Carlo simulací.
      </p>

      {!computed ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-600 mb-4">
            Simulace generuje 600 možných budoucností portfolia na základě historických statistických vlastností.
          </p>
          <button
            onClick={handleCompute}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Počítám...
              </span>
            ) : (
              'Spustit simulaci'
            )}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Výpočet může trvat několik sekund.
          </p>
        </div>
      ) : (
        <>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorP84" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84CC16" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#84CC16" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorP16" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorP5" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(m) => m % 12 === 0 ? `${m / 12}r` : ''}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => formatCurrency(value)}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      percentile95: 'Skvělé (97.7%)',
                      percentile84: 'Dobré (84.1%)',
                      percentile50: 'Průměr (50%)',
                      percentile16: 'Špatné (15.9%)',
                      percentile5: 'Velmi špatné (2.3%)',
                    }
                    return [formatCurrency(value), labels[name] || name]
                  }}
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
                  fill="url(#colorP95)"
                  name="percentile95"
                />
                <Area
                  type="monotone"
                  dataKey="percentile84"
                  stroke="#84CC16"
                  strokeWidth={1}
                  fill="url(#colorP84)"
                  name="percentile84"
                />
                <Area
                  type="monotone"
                  dataKey="percentile50"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="none"
                  name="percentile50"
                />
                <Area
                  type="monotone"
                  dataKey="percentile16"
                  stroke="#F59E0B"
                  strokeWidth={1}
                  fill="url(#colorP16)"
                  name="percentile16"
                />
                <Area
                  type="monotone"
                  dataKey="percentile5"
                  stroke="#EF4444"
                  strokeWidth={1}
                  fill="url(#colorP5)"
                  name="percentile5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Skvělé (2σ): 97.7%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-lime-500" />
              <span className="text-gray-600">Dobré (σ): 84.1%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Průměr: 50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">Špatné (-σ): 15.9%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Velmi špatné (-2σ): 2.3%</span>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Omezení:</strong> Simulace předpokládá normální rozdělení výnosů, ale reálné výnosy na finančních trzích jsou notoricky nenormální.
          Extrémní události se vyskytují častěji, než by normální rozdělení předpovídalo.
        </p>
      </div>
    </div>
  )
}
