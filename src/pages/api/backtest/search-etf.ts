import type { APIRoute } from 'astro'

export const prerender = false
import { supabase } from '@/lib/supabase'

/**
 * Search ETFs by name or ISIN
 * Returns ETFs that have a known index mapping for backtesting
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.toLowerCase() || ''
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)

  if (query.length < 2) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Get available index codes from mapping
    const { data: indexMappings } = await supabase
      .from('index_mapping')
      .select('index_code, index_name')

    if (!indexMappings) {
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const indexNameMap = new Map(indexMappings.map((m) => [m.index_code, m.index_name]))

    // Search ETFs that track these indexes
    const { data: etfs, error } = await supabase
      .from('etf_funds')
      .select('isin, name, ter_numeric, index_name, fund_size_numeric')
      .or(`name.ilike.%${query}%,isin.ilike.%${query}%`)
      .not('index_name', 'is', null)
      .order('fund_size_numeric', { ascending: false, nullsFirst: false })
      .limit(100)

    if (error) {
      console.error('ETF search error:', error)
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Map ETF index names to our index codes
    const indexNameToCode: Record<string, string> = {
      'MSCI World': 'msci_world',
      'MSCI World Index': 'msci_world',
      'MSCI World (USD)': 'msci_world',
      'S&P 500': 'sp500',
      'S&P 500 Index': 'sp500',
      'S&P 500®': 'sp500',
      'MSCI Emerging Markets': 'msci_em',
      'MSCI Emerging Markets Index': 'msci_em',
      'MSCI EM': 'msci_em',
      'MSCI Europe': 'msci_europe',
      'MSCI Europe Index': 'msci_europe',
      'STOXX Europe 600': 'stoxx600',
      'STOXX® Europe 600': 'stoxx600',
      'EURO STOXX 600': 'stoxx600',
    }

    // Filter and map results
    const results = etfs
      ?.map((etf) => {
        // Try to find matching index code
        let indexCode: string | null = null

        for (const [pattern, code] of Object.entries(indexNameToCode)) {
          if (etf.index_name?.toLowerCase().includes(pattern.toLowerCase())) {
            indexCode = code
            break
          }
        }

        if (!indexCode) return null

        return {
          isin: etf.isin,
          name: etf.name,
          ter: (etf.ter_numeric || 0.2) / 100, // Convert from percentage to decimal
          indexCode,
          indexName: indexNameMap.get(indexCode) || etf.index_name,
          fundSize: etf.fund_size_numeric,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .slice(0, limit)

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('ETF search error:', error)
    return new Response(
      JSON.stringify({ error: 'Search failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
