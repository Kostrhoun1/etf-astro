'use client'

import { useState, useEffect, useRef } from 'react'

interface ETFSearchResult {
  isin: string
  name: string
  ter: number
  indexCode: string
  indexName: string
  fundSize: number | null
}

interface SelectedETF {
  isin: string
  name: string
  ter: number
  indexCode: string
  indexName: string
  weight: number
}

interface AvailableIndex {
  indexCode: string
  name: string
  isin: string
  etfName: string
  ter: number
}

interface ETFSelectorProps {
  selectedETFs: SelectedETF[]
  onETFsChange: (etfs: SelectedETF[]) => void
  availableIndexes: AvailableIndex[]
}

// ETFs grouped by index category - all indexes have historical data in database
const ETF_CATEGORIES: Record<string, { label: string; indexCode: string; category: string; etfs: Array<{ isin: string; name: string; ticker: string; ter: number }> }> = {
  // === AKCIE ===
  'sp500': {
    label: 'S&P 500',
    indexCode: 'sp500',
    category: 'Akcie',
    etfs: [
      { isin: 'IE00B5BMR087', name: 'iShares Core S&P 500 UCITS ETF', ticker: 'CSPX', ter: 0.0007 },
      { isin: 'IE00BFMXXD54', name: 'Vanguard S&P 500 UCITS ETF', ticker: 'VUAA', ter: 0.0007 },
    ],
  },
  'us_total_market': {
    label: 'US Total Market',
    indexCode: 'us_total_market',
    category: 'Akcie',
    etfs: [
      { isin: 'IE00B3XXRP09', name: 'Vanguard Total Stock Market ETF', ticker: 'VTI', ter: 0.0003 },
    ],
  },
  'msci_eafe': {
    label: 'MSCI EAFE',
    indexCode: 'msci_eafe',
    category: 'Akcie',
    etfs: [
      { isin: 'IE00B4L5Y983', name: 'iShares MSCI EAFE UCITS ETF', ticker: 'EFA', ter: 0.002 },
    ],
  },
  'ftse_europe': {
    label: 'FTSE Europe',
    indexCode: 'ftse_europe',
    category: 'Akcie',
    etfs: [
      { isin: 'IE00B945VV12', name: 'Vanguard FTSE Developed Europe UCITS ETF', ticker: 'VEUR', ter: 0.001 },
    ],
  },
  'msci_em': {
    label: 'MSCI Emerging Markets',
    indexCode: 'msci_em',
    category: 'Akcie',
    etfs: [
      { isin: 'IE00BKM4GZ66', name: 'iShares Core MSCI EM UCITS ETF', ticker: 'EIMI', ter: 0.0018 },
    ],
  },
  'ftse_all_world': {
    label: 'FTSE All-World',
    indexCode: 'ftse_all_world',
    category: 'Akcie',
    etfs: [
      { isin: 'IE00BK5BQT80', name: 'Vanguard FTSE All-World UCITS ETF', ticker: 'VWCE', ter: 0.0022 },
    ],
  },

  // === EUR DLUHOPISY ===
  'eur_govt_bond': {
    label: 'EUR vládní dluhopisy',
    indexCode: 'eur_govt_bond',
    category: 'Dluhopisy EUR',
    etfs: [
      { isin: 'IE00B4WXJJ64', name: 'iShares Core EUR Govt Bond UCITS ETF', ticker: 'IEAG', ter: 0.0007 },
    ],
  },
  'eur_govt_bond_1_3y': {
    label: 'EUR vládní 1-3Y',
    indexCode: 'eur_govt_bond_1_3y',
    category: 'Dluhopisy EUR',
    etfs: [
      { isin: 'IE00B14X4Q57', name: 'iShares EUR Govt Bond 1-3yr UCITS ETF', ticker: 'IBGS', ter: 0.002 },
    ],
  },
  'eur_govt_bond_15_30y': {
    label: 'EUR vládní 15-30Y',
    indexCode: 'eur_govt_bond_15_30y',
    category: 'Dluhopisy EUR',
    etfs: [
      { isin: 'IE00B1FZS913', name: 'iShares EUR Govt Bond 15-30yr UCITS ETF', ticker: 'IBGL', ter: 0.002 },
    ],
  },
  'eur_corp_bond': {
    label: 'EUR firemní dluhopisy',
    indexCode: 'eur_corp_bond',
    category: 'Dluhopisy EUR',
    etfs: [
      { isin: 'IE00B3F81R35', name: 'iShares Core EUR Corp Bond UCITS ETF', ticker: 'IEAC', ter: 0.002 },
    ],
  },

  // === US DLUHOPISY ===
  'us_treasury_1_3y': {
    label: 'US Treasury 1-3Y',
    indexCode: 'us_treasury_1_3y',
    category: 'Dluhopisy USD',
    etfs: [
      { isin: 'IE00BYXPSP02', name: 'iShares USD Treasury Bond 1-3yr UCITS ETF', ticker: 'IBTC', ter: 0.0007 },
    ],
  },
  'us_treasury_7_10y': {
    label: 'US Treasury 7-10Y',
    indexCode: 'us_treasury_7_10y',
    category: 'Dluhopisy USD',
    etfs: [
      { isin: 'IE00B3VWN518', name: 'iShares USD Treasury Bond 7-10yr UCITS ETF', ticker: 'IBTM', ter: 0.0007 },
    ],
  },
  'us_treasury_20y': {
    label: 'US Treasury 20+Y',
    indexCode: 'us_treasury_20y',
    category: 'Dluhopisy USD',
    etfs: [
      { isin: 'IE00BSKRJZ44', name: 'iShares USD Treasury Bond 20+yr UCITS ETF', ticker: 'IDTL', ter: 0.0007 },
    ],
  },
  'us_aggregate_bond': {
    label: 'US Aggregate Bond',
    indexCode: 'us_aggregate_bond',
    category: 'Dluhopisy USD',
    etfs: [
      { isin: 'IE00BYXYYM63', name: 'iShares US Aggregate Bond UCITS ETF', ticker: 'IUAG', ter: 0.0025 },
    ],
  },

  // === KOMODITY ===
  'gold': {
    label: 'Zlato',
    indexCode: 'gold',
    category: 'Komodity',
    etfs: [
      { isin: 'IE00B4ND3602', name: 'iShares Physical Gold ETC', ticker: 'IGLN', ter: 0.0012 },
    ],
  },
  'commodities': {
    label: 'Komodity',
    indexCode: 'commodities',
    category: 'Komodity',
    etfs: [
      { isin: 'IE00BDFL4P12', name: 'iShares Diversified Commodity UCITS ETF', ticker: 'SALL', ter: 0.0019 },
    ],
  },
}

export function ETFSelector({
  selectedETFs,
  onETFsChange,
  availableIndexes,
}: ETFSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const totalWeight = selectedETFs.reduce((sum, etf) => sum + etf.weight, 0)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter ETFs based on search
  const getFilteredCategories = () => {
    if (!searchQuery) return ETF_CATEGORIES

    const query = searchQuery.toLowerCase()
    const filtered: typeof ETF_CATEGORIES = {}

    for (const [key, category] of Object.entries(ETF_CATEGORIES)) {
      const matchingETFs = category.etfs.filter(
        (etf) =>
          etf.name.toLowerCase().includes(query) ||
          etf.ticker.toLowerCase().includes(query) ||
          etf.isin.toLowerCase().includes(query)
      )
      if (matchingETFs.length > 0) {
        filtered[key] = { ...category, etfs: matchingETFs }
      }
    }

    return filtered
  }

  const filteredCategories = getFilteredCategories()

  const addETF = (etf: { isin: string; name: string; ter: number }, indexCode: string, indexName: string) => {
    if (selectedETFs.some((e) => e.isin === etf.isin)) {
      return
    }

    const remainingWeight = Math.max(0, 100 - totalWeight)
    const defaultWeight = selectedETFs.length === 0 ? 100 : Math.min(remainingWeight, 20)

    onETFsChange([
      ...selectedETFs,
      {
        isin: etf.isin,
        name: etf.name,
        ter: etf.ter,
        indexCode,
        indexName,
        weight: defaultWeight,
      },
    ])

    setIsOpen(false)
    setSearchQuery('')
  }

  const removeETF = (isin: string) => {
    onETFsChange(selectedETFs.filter((e) => e.isin !== isin))
  }

  const updateWeight = (isin: string, weight: number) => {
    onETFsChange(
      selectedETFs.map((e) =>
        e.isin === isin ? { ...e, weight: Math.max(0, Math.min(100, weight)) } : e
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Dropdown Trigger */}
      <div ref={dropdownRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Přidat ETF do portfolia
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <span className="text-gray-700">Vybrat ETF...</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[400px] overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledat podle tickeru, ISIN nebo názvu..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Categories */}
            <div className="overflow-y-auto max-h-[320px]">
              {Object.entries(filteredCategories).map(([key, category]) => (
                <div key={key} className="border-b border-gray-100 last:border-0">
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{category.label}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {category.etfs.length} ETF
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedCategory === key || searchQuery ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* ETF List */}
                  {(expandedCategory === key || searchQuery) && (
                    <div className="bg-gray-50">
                      {category.etfs.map((etf) => {
                        const isSelected = selectedETFs.some((e) => e.isin === etf.isin)
                        return (
                          <button
                            key={etf.isin}
                            onClick={() => addETF(etf, category.indexCode, category.label)}
                            disabled={isSelected}
                            className={`w-full flex items-center justify-between px-6 py-2.5 text-left hover:bg-gray-100 transition-colors ${
                              isSelected ? 'opacity-50 cursor-not-allowed bg-green-50' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-blue-600">
                                  {etf.ticker}
                                </span>
                                <span className="text-xs text-gray-400">{etf.isin}</span>
                              </div>
                              <p className="text-sm text-gray-700 truncate">{etf.name}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-2">
                              <span className="text-xs text-gray-500">
                                TER: {(etf.ter * 100).toFixed(2)}%
                              </span>
                              {isSelected ? (
                                <span className="text-xs text-green-600 font-medium">Vybráno</span>
                              ) : (
                                <span className="text-blue-600 text-lg">+</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {Object.keys(filteredCategories).length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  Nenalezeno. Zkuste jiný výraz.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected ETFs with Weights */}
      {selectedETFs.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Složení portfolia
            </label>
            <span
              className={`text-sm font-semibold ${
                totalWeight === 100 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              Celkem: {totalWeight}%
            </span>
          </div>

          <div className="space-y-2">
            {selectedETFs.map((etf) => (
              <div
                key={etf.isin}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {etf.indexName}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 truncate text-sm mt-1">
                    {etf.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    TER: {(etf.ter * 100).toFixed(2)}%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={etf.weight}
                    onChange={(e) => updateWeight(etf.isin, Number(e.target.value))}
                    className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={etf.weight}
                    onChange={(e) => updateWeight(etf.isin, Number(e.target.value))}
                    className="w-14 text-center border border-gray-300 rounded px-1 py-0.5 text-sm"
                  />
                  <span className="text-gray-500 text-sm">%</span>
                  <button
                    onClick={() => removeETF(etf.isin)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Odebrat"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalWeight !== 100 && (
            <p className="text-sm text-red-600">
              Součet vah musí být přesně 100%. Aktuálně: {totalWeight}%
            </p>
          )}
        </div>
      )}

      {selectedETFs.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-sm text-gray-500">
            Klikněte na &quot;Vybrat ETF&quot; a přidejte fondy do portfolia
          </p>
        </div>
      )}
    </div>
  )
}
