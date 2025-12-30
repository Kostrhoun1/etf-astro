/**
 * Get the most recent update date from ETF database for dynamic dateModified
 * Used for SEO freshness signals in category pages
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getLastModifiedDate(isins?: string[]): Promise<string> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('etf_funds')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    // If specific ISINs provided, filter by them
    if (isins && isins.length > 0) {
      query = query.in('isin', isins);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching last modified date:', error);
      // Fallback to current date if DB query fails
      return new Date().toISOString();
    }

    if (data && data.length > 0 && data[0].updated_at) {
      return data[0].updated_at;
    }

    // Fallback to current date
    return new Date().toISOString();
  } catch (error) {
    console.error('Exception in getLastModifiedDate:', error);
    return new Date().toISOString();
  }
}

/**
 * Get last modified date for category pages based on filter criteria
 * E.g., S&P 500 ETFs, MSCI World ETFs, etc.
 */
export async function getCategoryLastModified(categoryFilter: {
  name?: string;
  index?: string;
  category?: string;
}): Promise<string> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('etf_funds')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    // Apply filters based on category
    if (categoryFilter.name) {
      query = query.ilike('name', `%${categoryFilter.name}%`);
    }
    if (categoryFilter.index) {
      query = query.ilike('index', `%${categoryFilter.index}%`);
    }
    if (categoryFilter.category) {
      query = query.ilike('category', `%${categoryFilter.category}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching category last modified:', error);
      return new Date().toISOString();
    }

    if (data && data.length > 0 && data[0].updated_at) {
      return data[0].updated_at;
    }

    return new Date().toISOString();
  } catch (error) {
    console.error('Exception in getCategoryLastModified:', error);
    return new Date().toISOString();
  }
}
