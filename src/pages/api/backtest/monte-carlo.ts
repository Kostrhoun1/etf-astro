import type { APIRoute } from 'astro'

export const prerender = false
import { runBacktest } from '@/lib/backtest/engine'
import { runMonteCarlo, mean, standardDeviation } from '@/lib/backtest/calculations'
import type { BacktestInput } from '@/lib/backtest/types'

interface MonteCarloRequestBody {
  portfolio: Array<{
    isin: string
    name: string
    weight: number
    ter: number
    indexCode: string
  }>
  startDate: string
  endDate: string
  initialAmount: number
  forecastYears?: number
  simulations?: number
  // If true, Monte Carlo starts from initialAmount instead of backtest final value
  // Useful for FIRE calculator where we want to project from current savings
  useInitialAmountAsStart?: boolean
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: MonteCarloRequestBody = await request.json()

    // Validate
    if (!body.portfolio || body.portfolio.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Portfolio is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build input for backtest to get historical stats
    const input: BacktestInput = {
      portfolio: body.portfolio,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      initialAmount: body.initialAmount || 10000,
      rebalancingStrategy: 'yearly',
    }

    // Run backtest to get historical data
    const backtestResult = await runBacktest(input)

    // IMPORTANT: backtestResult.returns.monthlyReturns are actually DAILY returns
    // (the name is misleading - they are returns between consecutive data points)
    // We need to use annual returns and convert to monthly for accurate Monte Carlo
    const annualReturns = backtestResult.returns.annualReturns.map((r) => r.return)

    // Calculate annual stats
    const annualMean = mean(annualReturns)
    const annualStdDev = standardDeviation(annualReturns)

    // Convert to monthly for Monte Carlo simulation
    // Monthly mean: (1 + annual)^(1/12) - 1
    // Monthly stddev: annual / sqrt(12)
    const monthlyMean = Math.pow(1 + annualMean, 1/12) - 1
    const monthlyStdDev = annualStdDev / Math.sqrt(12)

    // Run Monte Carlo
    const forecastMonths = (body.forecastYears || 10) * 12
    const simulations = Math.min(body.simulations || 600, 1000)

    // Determine starting value for Monte Carlo
    // If useInitialAmountAsStart is true, use the user's input amount (for FIRE calculator)
    // Otherwise use the backtest final value (for regular Monte Carlo simulator)
    const mcStartValue = body.useInitialAmountAsStart
      ? (body.initialAmount || 10000)
      : backtestResult.summary.netAssetValue

    const mcResults = runMonteCarlo(
      mcStartValue,
      monthlyMean,
      monthlyStdDev,
      forecastMonths,
      simulations
    )

    // Convert to chart-friendly format (percentiles at each month)
    const chartData: Array<{
      month: number
      percentile5: number
      percentile16: number
      percentile50: number
      percentile84: number
      percentile95: number
    }> = []

    // Get the evolution arrays from each percentile result
    const p5 = mcResults.find((r) => r.percentile === 0.023)
    const p16 = mcResults.find((r) => r.percentile === 0.159)
    const p50 = mcResults.find((r) => r.percentile === 0.5)
    const p84 = mcResults.find((r) => r.percentile === 0.841)
    const p95 = mcResults.find((r) => r.percentile === 0.977)

    if (p5 && p16 && p50 && p84 && p95) {
      for (let i = 0; i <= forecastMonths; i++) {
        chartData.push({
          month: i,
          percentile5: p5.evolution[i]?.value || 0,
          percentile16: p16.evolution[i]?.value || 0,
          percentile50: p50.evolution[i]?.value || 0,
          percentile84: p84.evolution[i]?.value || 0,
          percentile95: p95.evolution[i]?.value || 0,
        })
      }
    }

    return new Response(
      JSON.stringify({
        chartData,
        stats: {
          currentValue: backtestResult.summary.netAssetValue,
          startValue: mcStartValue,
          monthlyMean,
          monthlyStdDev,
          annualMean,
          annualStdDev,
        },
        finalValues: {
          veryBad: p5?.finalValue || 0,
          bad: p16?.finalValue || 0,
          average: p50?.finalValue || 0,
          good: p84?.finalValue || 0,
          great: p95?.finalValue || 0,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Monte Carlo error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
