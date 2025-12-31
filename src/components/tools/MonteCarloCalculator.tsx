'use client'

import { useState } from 'react'
import { useCurrency } from '../../contexts/CurrencyContext'
import type { Currency } from '../../contexts/CurrencyContext'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Available indexes for simulation
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
    indexCode: 'eur_corp_bond',
    name: 'EUR firemní dluhopisy',
    category: 'Dluhopisy EUR',
    isin: 'IE00B3F81R35',
    etfName: 'iShares Core EUR Corp Bond',
    ter: 0.002,
  },
  // === US DLUHOPISY ===
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

// Preset portfolios
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
]

interface SelectedETF {
  isin: string
  name: string
  ter: number
  indexCode: string
  indexName: string
  weight: number
}

interface MonteCarloData {
  month: number
  percentile5: number
  percentile16: number
  percentile50: number
  percentile84: number
  percentile95: number
}

interface MonteCarloStats {
  currentValue: number
  monthlyMean: number
  monthlyStdDev: number
  annualMean: number
  annualStdDev: number
}

interface FinalValues {
  veryBad: number
  bad: number
  average: number
  good: number
  great: number
}

export function MonteCarloCalculator() {
  const { selectedCurrency, setCurrency } = useCurrency()
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
  const [initialAmount, setInitialAmount] = useState(500000) // CZK
  const [forecastYears, setForecastYears] = useState(15)
  const [simulations, setSimulations] = useState(600)

  const [chartData, setChartData] = useState<MonteCarloData[] | null>(null)
  const [stats, setStats] = useState<MonteCarloStats | null>(null)
  const [finalValues, setFinalValues] = useState<FinalValues | null>(null)
  const [loading, setLoading] = useState(false)
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

  const addETF = (indexCode: string) => {
    const index = AVAILABLE_INDEXES.find((i) => i.indexCode === indexCode)
    if (!index) return
    if (selectedETFs.some((e) => e.indexCode === indexCode)) return

    setSelectedETFs([
      ...selectedETFs,
      {
        isin: index.isin,
        name: index.etfName,
        ter: index.ter,
        indexCode: index.indexCode,
        indexName: index.name,
        weight: 0,
      },
    ])
  }

  const removeETF = (indexCode: string) => {
    setSelectedETFs(selectedETFs.filter((e) => e.indexCode !== indexCode))
  }

  const updateWeight = (indexCode: string, weight: number) => {
    setSelectedETFs(
      selectedETFs.map((e) =>
        e.indexCode === indexCode ? { ...e, weight } : e
      )
    )
  }

  const runSimulation = async () => {
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

    try {
      const portfolio = selectedETFs.map((etf) => ({
        isin: etf.isin,
        name: etf.name,
        weight: etf.weight / 100,
        ter: etf.ter,
        indexCode: etf.indexCode,
      }))

      const response = await fetch('/api/backtest/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio,
          startDate,
          endDate,
          initialAmount,
          forecastYears,
          simulations,
          useInitialAmountAsStart: true, // Start simulation from user's input, not backtest end value
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to run simulation')
      }

      const data = await response.json()
      setChartData(data.chartData)
      setStats(data.stats)
      setFinalValues(data.finalValues)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const groupedIndexes = AVAILABLE_INDEXES.reduce((acc, index) => {
    if (!acc[index.category]) acc[index.category] = []
    acc[index.category].push(index)
    return acc
  }, {} as Record<string, typeof AVAILABLE_INDEXES>)

  return (
    <div className="space-y-8">
      {/* Settings Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PRESET_PORTFOLIOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className="p-3 text-left bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{preset.name}</div>
                <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected ETFs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Složení portfolia ({totalWeight}% / 100%)
          </label>
          {selectedETFs.length > 0 && (
            <div className="space-y-2 mb-4">
              {selectedETFs.map((etf) => (
                <div
                  key={etf.indexCode}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{etf.indexName}</div>
                    <div className="text-xs text-gray-500">{etf.name}</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={etf.weight}
                    onChange={(e) => updateWeight(etf.indexCode, parseInt(e.target.value) || 0)}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                  />
                  <span className="text-gray-500">%</span>
                  <button
                    onClick={() => removeETF(etf.indexCode)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add ETF Dropdown */}
          <select
            onChange={(e) => {
              addETF(e.target.value)
              e.target.value = ''
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
            defaultValue=""
          >
            <option value="" disabled>
              + Přidat ETF do portfolia
            </option>
            {Object.entries(groupedIndexes).map(([category, indexes]) => (
              <optgroup key={category} label={category}>
                {indexes.map((index) => (
                  <option
                    key={index.indexCode}
                    value={index.indexCode}
                    disabled={selectedETFs.some((e) => e.indexCode === index.indexCode)}
                  >
                    {index.name} (TER: {(index.ter * 100).toFixed(2)}%)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Currency Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Měna pro zobrazení
          </label>
          <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
            {(['USD', 'EUR', 'CZK'] as Currency[]).map((currency) => (
              <button
                key={currency}
                onClick={() => setCurrency(currency)}
                className={`
                  px-6 py-2 text-sm font-medium rounded-lg transition-all
                  ${selectedCurrency === currency
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                {currency === 'USD' && '$ USD'}
                {currency === 'EUR' && '€ EUR'}
                {currency === 'CZK' && 'Kč CZK'}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Historická data od
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Historická data do
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Počáteční kapitál ({selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : 'Kč'})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={initialAmount === 0 ? '' : initialAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '')
                setInitialAmount(val === '' ? 0 : parseInt(val, 10))
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prognóza na let
            </label>
            <select
              value={forecastYears}
              onChange={(e) => setForecastYears(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
            >
              <option value={5}>5 let</option>
              <option value={10}>10 let</option>
              <option value={15}>15 let</option>
              <option value={20}>20 let</option>
              <option value={25}>25 let</option>
              <option value={30}>30 let</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Počet simulací: {simulations}
          </label>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={simulations}
            onChange={(e) => setSimulations(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>100</span>
            <span>Více simulací = přesnější výsledky</span>
            <span>1000</span>
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading || totalWeight !== 100 || selectedETFs.length === 0}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generuji {simulations} scénářů...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Spustit Monte Carlo simulaci
            </span>
          )}
        </button>

        {totalWeight !== 100 && (
          <p className="text-amber-600 text-sm text-center mt-2">
            Alokace musí být přesně 100% (aktuálně: {totalWeight}%)
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Chyba</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {chartData && stats && finalValues && (
        <div className="space-y-8">
          {/* Stats Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Statistiky z historických dat
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">Aktuální hodnota portfolia</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(stats.currentValue)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">Průměrný roční výnos</p>
                <p className="text-xl font-bold text-green-900">{(stats.annualMean * 100).toFixed(2)}%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-700">Roční volatilita (σ)</p>
                <p className="text-xl font-bold text-amber-900">{(stats.annualStdDev * 100).toFixed(2)}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-700">Prognóza na</p>
                <p className="text-xl font-bold text-purple-900">{forecastYears} let</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Pravděpodobnostní pásma
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Graf ukazuje rozsah možných budoucích hodnot portfolia na základě {simulations} simulací.
            </p>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mcColorP95" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="mcColorP84" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84CC16" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#84CC16" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="mcColorP16" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="mcColorP5" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(m) => m % 12 === 0 ? `${m / 12} let` : ''}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        percentile95: 'Skvělý scénář (97.7%)',
                        percentile84: 'Dobrý scénář (84.1%)',
                        percentile50: 'Průměrný scénář (50%)',
                        percentile16: 'Špatný scénář (15.9%)',
                        percentile5: 'Velmi špatný scénář (2.3%)',
                      }
                      return [formatCurrency(value), labels[name] || name]
                    }}
                    labelFormatter={(label) => `Měsíc ${label} (${(label / 12).toFixed(1)} let)`}
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
                    fill="url(#mcColorP95)"
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile84"
                    stroke="#84CC16"
                    strokeWidth={1}
                    fill="url(#mcColorP84)"
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile50"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile16"
                    stroke="#F59E0B"
                    strokeWidth={1}
                    fill="url(#mcColorP16)"
                  />
                  <Area
                    type="monotone"
                    dataKey="percentile5"
                    stroke="#EF4444"
                    strokeWidth={1}
                    fill="url(#mcColorP5)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">Skvělý (+2σ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <span className="text-gray-600">Dobrý (+σ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Průměr</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600">Špatný (-σ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">Velmi špatný (-2σ)</span>
              </div>
            </div>
          </div>

          {/* Final Values Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Možné hodnoty portfolia za {forecastYears} let
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-xs text-red-600 mb-1">Velmi špatný scénář</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(finalValues.veryBad)}</p>
                <p className="text-xs text-gray-500">2.3% pravděpodobnost</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-xs text-amber-600 mb-1">Špatný scénář</p>
                <p className="text-lg font-bold text-amber-700">{formatCurrency(finalValues.bad)}</p>
                <p className="text-xs text-gray-500">15.9% pravděpodobnost</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-600 mb-1">Průměrný scénář</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(finalValues.average)}</p>
                <p className="text-xs text-gray-500">50% pravděpodobnost</p>
              </div>
              <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 text-center">
                <p className="text-xs text-lime-600 mb-1">Dobrý scénář</p>
                <p className="text-lg font-bold text-lime-700">{formatCurrency(finalValues.good)}</p>
                <p className="text-xs text-gray-500">84.1% pravděpodobnost</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-xs text-green-600 mb-1">Skvělý scénář</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(finalValues.great)}</p>
                <p className="text-xs text-gray-500">97.7% pravděpodobnost</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Omezení Monte Carlo simulace</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Simulace předpokládá normální rozdělení výnosů, ale reálné trhy mají "tlusté chvosty" - extrémní události jsou častější</li>
              <li>Budoucí výnosy nemusí odpovídat historickým vzorcům</li>
              <li>Nezohledňuje inflaci, daně ani transakční náklady</li>
              <li>Nepočítá s "černými labutěmi" - nepředvídatelnými událostmi</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
