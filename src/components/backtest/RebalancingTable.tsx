'use client'

import { useState } from 'react'

interface RebalancingResult {
  strategy: string
  strategyLabel: string
  cagr: number
}

interface RebalancingTableProps {
  results: RebalancingResult[]
}

export function RebalancingTable({ results }: RebalancingTableProps) {
  const [sortBy, setSortBy] = useState<'cagr' | 'name'>('cagr')

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'cagr') return b.cagr - a.cagr
    return a.strategyLabel.localeCompare(b.strategyLabel)
  })

  const maxCagr = Math.max(...results.map((r) => r.cagr))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Rebalancovací strategie
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Rebalancovací strategie může mít významný dopad na výkonnost portfolia. Backtest simuluje různé přístupy k rebalancování.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                onClick={() => setSortBy('name')}
              >
                Strategie {sortBy === 'name' && '↓'}
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                onClick={() => setSortBy('cagr')}
              >
                CAGR {sortBy === 'cagr' && '↓'}
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                Rozdíl od max
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => (
              <tr
                key={result.strategy}
                className={`border-b border-gray-100 ${
                  index === 0 && sortBy === 'cagr' ? 'bg-green-50' : ''
                }`}
              >
                <td className="py-3 px-4 text-sm text-gray-900">
                  {result.strategyLabel}
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                  {(result.cagr * 100).toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-sm text-right">
                  <span
                    className={
                      result.cagr === maxCagr
                        ? 'text-green-600 font-medium'
                        : 'text-gray-500'
                    }
                  >
                    {result.cagr === maxCagr
                      ? '0.00%'
                      : `${((result.cagr - maxCagr) * 100).toFixed(2)}%`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3 text-sm text-gray-600">
        <p>
          <strong>Kalendářní rebalancování:</strong> Portfolio se rebalancuje v pevných časových intervalech, bez ohledu na to, jak nevyvážené je.
        </p>
        <p>
          <strong>Toleranční rebalancování:</strong> Portfolio se rebalancuje pouze tehdy, když jeho nevyváženost překročí určitou hranici.
        </p>
      </div>
    </div>
  )
}
