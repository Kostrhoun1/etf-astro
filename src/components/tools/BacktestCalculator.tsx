'use client'

import { useState } from 'react'
import { useCurrency } from '../../contexts/CurrencyContext'
import type { Currency } from '../../contexts/CurrencyContext'
import { SummaryPanel } from '../backtest/SummaryPanel'
import { EvolutionChart } from '../backtest/EvolutionChart'
import { AnnualReturnsChart } from '../backtest/AnnualReturnsChart'
import { DrawdownChart } from '../backtest/DrawdownChart'
import { MonthlyReturnsHistogram } from '../backtest/MonthlyReturnsHistogram'
import { HorizonChart } from '../backtest/HorizonChart'
import { VaRGauge } from '../backtest/VaRGauge'
import { InflationChart } from '../backtest/InflationChart'
import { RebalancingTable } from '../backtest/RebalancingTable'
import { ETFSelector } from '../backtest/ETFSelector'
import { CorrelationMatrix } from '../backtest/CorrelationMatrix'

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  CZK: 'Kč',
}

// Available indexes for backtest - all data is stored in EUR
const AVAILABLE_INDEXES = [
  // === AKCIE ===
  {
    indexCode: 'sp500',
    name: 'S&P 500',
    category: 'Akcie',
    isin: 'IE00B5BMR087',
    etfName: 'iShares Core S&P 500',
    ter: 0.0007,
  },
  {
    indexCode: 'us_total_market',
    name: 'US Total Stock Market',
    category: 'Akcie',
    isin: 'IE00B3XXRP09',
    etfName: 'Vanguard Total Stock Market',
    ter: 0.0003,
  },
  {
    indexCode: 'msci_eafe',
    name: 'MSCI EAFE (Vyspělé mimo US)',
    category: 'Akcie',
    isin: 'IE00B4L5Y983',
    etfName: 'iShares MSCI EAFE',
    ter: 0.002,
  },
  {
    indexCode: 'ftse_europe',
    name: 'FTSE Europe',
    category: 'Akcie',
    isin: 'IE00B945VV12',
    etfName: 'Vanguard FTSE Developed Europe',
    ter: 0.001,
  },
  {
    indexCode: 'msci_em',
    name: 'MSCI Emerging Markets',
    category: 'Akcie',
    isin: 'IE00BKM4GZ66',
    etfName: 'iShares Core MSCI EM',
    ter: 0.0018,
  },
  {
    indexCode: 'ftse_all_world',
    name: 'FTSE All-World',
    category: 'Akcie',
    isin: 'IE00BK5BQT80',
    etfName: 'Vanguard FTSE All-World',
    ter: 0.0022,
  },

  // === EUR DLUHOPISY ===
  {
    indexCode: 'eur_govt_bond',
    name: 'EUR vládní dluhopisy',
    category: 'Dluhopisy EUR',
    isin: 'IE00B4WXJJ64',
    etfName: 'iShares Core EUR Govt Bond',
    ter: 0.0007,
  },
  {
    indexCode: 'eur_govt_bond_1_3y',
    name: 'EUR vládní dluhopisy 1-3Y',
    category: 'Dluhopisy EUR',
    isin: 'IE00B14X4Q57',
    etfName: 'iShares EUR Govt Bond 1-3yr',
    ter: 0.002,
  },
  {
    indexCode: 'eur_govt_bond_3_7y',
    name: 'EUR vládní dluhopisy 3-7Y',
    category: 'Dluhopisy EUR',
    isin: 'IE00B3VTML14',
    etfName: 'iShares EUR Govt Bond 3-7yr',
    ter: 0.002,
  },
  {
    indexCode: 'eur_govt_bond_15_30y',
    name: 'EUR vládní dluhopisy 15-30Y',
    category: 'Dluhopisy EUR',
    isin: 'IE00B1FZS913',
    etfName: 'iShares EUR Govt Bond 15-30yr',
    ter: 0.002,
  },
  {
    indexCode: 'eur_corp_bond',
    name: 'EUR firemní dluhopisy',
    category: 'Dluhopisy EUR',
    isin: 'IE00B3F81R35',
    etfName: 'iShares Core EUR Corp Bond',
    ter: 0.002,
  },

  // === US DLUHOPISY ===
  {
    indexCode: 'us_treasury_1_3y',
    name: 'US Treasury 1-3Y',
    category: 'Dluhopisy USD',
    isin: 'IE00BYXPSP02',
    etfName: 'iShares USD Treasury Bond 1-3yr',
    ter: 0.0007,
  },
  {
    indexCode: 'us_treasury_7_10y',
    name: 'US Treasury 7-10Y',
    category: 'Dluhopisy USD',
    isin: 'IE00B3VWN518',
    etfName: 'iShares USD Treasury Bond 7-10yr',
    ter: 0.0007,
  },
  {
    indexCode: 'us_treasury_20y',
    name: 'US Treasury 20+Y',
    category: 'Dluhopisy USD',
    isin: 'IE00BSKRJZ44',
    etfName: 'iShares USD Treasury Bond 20+yr',
    ter: 0.0007,
  },
  {
    indexCode: 'us_aggregate_bond',
    name: 'US Aggregate Bond',
    category: 'Dluhopisy USD',
    isin: 'IE00BYXYYM63',
    etfName: 'iShares US Aggregate Bond',
    ter: 0.0025,
  },
  {
    indexCode: 'us_corp_bond_ig',
    name: 'US Corporate Bond IG',
    category: 'Dluhopisy USD',
    isin: 'IE00BYXYYL56',
    etfName: 'iShares USD Corporate Bond',
    ter: 0.002,
  },

  // === KOMODITY ===
  {
    indexCode: 'gold',
    name: 'Zlato',
    category: 'Komodity',
    isin: 'IE00B4ND3602',
    etfName: 'iShares Physical Gold',
    ter: 0.0012,
  },
  {
    indexCode: 'commodities',
    name: 'Komodity (diverzifikované)',
    category: 'Komodity',
    isin: 'IE00BDFL4P12',
    etfName: 'iShares Diversified Commodity',
    ter: 0.0019,
  },
]

// Preset portfolios - popular investment strategies
const PRESET_PORTFOLIOS = [
  {
    id: 'sp500-100',
    name: '100% S&P 500',
    description: 'Čistě americké akcie',
    etfs: [{ indexCode: 'sp500', weight: 100 }],
  },
  {
    id: 'ftse-all-world',
    name: '100% All-World',
    description: 'Globální akcie',
    etfs: [{ indexCode: 'ftse_all_world', weight: 100 }],
  },
  {
    id: '60-40',
    name: '60/40 Portfolio',
    description: '60% akcie, 40% dluhopisy',
    etfs: [
      { indexCode: 'sp500', weight: 60 },
      { indexCode: 'us_aggregate_bond', weight: 40 },
    ],
  },
  {
    id: 'all-weather',
    name: 'Ray Dalio All Weather',
    description: 'Diverzifikované pro všechny podmínky',
    etfs: [
      { indexCode: 'sp500', weight: 30 },
      { indexCode: 'us_treasury_20y', weight: 40 },
      { indexCode: 'us_treasury_7_10y', weight: 15 },
      { indexCode: 'gold', weight: 7 },
      { indexCode: 'commodities', weight: 8 },
    ],
  },
  {
    id: 'permanent',
    name: 'Permanent Portfolio',
    description: '25% akcie, dluhopisy, zlato, hotovost',
    etfs: [
      { indexCode: 'sp500', weight: 25 },
      { indexCode: 'us_treasury_20y', weight: 25 },
      { indexCode: 'us_treasury_1_3y', weight: 25 },
      { indexCode: 'gold', weight: 25 },
    ],
  },
  {
    id: 'global-em',
    name: '80% Vyspělé + 20% EM',
    description: 'Globální akcie s EM',
    etfs: [
      { indexCode: 'msci_eafe', weight: 40 },
      { indexCode: 'sp500', weight: 40 },
      { indexCode: 'msci_em', weight: 20 },
    ],
  },
]

interface SelectedETF {
  isin: string
  name: string
  ter: number
  indexCode: string
  indexName: string
  weight: number
}

interface BacktestResult {
  evolution: Array<{ date: string; value: number }>
  summary: {
    amountInvested: number
    netAssetValue: number
    cagr: number
    standardDeviation: number
    sharpeRatio: number
  }
  returns: {
    annualReturns: Array<{ year: number; return: number }>
    monthlyReturns: Array<{ date: string; year: number; month: number; return: number }>
    bestYears: Array<{ year: number; return: number }>
    worstYears: Array<{ year: number; return: number }>
    bestMonths: Array<{ date: string; year: number; month: number; return: number }>
    worstMonths: Array<{ date: string; year: number; month: number; return: number }>
  }
  risk: {
    maxDrawdown: {
      startDate: string
      troughDate: string
      endDate: string | null
      depth: number
      lengthMonths: number
      recovered: boolean
    }
    longestDrawdown: {
      startDate: string
      troughDate: string
      endDate: string | null
      depth: number
      lengthMonths: number
      recovered: boolean
    }
    valueAtRisk95: number
  }
  horizons: Array<{
    years: number
    periodsWithPositiveReturn: number
    totalPeriods: number
    percentagePositive: number
  }>
}

interface RebalancingResult {
  strategy: string
  strategyLabel: string
  cagr: number
}

interface CorrelationData {
  correlations: Array<{ etf1: string; etf2: string; correlation: number }>
  etfNames: string[]
}

type ContributionFrequency = 'none' | 'monthly' | 'quarterly' | 'yearly'

export function BacktestCalculator() {
  const { selectedCurrency, setCurrency, getCurrencySymbol } = useCurrency()
  const [selectedETFs, setSelectedETFs] = useState<SelectedETF[]>([
    {
      isin: 'IE00B5BMR087',
      name: 'iShares Core S&P 500',
      ter: 0.0007,
      indexCode: 'sp500',
      indexName: 'S&P 500',
      weight: 100,
    },
  ])
  const [startDate, setStartDate] = useState('2005-01-01')
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [initialAmount, setInitialAmount] = useState(100000) // CZK
  const [contributionAmount, setContributionAmount] = useState(5000) // CZK per period
  const [contributionFrequency, setContributionFrequency] = useState<ContributionFrequency>('monthly')
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [rebalancingResults, setRebalancingResults] = useState<RebalancingResult[] | null>(null)
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [rebalancingLoading, setRebalancingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalWeight = selectedETFs.reduce((sum, etf) => sum + etf.weight, 0)

  const applyPreset = (presetId: string) => {
    const preset = PRESET_PORTFOLIOS.find((p) => p.id === presetId)
    if (!preset) return

    const newETFs: SelectedETF[] = preset.etfs.map((item) => {
      const index = AVAILABLE_INDEXES.find((i) => i.indexCode === item.indexCode)!
      return {
        isin: index.isin,
        name: index.etfName,
        ter: index.ter,
        indexCode: index.indexCode,
        indexName: index.name,
        weight: item.weight,
      }
    })
    setSelectedETFs(newETFs)
  }

  const buildPortfolioItems = () => {
    return selectedETFs.map((etf) => ({
      isin: etf.isin,
      name: etf.name,
      weight: etf.weight / 100,
      ter: etf.ter,
      indexCode: etf.indexCode,
    }))
  }

  const runBacktest = async () => {
    if (totalWeight !== 100) {
      setError(`Alokace musí být přesně 100%. Aktuálně: ${totalWeight}%`)
      return
    }

    if (selectedETFs.length === 0) {
      setError('Vyberte alespoň jedno ETF')
      return
    }

    setLoading(true)
    setError(null)
    setRebalancingResults(null)
    setCorrelationData(null)

    try {
      const portfolio = buildPortfolioItems()

      // Build contributions if enabled
      const contributions = contributionFrequency !== 'none' && contributionAmount > 0
        ? { amount: contributionAmount, frequency: contributionFrequency as 'monthly' | 'quarterly' | 'yearly' }
        : undefined

      const response = await fetch('/api/backtest/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio,
          startDate,
          endDate,
          initialAmount,
          rebalancingStrategy: 'yearly',
          currency: selectedCurrency,
          contributions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to run backtest')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const loadRebalancing = async () => {
    setRebalancingLoading(true)
    try {
      const portfolio = buildPortfolioItems()
      const response = await fetch('/api/backtest/rebalancing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio,
          startDate,
          endDate,
          initialAmount,
        }),
      })
      const data = await response.json()
      setRebalancingResults(data.strategies)
    } finally {
      setRebalancingLoading(false)
    }
  }

  const loadCorrelation = async () => {
    if (selectedETFs.length < 2) return

    const portfolio = selectedETFs.map((etf) => ({
      isin: etf.isin,
      name: etf.name,
      indexCode: etf.indexCode,
    }))

    const response = await fetch('/api/backtest/correlation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolio,
        startDate,
        endDate,
      }),
    })
    const data = await response.json()
    setCorrelationData(data)
  }

  return (
    <div className="space-y-8">
      {/* Settings Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900">
            Nastavení simulace
          </h2>
        </div>

        {/* Preset Portfolios */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Oblíbená portfolia
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESET_PORTFOLIOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className="p-3 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{preset.name}</div>
                <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ETF Selector */}
        <div className="mb-6">
          <ETFSelector
            selectedETFs={selectedETFs}
            onETFsChange={setSelectedETFs}
            availableIndexes={AVAILABLE_INDEXES}
          />
        </div>

        {/* Currency Toggle */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span>💱 Měna pro zobrazení</span>
          </label>
          <div className="flex flex-wrap bg-gray-100 rounded-xl p-1 w-fit">
            {(['USD', 'EUR', 'CZK'] as Currency[]).map((currency) => (
              <button
                key={currency}
                onClick={() => setCurrency(currency)}
                className={`
                  px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${selectedCurrency === currency
                    ? 'bg-white text-blue-600 shadow-md border-2 border-blue-300 scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                {currency === 'USD' && '$ USD'}
                {currency === 'EUR' && '€ EUR'}
                {currency === 'CZK' && 'Kč CZK'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hodnoty budou přepočteny historickými kurzy z ECB/ČNB
          </p>
        </div>

        {/* Date and Amount Settings */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <span>📅 Časové období</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Počáteční datum
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Min: 2000-01-01</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Koncové datum
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Max: Dnes</p>
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <span>💰 Investice (v Kč)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Počáteční investice (Kč)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={initialAmount === 0 ? '' : initialAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setInitialAmount(val === '' ? 0 : parseInt(val, 10))
                }}
                placeholder="0"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Jednorázový vklad na začátku</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pravidelný vklad (Kč)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={contributionAmount === 0 ? '' : contributionAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setContributionAmount(val === '' ? 0 : parseInt(val, 10))
                }}
                placeholder="0"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Částka každý měsíc/kvartál/rok</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frekvence vkladů
              </label>
              <select
                value={contributionFrequency}
                onChange={(e) => setContributionFrequency(e.target.value as ContributionFrequency)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="none">Bez pravidelných vkladů</option>
                <option value="monthly">Měsíčně</option>
                <option value="quarterly">Čtvrtletně</option>
                <option value="yearly">Ročně</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">DCA strategie</p>
            </div>
          </div>

          {contributionFrequency !== 'none' && contributionAmount > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>DCA strategie:</strong> Budete investovat {initialAmount.toLocaleString('cs-CZ')} Kč na začátku a pak{' '}
                {contributionAmount.toLocaleString('cs-CZ')} Kč{' '}
                {contributionFrequency === 'monthly' ? 'každý měsíc' : contributionFrequency === 'quarterly' ? 'každé čtvrtletí' : 'každý rok'}.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={runBacktest}
            disabled={loading || totalWeight !== 100 || selectedETFs.length === 0}
            className="w-full sm:flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Počítám backtest...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Spustit backtest
              </span>
            )}
          </button>

          {totalWeight !== 100 && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Alokace musí být 100%</span>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Chyba při spuštění backtesty</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* Results Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Výsledky backtesty</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Zde vidíte, jak by vaše portfolio fungovalo v minulosti. Analýza zahrnuje výnosy, rizika a různé statistiky.
              Pamatujte: <strong>minulá výkonnost není zárukou budoucích výsledků</strong>.
            </p>
          </div>

          {/* Summary + Evolution in row */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📈</span>
              <span>Přehled výkonnosti</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SummaryPanel summary={result.summary} currency={selectedCurrency} />
              </div>
              <div className="lg:col-span-2">
                <EvolutionChart
                  data={result.evolution}
                  initialAmount={result.summary.amountInvested}
                  currency={selectedCurrency}
                />
              </div>
            </div>
          </div>

          {/* Educational divider - Returns */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Co říkají roční výnosy?
            </h4>
            <p className="text-sm text-blue-800">
              Roční výnosy ukazují, jak portfolio rostlo jednotlivé roky. Volatilita je přirozená -
              některé roky jsou zelené, jiné červené. Důležité je dlouhodobý trend a schopnost vydržet špatné roky.
            </p>
          </div>

          {/* Annual Returns */}
          <AnnualReturnsChart
            data={result.returns.annualReturns}
            bestYears={result.returns.bestYears}
            worstYears={result.returns.worstYears}
          />

          {/* Monthly Returns Histogram */}
          <MonthlyReturnsHistogram
            data={result.returns.monthlyReturns}
            bestMonths={result.returns.bestMonths}
            worstMonths={result.returns.worstMonths}
          />

          {/* Inflation Impact */}
          <InflationChart
            evolution={result.evolution}
            nominalCAGR={result.summary.cagr}
            currency={selectedCurrency}
          />

          {/* Educational divider - Risk */}
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Analýza rizik
            </h4>
            <p className="text-sm text-amber-800">
              Drawdown ukazuje, o kolik % portfolio kleslo od svého maxima. Čím větší drawdown, tím více nervů je potřeba
              k vydržení poklesu. Value at Risk (VaR) udává maximální očekávanou ztrátu za rok s 95% pravděpodobností.
            </p>
          </div>

          {/* Drawdown */}
          <DrawdownChart
            evolution={result.evolution}
            maxDrawdown={result.risk.maxDrawdown}
            longestDrawdown={result.risk.longestDrawdown}
          />

          {/* VaR Gauge */}
          <VaRGauge var95={result.risk.valueAtRisk95} />

          {/* Educational divider - Horizon */}
          <div className="bg-violet-50 rounded-xl p-5 border border-violet-200">
            <h4 className="font-semibold text-violet-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Investiční horizont
            </h4>
            <p className="text-sm text-violet-800">
              Tato analýza ukazuje, že čím déle investujete, tím vyšší je pravděpodobnost kladného výnosu.
              Proto je důležité investovat dlouhodobě a nepanikařit při krátkodobých poklesech.
            </p>
          </div>

          {/* Investment Horizon */}
          <HorizonChart data={result.horizons} />

          {/* Rebalancing Strategies */}
          {rebalancingResults ? (
            <RebalancingTable results={rebalancingResults} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rebalancovací strategie
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Porovnejte vliv různých rebalancovacích strategií na výkonnost portfolia.
              </p>
              <button
                onClick={loadRebalancing}
                disabled={rebalancingLoading}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {rebalancingLoading ? 'Počítám...' : 'Porovnat strategie'}
              </button>
            </div>
          )}

          {/* Correlation Matrix */}
          {selectedETFs.length >= 2 && (
            correlationData ? (
              <CorrelationMatrix
                correlations={correlationData.correlations}
                etfNames={correlationData.etfNames}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Korelační matice
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Zobrazte korelaci mezi aktivy v portfoliu pro analýzu diverzifikace.
                </p>
                <button
                  onClick={loadCorrelation}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Zobrazit korelace
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
