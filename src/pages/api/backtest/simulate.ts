import type { APIRoute } from 'astro'

export const prerender = false
import {
  runBacktest,
  runBacktestWithForecasts,
  loadExchangeRates,
  convertTimeSeriesFromEur,
  getExchangeRateForDate,
} from '@/lib/backtest/engine'
import type { BacktestInput, RebalancingStrategy } from '@/lib/backtest/types'

type Currency = 'EUR' | 'CZK' | 'USD'

interface SimulateRequestBody {
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
  rebalancingStrategy?: RebalancingStrategy
  includeMonteCarlo?: boolean
  forecastYears?: number
  currency?: Currency
  contributions?: {
    amount: number
    frequency: 'monthly' | 'quarterly' | 'yearly'
  }
}

function serializeDrawdown(d: {
  startDate: Date
  troughDate: Date
  endDate: Date | null
  depth: number
  lengthMonths: number
  recovered: boolean
}) {
  return {
    ...d,
    startDate: d.startDate.toISOString(),
    troughDate: d.troughDate.toISOString(),
    endDate: d.endDate?.toISOString() || null,
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: SimulateRequestBody = await request.json()

    // Validate required fields
    if (!body.portfolio || body.portfolio.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Portfolio is required and must not be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!body.startDate || !body.endDate) {
      return new Response(
        JSON.stringify({ error: 'startDate and endDate are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate weights sum to 1
    const totalWeight = body.portfolio.reduce((sum, item) => sum + item.weight, 0)
    if (Math.abs(totalWeight - 1) > 0.01) {
      return new Response(
        JSON.stringify({ error: `Portfolio weights must sum to 1 (got ${totalWeight})` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Load exchange rates for currency conversion
    const currency = body.currency || 'CZK'
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)

    let exchangeRates: Awaited<ReturnType<typeof loadExchangeRates>> = []
    exchangeRates = await loadExchangeRates(startDate, endDate)

    // Get starting exchange rate for input conversion
    const startRate = exchangeRates.length > 0
      ? getExchangeRateForDate(exchangeRates, startDate)
      : null

    // Convert input amounts from user currency to EUR (data is stored in EUR)
    let initialAmountEur = body.initialAmount || 10000
    let contributionsEur = body.contributions

    if (startRate && currency === 'CZK') {
      initialAmountEur = body.initialAmount / startRate.eurCzk
      if (body.contributions) {
        contributionsEur = {
          ...body.contributions,
          amount: body.contributions.amount / startRate.eurCzk,
        }
      }
    } else if (startRate && currency === 'USD') {
      initialAmountEur = body.initialAmount / startRate.eurUsd
      if (body.contributions) {
        contributionsEur = {
          ...body.contributions,
          amount: body.contributions.amount / startRate.eurUsd,
        }
      }
    }

    // Build input with EUR amounts
    const input: BacktestInput = {
      portfolio: body.portfolio.map((item) => ({
        isin: item.isin,
        name: item.name,
        weight: item.weight,
        ter: item.ter,
        indexCode: item.indexCode,
      })),
      startDate,
      endDate,
      initialAmount: initialAmountEur,
      rebalancingStrategy: body.rebalancingStrategy || 'yearly',
      contributions: contributionsEur,
    }

    // Run backtest (internally in EUR)
    let result
    if (body.includeMonteCarlo) {
      result = await runBacktestWithForecasts(input, body.forecastYears || 10)
    } else {
      result = await runBacktest(input)
    }

    // Convert evolution from EUR to target currency
    const convertedEvolution = convertTimeSeriesFromEur(
      result.evolution,
      exchangeRates,
      currency
    )

    // Get final exchange rate for summary conversion
    const finalRate = exchangeRates.length > 0
      ? getExchangeRateForDate(exchangeRates, endDate)
      : null

    // Convert summary values from EUR to target currency
    let convertedSummary = { ...result.summary }
    if (finalRate) {
      let conversionFactor = 1
      if (currency === 'CZK') {
        conversionFactor = finalRate.eurCzk
      } else if (currency === 'USD') {
        conversionFactor = finalRate.eurUsd
      }

      convertedSummary = {
        ...result.summary,
        amountInvested: result.summary.amountInvested * conversionFactor,
        netAssetValue: result.summary.netAssetValue * conversionFactor,
      }
    }

    // Serialize dates for JSON response
    const serializedResult = {
      ...result,
      currency,
      input: {
        ...result.input,
        startDate: result.input.startDate.toISOString(),
        endDate: result.input.endDate.toISOString(),
      },
      summary: convertedSummary,
      evolution: convertedEvolution.map((p) => ({
        date: p.date.toISOString(),
        value: p.value,
      })),
      returns: {
        ...result.returns,
        monthlyReturns: result.returns.monthlyReturns.map((r) => ({
          ...r,
          date: r.date.toISOString(),
        })),
      },
      risk: {
        ...result.risk,
        maxDrawdown: serializeDrawdown(result.risk.maxDrawdown),
        deepestDrawdown: serializeDrawdown(result.risk.deepestDrawdown),
        longestDrawdown: serializeDrawdown(result.risk.longestDrawdown),
        allDrawdowns: result.risk.allDrawdowns.map(serializeDrawdown),
      },
      monteCarlo: result.monteCarlo?.map((mc) => ({
        ...mc,
        evolution: mc.evolution.map((p) => ({
          date: p.date.toISOString(),
          value: p.value,
        })),
      })),
    }

    return new Response(JSON.stringify(serializedResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Backtest error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
