'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface DrawdownPeriod {
  startDate: string
  troughDate: string
  endDate: string | null
  depth: number
  lengthMonths: number
  recovered: boolean
}

interface TimeSeriesPoint {
  date: string
  value: number
}

interface DrawdownChartProps {
  evolution: TimeSeriesPoint[]
  maxDrawdown: DrawdownPeriod
  longestDrawdown: DrawdownPeriod
}

export function DrawdownChart({
  evolution,
  maxDrawdown,
  longestDrawdown,
}: DrawdownChartProps) {
  // Calculate drawdown at each point
  let peak = evolution[0]?.value || 0
  const chartData = evolution.map((point) => {
    if (point.value > peak) {
      peak = point.value
    }
    const drawdown = ((point.value - peak) / peak) * 100

    return {
      date: point.date,
      dateFormatted: new Date(point.date).toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'short',
      }),
      drawdown,
    }
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
    })
  }

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years === 0) {
      return `${remainingMonths} měsíců`
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'rok' : years < 5 ? 'roky' : 'let'}`
    } else {
      return `${years} ${years === 1 ? 'rok' : years < 5 ? 'roky' : 'let'} a ${remainingMonths} měsíců`
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Drawdown analýza
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Nejhlubší propad
          </h4>
          <p className="text-2xl font-bold text-red-600">
            {(maxDrawdown.depth * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-red-600 mt-1">
            {formatDate(maxDrawdown.startDate)} → {formatDate(maxDrawdown.troughDate)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Délka: {formatMonths(maxDrawdown.lengthMonths)}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-800 mb-2">
            Nejdelší propad
          </h4>
          <p className="text-2xl font-bold text-orange-600">
            {formatMonths(longestDrawdown.lengthMonths)}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Hloubka: {(longestDrawdown.depth * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {longestDrawdown.recovered ? 'Zotaveno' : 'Nezotaveno'}
          </p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
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
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              domain={['auto', 0]}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Drawdown']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDrawdown)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Drawdown ukazuje procentuální pokles od předchozího maxima. Čím hlubší
        propad, tím větší ztráta musíte ustát při investici.
      </p>
    </div>
  )
}
