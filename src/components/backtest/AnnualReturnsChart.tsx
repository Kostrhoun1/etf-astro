'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

interface AnnualReturn {
  year: number
  return: number
}

interface AnnualReturnsChartProps {
  data: AnnualReturn[]
  bestYears: AnnualReturn[]
  worstYears: AnnualReturn[]
}

export function AnnualReturnsChart({
  data,
  bestYears,
  worstYears,
}: AnnualReturnsChartProps) {
  const chartData = data.map((item) => ({
    year: item.year.toString(),
    return: item.return * 100,
    isPositive: item.return >= 0,
  }))

  const positiveYears = data.filter((d) => d.return > 0).length
  const totalYears = data.length

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Roční výnosy
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Nejlepší roky
          </h4>
          <ul className="space-y-2">
            {bestYears.map((year) => (
              <li
                key={year.year}
                className="flex justify-between items-center text-sm bg-white rounded px-3 py-2 shadow-sm"
              >
                <span className="font-medium text-gray-700">{year.year}</span>
                <span className="font-bold text-green-600">
                  +{(year.return * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
          <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
            </svg>
            Nejhorší roky
          </h4>
          <ul className="space-y-2">
            {worstYears.map((year) => (
              <li
                key={year.year}
                className="flex justify-between items-center text-sm bg-white rounded px-3 py-2 shadow-sm"
              >
                <span className="font-medium text-gray-700">{year.year}</span>
                <span className="font-bold text-red-600">
                  {(year.return * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Výnos']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" />
            <Bar dataKey="return" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPositive ? '#22C55E' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-900 text-center font-medium">
          Portfolio mělo kladný výnos v {positiveYears} z {totalYears} let
          <span className="ml-2 font-bold text-blue-600">
            ({((positiveYears / totalYears) * 100).toFixed(0)}% úspěšnost)
          </span>
        </p>
      </div>
    </div>
  )
}
