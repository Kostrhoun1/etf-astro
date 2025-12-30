'use client'

import { useState } from 'react'
import type { BacktestSummary } from '../../lib/backtest/types'

interface SummaryPanelProps {
  summary: BacktestSummary
  currency?: string
}

interface TooltipProps {
  text: string
}

function Tooltip({ text }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {isVisible && (
        <div className="absolute left-0 top-6 z-10 w-64 p-3 text-xs text-white bg-gray-900 rounded-lg shadow-xl">
          {text}
          <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </div>
  )
}

export function SummaryPanel({ summary, currency = 'EUR' }: SummaryPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return (value * 100).toFixed(2) + '%'
  }

  const profit = summary.netAssetValue - summary.amountInvested
  const profitPercent = (profit / summary.amountInvested) * 100

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Shrnutí portfolia
      </h3>

      <div className="space-y-4">
        {/* Total Profit Box */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
          <div className="text-sm text-gray-600 mb-1">Celkový zisk</div>
          <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
          </div>
          <div className={`text-sm font-medium ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {profit >= 0 ? '+' : ''}{profitPercent.toFixed(1)}% celkem
          </div>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-600 text-sm">Investovaná částka</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(summary.amountInvested)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-600 text-sm">Aktuální hodnota</span>
          <span className="font-semibold text-green-600 text-lg">
            {formatCurrency(summary.netAssetValue)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-gray-600 text-sm">CAGR</span>
            <Tooltip text="Compound Annual Growth Rate - průměrný roční výnos zohledňující složené úročení. To je nejdůležitější metrika pro porovnání výkonnosti." />
          </div>
          <span
            className={`font-bold text-lg ${summary.cagr >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatPercent(summary.cagr)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-gray-600 text-sm">Volatilita</span>
            <Tooltip text="Roční směrodatná odchylka výnosů. Měří, jak moc výnosy kolísají. Vyšší volatilita = vyšší riziko, ale potenciálně i vyšší výnosy." />
          </div>
          <span className="font-semibold text-gray-900">
            {summary.standardDeviation != null ? formatPercent(summary.standardDeviation) : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <span className="text-gray-600 text-sm">Sharpe Ratio</span>
            <Tooltip text="Poměr výnosu a rizika. Hodnota >1 je dobrá, >2 je výborná. Ukazuje, kolik výnosu dostáváte za jednotku rizika." />
          </div>
          <span className={`font-bold ${(summary.sharpeRatio ?? 0) > 1 ? 'text-green-600' : 'text-gray-900'}`}>
            {summary.sharpeRatio != null ? summary.sharpeRatio.toFixed(2) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}
