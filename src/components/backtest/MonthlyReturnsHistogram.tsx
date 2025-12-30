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
} from 'recharts'

interface MonthlyReturn {
  date: string
  year: number
  month: number
  return: number
}

interface MonthlyReturnsHistogramProps {
  data: MonthlyReturn[]
  bestMonths: MonthlyReturn[]
  worstMonths: MonthlyReturn[]
}

export function MonthlyReturnsHistogram({
  data,
  bestMonths,
  worstMonths,
}: MonthlyReturnsHistogramProps) {
  // Create histogram buckets
  const bucketSize = 5 // 5% buckets
  const buckets: Record<string, number> = {}

  // Initialize buckets from -25% to +25%
  for (let i = -25; i <= 25; i += bucketSize) {
    const label = `${i}% - ${i + bucketSize}%`
    buckets[label] = 0
  }

  // Fill buckets
  data.forEach((point) => {
    const returnPct = point.return * 100
    const bucketStart = Math.floor(returnPct / bucketSize) * bucketSize
    const clampedStart = Math.max(-25, Math.min(20, bucketStart))
    const label = `${clampedStart}% - ${clampedStart + bucketSize}%`
    if (buckets[label] !== undefined) {
      buckets[label]++
    }
  })

  const chartData = Object.entries(buckets).map(([label, count]) => {
    const startPct = parseInt(label.split('%')[0])
    return {
      label,
      shortLabel: `${startPct}%`,
      count,
      isPositive: startPct >= 0,
    }
  })

  const positiveMonths = data.filter((d) => d.return > 0).length
  const totalMonths = data.length

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Měsíční výnosy
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Nejlepší měsíce
          </h4>
          <ul className="space-y-1">
            {bestMonths.slice(0, 3).map((month, i) => (
              <li
                key={i}
                className="flex justify-between text-sm text-green-700"
              >
                <span>{formatDate(month.date)}</span>
                <span className="font-semibold">
                  +{(month.return * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Nejhorší měsíce
          </h4>
          <ul className="space-y-1">
            {worstMonths.slice(0, 3).map((month, i) => (
              <li
                key={i}
                className="flex justify-between text-sm text-red-700"
              >
                <span>{formatDate(month.date)}</span>
                <span className="font-semibold">
                  {(month.return * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="shortLabel"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              label={{
                value: 'Počet měsíců',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#6B7280' },
              }}
            />
            <Tooltip
              formatter={(value: number, name: string, props: { payload: { label: string } }) => [
                `${value} měsíců`,
                props.payload.label,
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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

      <p className="mt-4 text-sm text-gray-500 text-center">
        Portfolio mělo kladný výnos v {positiveMonths} z {totalMonths} měsíců (
        {((positiveMonths / totalMonths) * 100).toFixed(0)}%)
      </p>
    </div>
  )
}
