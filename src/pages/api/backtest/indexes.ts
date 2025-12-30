import type { APIRoute } from 'astro'

export const prerender = false
import { getAvailableIndexes } from '@/lib/backtest/engine'

export const GET: APIRoute = async () => {
  try {
    const indexes = await getAvailableIndexes()

    return new Response(
      JSON.stringify({
        indexes,
        count: indexes.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching indexes:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch available indexes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
