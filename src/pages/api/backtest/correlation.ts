import type { APIRoute } from 'astro'

export const prerender = false
import { loadIndexData } from '@/lib/backtest/engine'

interface CorrelationRequestBody {
  portfolio: Array<{
    isin: string
    name: string
    indexCode: string
  }>
  startDate: string
  endDate: string
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0

  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0
  return numerator / denominator
}

/**
 * Calculate monthly returns from price data
 */
function calculateReturns(prices: Array<{ date: Date; closePrice: number }>): number[] {
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1].closePrice
    const currPrice = prices[i].closePrice
    if (prevPrice > 0) {
      returns.push((currPrice - prevPrice) / prevPrice)
    }
  }
  return returns
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: CorrelationRequestBody = await request.json()

    if (!body.portfolio || body.portfolio.length < 2) {
      return new Response(JSON.stringify({ correlations: [], etfNames: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)

    // Load data and calculate returns for each ETF
    const etfReturns: Map<string, { name: string; returns: number[]; dates: string[] }> = new Map()

    for (const etf of body.portfolio) {
      const indexData = await loadIndexData(etf.indexCode, startDate, endDate)
      if (indexData.data.length > 0) {
        const returns = calculateReturns(indexData.data)
        const dates = indexData.data.slice(1).map((d) => d.date.toISOString())
        etfReturns.set(etf.indexCode, {
          name: etf.name,
          returns,
          dates,
        })
      }
    }

    // Find common date range
    const allDates = new Set<string>()
    for (const { dates } of etfReturns.values()) {
      for (const date of dates) {
        allDates.add(date)
      }
    }

    // Calculate correlations for each pair
    const correlations: Array<{ etf1: string; etf2: string; correlation: number }> = []
    const etfNames: string[] = []
    const etfList = Array.from(etfReturns.entries())

    for (const [code, data] of etfList) {
      etfNames.push(data.name)
    }

    for (let i = 0; i < etfList.length; i++) {
      for (let j = i + 1; j < etfList.length; j++) {
        const [code1, data1] = etfList[i]
        const [code2, data2] = etfList[j]

        // Align returns by date
        const commonDates = data1.dates.filter((d) => data2.dates.includes(d))
        const returns1: number[] = []
        const returns2: number[] = []

        for (const date of commonDates) {
          const idx1 = data1.dates.indexOf(date)
          const idx2 = data2.dates.indexOf(date)
          if (idx1 !== -1 && idx2 !== -1) {
            returns1.push(data1.returns[idx1])
            returns2.push(data2.returns[idx2])
          }
        }

        const correlation = calculateCorrelation(returns1, returns2)
        correlations.push({
          etf1: data1.name,
          etf2: data2.name,
          correlation,
        })
      }
    }

    return new Response(JSON.stringify({ correlations, etfNames }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Correlation error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
