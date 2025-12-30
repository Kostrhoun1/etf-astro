import type { APIRoute } from 'astro'

export const prerender = false
import { supabase } from '@/lib/supabase'

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({
          results: [],
          message: 'Query must be at least 2 characters long',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`ETF Search: "${query}"`)

    // Search v ISIN, nazvu, vsech tickerech ze vsech burz a provideru
    const { data, error } = await supabase
      .from('etf_funds')
      .select(`
        isin,
        name,
        primary_ticker,
        fund_provider,
        fund_size_numeric,
        rating
      `)
      .or(
        `isin.ilike.%${query}%,name.ilike.%${query}%,primary_ticker.ilike.%${query}%,exchange_1_ticker.ilike.%${query}%,exchange_2_ticker.ilike.%${query}%,exchange_3_ticker.ilike.%${query}%,exchange_4_ticker.ilike.%${query}%,exchange_5_ticker.ilike.%${query}%,exchange_6_ticker.ilike.%${query}%,exchange_7_ticker.ilike.%${query}%,exchange_8_ticker.ilike.%${query}%,exchange_9_ticker.ilike.%${query}%,exchange_10_ticker.ilike.%${query}%,fund_provider.ilike.%${query}%`
      )
      .order('fund_size_numeric', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return new Response(
        JSON.stringify({ error: 'Search failed', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${data?.length || 0} results for "${query}"`)

    return new Response(
      JSON.stringify({
        results: data || [],
        query,
        count: data?.length || 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ETF search error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
