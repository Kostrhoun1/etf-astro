/**
 * Backtest Engine
 *
 * Main engine that orchestrates portfolio simulation using index data.
 */

import { supabaseAdmin } from '@/lib/supabase'
import type {
  BacktestInput,
  BacktestResult,
  PortfolioItem,
  TimeSeriesPoint,
  IndexData,
  IndexDataPoint,
  RebalancingStrategy,
} from './types'
import {
  calculateSummary,
  calculateReturnsAnalysis,
  calculateRiskAnalysis,
  calculateHorizonAnalysis,
  runMonteCarlo,
  mean,
  standardDeviation,
  yearsBetween,
} from './calculations'

// ============================================================
// EXCHANGE RATES
// ============================================================

export interface ExchangeRate {
  date: Date
  eurUsd: number
  eurCzk: number
  usdCzk: number
}

/**
 * Load historical exchange rates from Supabase
 */
export async function loadExchangeRates(
  startDate?: Date,
  endDate?: Date
): Promise<ExchangeRate[]> {
  let query = supabaseAdmin
    .from('exchange_rates_historical')
    .select('date, eur_usd, eur_czk, usd_czk')
    .order('date', { ascending: true })

  if (startDate) {
    query = query.gte('date', startDate.toISOString().split('T')[0])
  }
  if (endDate) {
    query = query.lte('date', endDate.toISOString().split('T')[0])
  }

  const { data, error } = await query

  if (error) {
    console.error('Error loading exchange rates:', error)
    return []
  }

  return (data || []).map((row) => ({
    date: new Date(row.date),
    eurUsd: parseFloat(row.eur_usd),
    eurCzk: parseFloat(row.eur_czk),
    usdCzk: parseFloat(row.usd_czk),
  }))
}

/**
 * Get exchange rate for a specific date (finds closest available)
 */
export function getExchangeRateForDate(
  rates: ExchangeRate[],
  targetDate: Date
): ExchangeRate | null {
  if (rates.length === 0) return null

  const targetTime = targetDate.getTime()

  // Find closest rate (prefer earlier date if exact match not found)
  let closest = rates[0]
  let closestDiff = Math.abs(rates[0].date.getTime() - targetTime)

  for (const rate of rates) {
    const diff = Math.abs(rate.date.getTime() - targetTime)
    if (diff < closestDiff) {
      closest = rate
      closestDiff = diff
    }
    // Stop early if we've passed the target date
    if (rate.date.getTime() > targetTime && closestDiff < 7 * 24 * 60 * 60 * 1000) {
      break
    }
  }

  return closest
}

/**
 * Convert time series from USD to target currency
 */
export function convertTimeSeriesToCurrency(
  series: Array<{ date: Date; value: number }>,
  rates: ExchangeRate[],
  targetCurrency: 'EUR' | 'CZK' | 'USD'
): Array<{ date: Date; value: number }> {
  if (targetCurrency === 'USD') {
    return series // No conversion needed
  }

  return series.map((point) => {
    const rate = getExchangeRateForDate(rates, point.date)
    if (!rate) {
      return point // No rate found, return as-is
    }

    let convertedValue: number
    if (targetCurrency === 'EUR') {
      // USD to EUR: divide by EUR/USD rate
      convertedValue = point.value / rate.eurUsd
    } else {
      // USD to CZK: multiply by USD/CZK rate
      convertedValue = point.value * rate.usdCzk
    }

    return {
      date: point.date,
      value: convertedValue,
    }
  })
}

/**
 * Convert time series from EUR to target currency
 */
export function convertTimeSeriesFromEur(
  series: Array<{ date: Date; value: number }>,
  rates: ExchangeRate[],
  targetCurrency: 'EUR' | 'CZK' | 'USD'
): Array<{ date: Date; value: number }> {
  if (targetCurrency === 'EUR') {
    return series // No conversion needed
  }

  return series.map((point) => {
    const rate = getExchangeRateForDate(rates, point.date)
    if (!rate) {
      return point // No rate found, return as-is
    }

    let convertedValue: number
    if (targetCurrency === 'CZK') {
      // EUR to CZK: multiply by EUR/CZK rate
      convertedValue = point.value * rate.eurCzk
    } else {
      // EUR to USD: multiply by EUR/USD rate
      convertedValue = point.value * rate.eurUsd
    }

    return {
      date: point.date,
      value: convertedValue,
    }
  })
}

// ============================================================
// DATA LOADING
// ============================================================

/**
 * Load historical data for an index from Supabase
 */
export async function loadIndexData(
  indexCode: string,
  startDate?: Date,
  endDate?: Date
): Promise<IndexData> {
  // Load data in chunks to handle more than 1000 rows
  const allData: Array<{ date: string; close_price: string }> = []
  const pageSize = 1000
  let offset = 0
  let hasMore = true

  while (hasMore) {
    let query = supabaseAdmin
      .from('index_historical_data')
      .select('date, close_price')
      .eq('index_code', indexCode)
      .order('date', { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0])
    }
    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error loading index data for ${indexCode}:`, error)
      break
    }

    if (data && data.length > 0) {
      allData.push(...data)
      offset += pageSize
      hasMore = data.length === pageSize
    } else {
      hasMore = false
    }
  }

  return {
    indexCode,
    data: allData.map((row) => ({
      date: new Date(row.date),
      closePrice: parseFloat(row.close_price),
    })),
  }
}

/**
 * Load index mapping from database
 */
export async function getIndexCodeForETF(indexName: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('index_mapping')
    .select('index_code')
    .eq('index_name', indexName)
    .single()

  if (error || !data) {
    return null
  }

  return data.index_code
}

/**
 * Get all available indexes with their date ranges
 */
export async function getAvailableIndexes(): Promise<
  Array<{
    indexCode: string
    indexName: string
    startDate: string
    endDate: string
    dataPoints: number
  }>
> {
  const { data: mappings } = await supabaseAdmin
    .from('index_mapping')
    .select('index_code, index_name')

  if (!mappings) return []

  const results = []

  for (const mapping of mappings) {
    // Get first date
    const { data: firstData } = await supabaseAdmin
      .from('index_historical_data')
      .select('date')
      .eq('index_code', mapping.index_code)
      .order('date', { ascending: true })
      .limit(1)

    // Get last date
    const { data: lastData } = await supabaseAdmin
      .from('index_historical_data')
      .select('date')
      .eq('index_code', mapping.index_code)
      .order('date', { ascending: false })
      .limit(1)

    // Get count
    const { count } = await supabaseAdmin
      .from('index_historical_data')
      .select('*', { count: 'exact', head: true })
      .eq('index_code', mapping.index_code)

    if (firstData && firstData.length > 0 && lastData && lastData.length > 0) {
      results.push({
        indexCode: mapping.index_code,
        indexName: mapping.index_name,
        startDate: firstData[0].date,
        endDate: lastData[0].date,
        dataPoints: count || 0,
      })
    }
  }

  // Deduplicate by index_code
  const unique = new Map()
  for (const r of results) {
    if (!unique.has(r.indexCode)) {
      unique.set(r.indexCode, r)
    }
  }

  return Array.from(unique.values())
}

// ============================================================
// PORTFOLIO SIMULATION
// ============================================================

/**
 * Simulate a single ETF based on its underlying index
 *
 * ETF value = Index value × (1 - TER)^years
 */
function simulateETFFromIndex(
  indexData: IndexDataPoint[],
  ter: number,
  initialValue: number
): TimeSeriesPoint[] {
  if (indexData.length === 0) return []

  const startPrice = indexData[0].closePrice
  const result: TimeSeriesPoint[] = []

  for (const point of indexData) {
    // Calculate years from start
    const years = yearsBetween(indexData[0].date, point.date)

    // Index return
    const indexReturn = point.closePrice / startPrice

    // Apply TER drag
    const terDrag = Math.pow(1 - ter, years)

    // ETF value
    const value = initialValue * indexReturn * terDrag

    result.push({
      date: point.date,
      value,
    })
  }

  return result
}

/**
 * Check if we should make a contribution on this date
 */
function shouldContribute(
  date: Date,
  prevDate: Date | null,
  frequency: 'monthly' | 'quarterly' | 'yearly'
): boolean {
  if (!prevDate) return false // No contribution on first day (initial amount handles it)

  const month = date.getMonth()
  const prevMonth = prevDate.getMonth()
  const year = date.getFullYear()
  const prevYear = prevDate.getFullYear()

  switch (frequency) {
    case 'monthly':
      // New month
      return month !== prevMonth || year !== prevYear
    case 'quarterly':
      // New quarter (Jan, Apr, Jul, Oct)
      const quarter = Math.floor(month / 3)
      const prevQuarter = Math.floor(prevMonth / 3)
      return quarter !== prevQuarter || year !== prevYear
    case 'yearly':
      // New year (January)
      return year !== prevYear
    default:
      return false
  }
}

/**
 * Combine multiple ETF time series into portfolio with optional recurring contributions
 *
 * Supports:
 * - Initial lump sum investment
 * - Recurring contributions (DCA - Dollar Cost Averaging)
 * - Various rebalancing strategies
 */
function combinePortfolio(
  etfSeries: Array<{ weight: number; evolution: TimeSeriesPoint[] }>,
  initialAmount: number,
  rebalancing: RebalancingStrategy = 'yearly',
  contributions?: { amount: number; frequency: 'monthly' | 'quarterly' | 'yearly' }
): { evolution: TimeSeriesPoint[]; totalContributed: number } {
  if (etfSeries.length === 0) return { evolution: [], totalContributed: 0 }

  // Find common date range
  const allDates = new Set<string>()
  for (const { evolution } of etfSeries) {
    for (const point of evolution) {
      allDates.add(point.date.toISOString())
    }
  }

  const sortedDates = Array.from(allDates).sort()

  // Create lookup maps
  const lookups = etfSeries.map(({ evolution }) => {
    const map = new Map<string, number>()
    for (const point of evolution) {
      map.set(point.date.toISOString(), point.value)
    }
    return map
  })

  // Calculate portfolio value at each date
  const result: TimeSeriesPoint[] = []
  let portfolioValue = initialAmount
  let totalContributed = initialAmount

  // Track holdings
  let holdings = etfSeries.map(({ weight }) => weight * initialAmount)

  let prevDate: Date | null = null

  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i]
    const date = new Date(dateStr)

    // Get current ETF values (normalized to initial)
    const etfValues = lookups.map((lookup) => {
      const etfValue = lookup.get(dateStr)
      if (etfValue === undefined) return null

      // Get previous value for return calculation
      const prevDateStr = i > 0 ? sortedDates[i - 1] : dateStr
      const prevValue = lookup.get(prevDateStr) || etfValue

      return { current: etfValue, previous: prevValue }
    })

    // Skip if any ETF missing data
    if (etfValues.some((v) => v === null)) continue

    // Calculate new portfolio value based on holdings growth
    if (i > 0) {
      let newValue = 0
      for (let j = 0; j < holdings.length; j++) {
        const etf = etfValues[j]!
        const growth = etf.current / etf.previous
        holdings[j] = holdings[j] * growth
        newValue += holdings[j]
      }
      portfolioValue = newValue
    }

    // Add recurring contribution if applicable
    if (contributions && contributions.amount > 0 && prevDate) {
      if (shouldContribute(date, prevDate, contributions.frequency)) {
        const contributionAmount = contributions.amount
        totalContributed += contributionAmount

        // Distribute contribution according to target weights
        for (let j = 0; j < holdings.length; j++) {
          holdings[j] += etfSeries[j].weight * contributionAmount
        }
        portfolioValue += contributionAmount
      }
    }

    result.push({ date, value: portfolioValue })

    // Rebalance if needed
    if (shouldRebalance(date, i, rebalancing)) {
      holdings = etfSeries.map(({ weight }) => weight * portfolioValue)
    }

    prevDate = date
  }

  return { evolution: result, totalContributed }
}

/**
 * Check if we should rebalance at this date
 */
function shouldRebalance(
  date: Date,
  index: number,
  strategy: RebalancingStrategy
): boolean {
  if (strategy === 'none') return false
  if (index === 0) return false // Don't rebalance on first day

  const month = date.getMonth()
  const isYearEnd = month === 11 // December

  switch (strategy) {
    case 'monthly':
      return true
    case 'quarterly':
      return month % 3 === 2 // March, June, Sept, Dec
    case 'half-yearly':
      return month === 5 || month === 11 // June, December
    case 'yearly':
      return isYearEnd
    case 'every-2-years':
      return isYearEnd && date.getFullYear() % 2 === 0
    case 'every-3-years':
      return isYearEnd && date.getFullYear() % 3 === 0
    default:
      return false
  }
}

// ============================================================
// MAIN BACKTEST FUNCTION
// ============================================================

/**
 * Run a complete backtest for a portfolio
 */
export async function runBacktest(input: BacktestInput): Promise<BacktestResult> {
  const { portfolio, startDate, endDate, initialAmount, rebalancingStrategy, contributions } = input

  // Load index data for each ETF
  const etfSeries: Array<{ weight: number; evolution: TimeSeriesPoint[] }> = []

  for (const item of portfolio) {
    const indexData = await loadIndexData(item.indexCode, startDate, endDate)

    if (indexData.data.length === 0) {
      console.warn(`No data for index ${item.indexCode}`)
      continue
    }

    const evolution = simulateETFFromIndex(
      indexData.data,
      item.ter,
      item.weight * initialAmount
    )

    etfSeries.push({
      weight: item.weight,
      evolution,
    })
  }

  if (etfSeries.length === 0) {
    throw new Error('No valid ETF data found for portfolio')
  }

  // Combine into portfolio with optional recurring contributions
  const { evolution, totalContributed } = combinePortfolio(
    etfSeries,
    initialAmount,
    rebalancingStrategy || 'yearly',
    contributions
  )

  if (evolution.length === 0) {
    throw new Error('No overlapping data for portfolio ETFs')
  }

  // Calculate all metrics - use totalContributed for proper summary
  const summary = calculateSummary(evolution, totalContributed)
  const returns = calculateReturnsAnalysis(evolution)
  const risk = calculateRiskAnalysis(evolution)
  const horizons = calculateHorizonAnalysis(evolution)

  return {
    input,
    evolution,
    summary,
    returns,
    risk,
    horizons,
  }
}

/**
 * Run backtest with Monte Carlo forecasts
 */
export async function runBacktestWithForecasts(
  input: BacktestInput,
  forecastYears: number = 10
): Promise<BacktestResult> {
  const result = await runBacktest(input)

  // IMPORTANT: result.returns.monthlyReturns are actually DAILY returns
  // (returns between consecutive data points, which are daily)
  // We need to use annual returns and convert to monthly for accurate Monte Carlo
  const annualReturns = result.returns.annualReturns.map((r) => r.return)
  const annualMean = mean(annualReturns)
  const annualStdDev = standardDeviation(annualReturns)

  // Convert to monthly for Monte Carlo simulation
  const monthlyMean = Math.pow(1 + annualMean, 1/12) - 1
  const monthlyStdDev = annualStdDev / Math.sqrt(12)

  const monteCarlo = runMonteCarlo(
    result.summary.netAssetValue,
    monthlyMean,
    monthlyStdDev,
    forecastYears * 12,
    600
  )

  return {
    ...result,
    monteCarlo,
  }
}

/**
 * Compare different rebalancing strategies
 */
export async function compareRebalancingStrategies(
  baseInput: BacktestInput
): Promise<BacktestResult['rebalancingComparison']> {
  const strategies: RebalancingStrategy[] = [
    'none',
    'monthly',
    'quarterly',
    'half-yearly',
    'yearly',
    'every-2-years',
    'every-3-years',
  ]

  const results: Array<{ strategy: RebalancingStrategy; cagr: number }> = []

  for (const strategy of strategies) {
    const result = await runBacktest({
      ...baseInput,
      rebalancingStrategy: strategy,
    })
    results.push({
      strategy,
      cagr: result.summary.cagr,
    })
  }

  // Find max CAGR
  const maxCagr = Math.max(...results.map((r) => r.cagr))

  return results.map((r) => ({
    strategy: r.strategy,
    cagr: r.cagr,
    differenceFromMax: r.cagr - maxCagr,
  }))
}
