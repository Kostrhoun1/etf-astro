/**
 * Backtest Calculations
 *
 * Core mathematical functions for portfolio backtesting.
 * All return values are decimals (e.g., 0.07 for 7%, -0.15 for -15%)
 */

import type {
  TimeSeriesPoint,
  MonthlyReturn,
  AnnualReturn,
  DrawdownPeriod,
  HorizonAnalysis,
  BacktestSummary,
  BacktestReturns,
  BacktestRisk,
  MonteCarloResult,
} from './types'

// ============================================================
// BASIC STATISTICS
// ============================================================

/**
 * Calculate arithmetic mean
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/**
 * Calculate standard deviation (population)
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  const avg = mean(values)
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2))
  return Math.sqrt(mean(squaredDiffs))
}

/**
 * Annualize monthly standard deviation
 * σ_annual = σ_monthly × √12
 */
export function annualizeMonthlyStdDev(monthlyStdDev: number): number {
  return monthlyStdDev * Math.sqrt(12)
}

// ============================================================
// RETURN CALCULATIONS
// ============================================================

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 *
 * CAGR = (finalValue / initialValue)^(1/years) - 1
 */
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number {
  if (initialValue <= 0 || years <= 0) return 0
  return Math.pow(finalValue / initialValue, 1 / years) - 1
}

/**
 * Calculate monthly returns from time series
 */
export function calculateMonthlyReturns(
  evolution: TimeSeriesPoint[]
): MonthlyReturn[] {
  if (evolution.length < 2) return []

  const returns: MonthlyReturn[] = []

  for (let i = 1; i < evolution.length; i++) {
    const prevValue = evolution[i - 1].value
    const currValue = evolution[i].value
    const date = evolution[i].date

    if (prevValue > 0) {
      returns.push({
        date,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        return: (currValue - prevValue) / prevValue,
      })
    }
  }

  return returns
}

/**
 * Calculate annual returns from monthly returns
 */
export function calculateAnnualReturns(
  monthlyReturns: MonthlyReturn[]
): AnnualReturn[] {
  if (monthlyReturns.length === 0) return []

  // Group by year
  const byYear: Record<number, number[]> = {}

  for (const mr of monthlyReturns) {
    if (!byYear[mr.year]) byYear[mr.year] = []
    byYear[mr.year].push(mr.return)
  }

  // Calculate compound return for each year
  const annualReturns: AnnualReturn[] = []

  for (const [year, returns] of Object.entries(byYear)) {
    // Only include complete years (12 months) or first/last year
    const compoundReturn = returns.reduce((acc, r) => acc * (1 + r), 1) - 1

    annualReturns.push({
      year: parseInt(year),
      return: compoundReturn,
    })
  }

  return annualReturns.sort((a, b) => a.year - b.year)
}

/**
 * Get best N items sorted by return (descending)
 */
export function getBestReturns<T extends { return: number }>(
  items: T[],
  n: number
): T[] {
  return [...items].sort((a, b) => b.return - a.return).slice(0, n)
}

/**
 * Get worst N items sorted by return (ascending)
 */
export function getWorstReturns<T extends { return: number }>(
  items: T[],
  n: number
): T[] {
  return [...items].sort((a, b) => a.return - b.return).slice(0, n)
}

// ============================================================
// RISK CALCULATIONS
// ============================================================

/**
 * Calculate Sharpe Ratio
 *
 * Sharpe = (R_portfolio - R_riskfree) / σ_portfolio
 *
 * Uses annualized values
 */
export function calculateSharpeRatio(
  portfolioReturn: number,
  riskFreeRate: number,
  standardDeviation: number
): number {
  if (standardDeviation === 0) return 0
  return (portfolioReturn - riskFreeRate) / standardDeviation
}

/**
 * Calculate Value at Risk (95%) using variance-covariance method
 *
 * VaR(95%) = μ_annual - 1.65 × σ_annual
 *
 * IMPORTANT: Despite the parameter name, this function receives DAILY returns
 * (returns between consecutive data points, which are daily in our dataset).
 * We convert to annual using 252 trading days per year.
 *
 * Where:
 * - μ_annual = mean daily return × 252
 * - σ_annual = daily std dev × √252
 * - 1.65 is the z-score for 95% confidence (one-tailed)
 */
export function calculateVaR95(dailyReturns: number[]): number {
  if (dailyReturns.length === 0) return 0

  const dailyMean = mean(dailyReturns)
  const dailyStd = standardDeviation(dailyReturns)

  // Convert daily to annual (252 trading days per year)
  const annualMean = dailyMean * 252
  const annualStd = dailyStd * Math.sqrt(252)

  return annualMean - 1.65 * annualStd
}

/**
 * Calculate all drawdown periods
 *
 * Drawdown = (current - peak) / peak
 */
export function calculateDrawdowns(
  evolution: TimeSeriesPoint[]
): DrawdownPeriod[] {
  if (evolution.length < 2) return []

  const drawdowns: DrawdownPeriod[] = []
  let peak = evolution[0].value
  let peakDate = evolution[0].date
  let inDrawdown = false
  let currentDrawdown: Partial<DrawdownPeriod> | null = null

  for (let i = 1; i < evolution.length; i++) {
    const point = evolution[i]
    const drawdownDepth = (point.value - peak) / peak

    if (point.value >= peak) {
      // New peak or recovery
      if (inDrawdown && currentDrawdown) {
        // End of drawdown
        currentDrawdown.endDate = point.date
        currentDrawdown.recovered = true
        currentDrawdown.lengthMonths = monthsBetween(
          currentDrawdown.startDate!,
          point.date
        )
        drawdowns.push(currentDrawdown as DrawdownPeriod)
        currentDrawdown = null
        inDrawdown = false
      }
      peak = point.value
      peakDate = point.date
    } else {
      // In drawdown
      if (!inDrawdown) {
        // Start new drawdown
        inDrawdown = true
        currentDrawdown = {
          startDate: peakDate,
          troughDate: point.date,
          endDate: null,
          depth: drawdownDepth,
          lengthMonths: 0,
          recovered: false,
        }
      } else if (currentDrawdown && drawdownDepth < currentDrawdown.depth!) {
        // Deeper trough
        currentDrawdown.troughDate = point.date
        currentDrawdown.depth = drawdownDepth
      }
    }
  }

  // Handle ongoing drawdown
  if (inDrawdown && currentDrawdown) {
    const lastPoint = evolution[evolution.length - 1]
    currentDrawdown.endDate = null
    currentDrawdown.recovered = false
    currentDrawdown.lengthMonths = monthsBetween(
      currentDrawdown.startDate!,
      lastPoint.date
    )
    drawdowns.push(currentDrawdown as DrawdownPeriod)
  }

  return drawdowns
}

/**
 * Get the deepest drawdown (by depth)
 */
export function getDeepestDrawdown(
  drawdowns: DrawdownPeriod[]
): DrawdownPeriod | null {
  if (drawdowns.length === 0) return null
  return drawdowns.reduce((deepest, d) =>
    d.depth < deepest.depth ? d : deepest
  )
}

/**
 * Get the longest drawdown (by duration)
 */
export function getLongestDrawdown(
  drawdowns: DrawdownPeriod[]
): DrawdownPeriod | null {
  if (drawdowns.length === 0) return null
  return drawdowns.reduce((longest, d) =>
    d.lengthMonths > longest.lengthMonths ? d : longest
  )
}

// ============================================================
// INVESTMENT HORIZON ANALYSIS
// ============================================================

/**
 * Calculate probability of positive return for different holding periods
 *
 * For each period length, calculate how many rolling periods had positive returns
 */
export function calculateHorizonAnalysis(
  evolution: TimeSeriesPoint[],
  maxYears: number = 10
): HorizonAnalysis[] {
  const results: HorizonAnalysis[] = []

  for (let years = 1; years <= maxYears; years++) {
    const months = years * 12

    if (evolution.length <= months) {
      // Not enough data
      results.push({
        years,
        periodsWithPositiveReturn: 0,
        totalPeriods: 0,
        percentagePositive: 0,
      })
      continue
    }

    let positiveCount = 0
    let totalPeriods = 0

    // Rolling window
    for (let i = 0; i <= evolution.length - months - 1; i++) {
      const startValue = evolution[i].value
      const endValue = evolution[i + months].value
      const periodReturn = (endValue - startValue) / startValue

      totalPeriods++
      if (periodReturn > 0) positiveCount++
    }

    results.push({
      years,
      periodsWithPositiveReturn: positiveCount,
      totalPeriods,
      percentagePositive: totalPeriods > 0 ? positiveCount / totalPeriods : 0,
    })
  }

  return results
}

// ============================================================
// MONTE CARLO SIMULATION
// ============================================================

/**
 * Generate random number from normal distribution using Box-Muller transform
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0 * stdDev + mean
}

/**
 * Run Monte Carlo simulation
 *
 * Generates multiple future paths based on historical mean and std dev
 */
export function runMonteCarlo(
  initialValue: number,
  monthlyMean: number,
  monthlyStdDev: number,
  forecastMonths: number,
  simulations: number = 600
): MonteCarloResult[] {
  // Run all simulations
  const allPaths: number[][] = []

  for (let sim = 0; sim < simulations; sim++) {
    const path: number[] = [initialValue]

    for (let month = 0; month < forecastMonths; month++) {
      const monthlyReturn = randomNormal(monthlyMean, monthlyStdDev)
      const newValue = path[path.length - 1] * (1 + monthlyReturn)
      path.push(Math.max(0, newValue)) // Prevent negative values
    }

    allPaths.push(path)
  }

  // Calculate percentiles at each time point
  const percentiles = [
    { p: 0.023, label: 'Very bad (-2σ)' },
    { p: 0.159, label: 'Bad (-σ)' },
    { p: 0.5, label: 'Average' },
    { p: 0.841, label: 'Good (σ)' },
    { p: 0.977, label: 'Great (2σ)' },
  ]

  const results: MonteCarloResult[] = []
  const startDate = new Date()

  for (const { p, label } of percentiles) {
    const evolution: TimeSeriesPoint[] = []

    for (let month = 0; month <= forecastMonths; month++) {
      // Get all values at this month
      const valuesAtMonth = allPaths.map((path) => path[month])
      valuesAtMonth.sort((a, b) => a - b)

      // Get percentile value
      const index = Math.floor(p * valuesAtMonth.length)
      const value = valuesAtMonth[Math.min(index, valuesAtMonth.length - 1)]

      const date = new Date(startDate)
      date.setMonth(date.getMonth() + month)

      evolution.push({ date, value })
    }

    results.push({
      percentile: p,
      label,
      evolution,
      finalValue: evolution[evolution.length - 1].value,
    })
  }

  return results
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate months between two dates
 */
function monthsBetween(start: Date, end: Date): number {
  const years = end.getFullYear() - start.getFullYear()
  const months = end.getMonth() - start.getMonth()
  return years * 12 + months
}

/**
 * Calculate years between two dates (fractional)
 */
export function yearsBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return ms / (365.25 * 24 * 60 * 60 * 1000)
}

// ============================================================
// AGGREGATE CALCULATIONS
// ============================================================

/**
 * Calculate complete summary metrics
 */
export function calculateSummary(
  evolution: TimeSeriesPoint[],
  initialAmount: number,
  riskFreeRate: number = 0.03 // Default 3% (approx Euribor)
): BacktestSummary {
  if (evolution.length < 2) {
    return {
      amountInvested: initialAmount,
      netAssetValue: initialAmount,
      cagr: 0,
      standardDeviation: 0,
      sharpeRatio: 0,
    }
  }

  const finalValue = evolution[evolution.length - 1].value
  const years = yearsBetween(evolution[0].date, evolution[evolution.length - 1].date)

  // IMPORTANT: calculateMonthlyReturns returns DAILY returns (between consecutive data points)
  // despite its misleading name. We need to annualize using 252 trading days.
  const dailyReturns = calculateMonthlyReturns(evolution)
  const dailyReturnValues = dailyReturns.map((r) => r.return)

  const cagr = calculateCAGR(initialAmount, finalValue, years)
  const dailyStdDev = standardDeviation(dailyReturnValues)
  // Annualize daily volatility: σ_annual = σ_daily × √252
  const annualStdDev = dailyStdDev * Math.sqrt(252)
  const sharpe = calculateSharpeRatio(cagr, riskFreeRate, annualStdDev)

  return {
    amountInvested: initialAmount,
    netAssetValue: finalValue,
    cagr,
    standardDeviation: annualStdDev,
    sharpeRatio: sharpe,
  }
}

/**
 * Calculate complete returns analysis
 */
export function calculateReturnsAnalysis(
  evolution: TimeSeriesPoint[]
): BacktestReturns {
  const monthlyReturns = calculateMonthlyReturns(evolution)
  const annualReturns = calculateAnnualReturns(monthlyReturns)

  const positiveMonths = monthlyReturns.filter((r) => r.return > 0).length
  const positiveYears = annualReturns.filter((r) => r.return > 0).length

  return {
    monthlyReturns,
    annualReturns,
    bestYears: getBestReturns(annualReturns, 3),
    worstYears: getWorstReturns(annualReturns, 3),
    bestMonths: getBestReturns(monthlyReturns, 3),
    worstMonths: getWorstReturns(monthlyReturns, 3),
    positiveMonths,
    totalMonths: monthlyReturns.length,
    positiveYears,
    totalYears: annualReturns.length,
  }
}

/**
 * Calculate complete risk analysis
 */
export function calculateRiskAnalysis(
  evolution: TimeSeriesPoint[]
): BacktestRisk {
  const monthlyReturns = calculateMonthlyReturns(evolution)
  const monthlyReturnValues = monthlyReturns.map((r) => r.return)

  const allDrawdowns = calculateDrawdowns(evolution)
  const deepestDrawdown = getDeepestDrawdown(allDrawdowns)
  const longestDrawdown = getLongestDrawdown(allDrawdowns)

  const defaultDrawdown: DrawdownPeriod = {
    startDate: new Date(),
    troughDate: new Date(),
    endDate: null,
    depth: 0,
    lengthMonths: 0,
    recovered: true,
  }

  return {
    allDrawdowns,
    maxDrawdown: deepestDrawdown || defaultDrawdown,
    deepestDrawdown: deepestDrawdown || defaultDrawdown,
    longestDrawdown: longestDrawdown || defaultDrawdown,
    valueAtRisk95: calculateVaR95(monthlyReturnValues),
  }
}
