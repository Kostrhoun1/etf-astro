import type { APIRoute } from 'astro'

export const prerender = false
import { compareRebalancingStrategies } from '@/lib/backtest/engine'
import type { BacktestInput, RebalancingStrategy } from '@/lib/backtest/types'

interface RebalancingRequestBody {
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
}

const STRATEGY_LABELS: Record<RebalancingStrategy, string> = {
  'none': 'Bez rebalancování',
  'monthly': 'Měsíčně',
  'quarterly': 'Čtvrtletně',
  'half-yearly': 'Pololetně',
  'yearly': 'Ročně',
  'every-2-years': 'Každé 2 roky',
  'every-3-years': 'Každé 3 roky',
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: RebalancingRequestBody = await request.json()

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

    // Build input
    const input: BacktestInput = {
      portfolio: body.portfolio.map((item) => ({
        isin: item.isin,
        name: item.name,
        weight: item.weight,
        ter: item.ter,
        indexCode: item.indexCode,
      })),
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      initialAmount: body.initialAmount || 10000,
      rebalancingStrategy: 'yearly',
    }

    // Compare all strategies
    const results = await compareRebalancingStrategies(input)

    // Add labels and sort by CAGR
    const labeledResults = results
      .map((r) => ({
        strategy: r.strategy,
        strategyLabel: STRATEGY_LABELS[r.strategy],
        cagr: r.cagr,
        differenceFromMax: r.differenceFromMax,
      }))
      .sort((a, b) => b.cagr - a.cagr)

    return new Response(JSON.stringify({ strategies: labeledResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Rebalancing comparison error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
