'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface HorizonAnalysis {
  years: number
  periodsWithPositiveReturn: number
  totalPeriods: number
  percentagePositive: number
}

interface HorizonChartProps {
  data: HorizonAnalysis[]
}

export function HorizonChart({ data }: HorizonChartProps) {
  const chartData = data.map((item) => ({
    years: `${item.years} ${item.years === 1 ? 'rok' : item.years < 5 ? 'roky' : 'let'}`,
    yearsNum: item.years,
    percentage: item.percentagePositive * 100,
    periods: item.totalPeriods,
    positive: item.periodsWithPositiveReturn,
  }))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Minimální investiční horizont
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Jak dlouho byste měli držet investici pro vysokou pravděpodobnost kladného výnosu?
      </p>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="years"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              domain={[50, 100]}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip
              formatter={(value: number, name: string, props: { payload: { positive: number; periods: number } }) => [
                `${value.toFixed(1)}% (${props.payload.positive}/${props.payload.periods} období)`,
                'Pravděpodobnost zisku',
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <ReferenceLine
              y={95}
              stroke="#22C55E"
              strokeDasharray="5 5"
              label={{
                value: '95%',
                position: 'right',
                fill: '#22C55E',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#2563EB' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          {chartData.find((d) => d.percentage >= 95) ? (
            <>
              Při investičním horizontu{' '}
              <strong>
                {chartData.find((d) => d.percentage >= 95)?.years}
              </strong>{' '}
              a více máte historicky více než 95% šanci na kladný výnos.
            </>
          ) : (
            <>
              Pro 95% pravděpodobnost kladného výnosu je potřeba delší investiční horizont než {chartData[chartData.length - 1]?.years}.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
