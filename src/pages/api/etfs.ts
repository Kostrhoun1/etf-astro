import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

const ETF_SELECT_FIELDS = `
  isin,
  name,
  fund_provider,
  category,
  ter_numeric,
  return_1m,
  return_3m,
  return_6m,
  return_1y,
  return_3y,
  return_5y,
  return_ytd,
  return_1m_czk,
  return_3m_czk,
  return_6m_czk,
  return_1y_czk,
  return_3y_czk,
  return_5y_czk,
  return_ytd_czk,
  return_1m_usd,
  return_3m_usd,
  return_6m_usd,
  return_1y_usd,
  return_3y_usd,
  return_5y_usd,
  return_ytd_usd,
  fund_size_numeric,
  degiro_free,
  primary_ticker,
  distribution_policy,
  index_name,
  fund_currency,
  replication,
  region,
  current_dividend_yield_numeric,
  exchange_1_ticker,
  exchange_2_ticker,
  exchange_3_ticker,
  exchange_4_ticker,
  exchange_5_ticker,
  exchange_6_ticker,
  exchange_7_ticker,
  exchange_8_ticker,
  exchange_9_ticker,
  exchange_10_ticker,
  rating,
  rating_score,
  updated_at,
  is_leveraged
`;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    const isins = url.searchParams.get('isins');
    const category = url.searchParams.get('category');
    const countOnly = url.searchParams.get('count') === 'true';

    // Count only request
    if (countOnly) {
      const { count, error } = await supabase
        .from('etf_funds')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ count }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5 min cache
        }
      });
    }

    // Fetch by ISINs
    if (isins) {
      const isinList = isins.split(',');
      const { data, error } = await supabase
        .from('etf_funds')
        .select('*')
        .in('isin', isinList);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // Paginated fetch - always use range() for proper pagination
    let query = supabase
      .from('etf_funds')
      .select(ETF_SELECT_FIELDS)
      .order('fund_size_numeric', { ascending: false, nullsFirst: false });

    // Filter by category if specified
    if (category) {
      query = query.eq('category', category);
    }

    // Parse pagination parameters
    const off = offset ? parseInt(offset) : 0;
    const lim = limit ? parseInt(limit) : 1000;

    // Use range() for pagination (supports up to the Supabase limit per request)
    query = query.range(off, off + lim - 1);

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
