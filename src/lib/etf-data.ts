import { supabase } from './supabase';

export interface ETFBasicInfo {
  isin: string;
  name: string;
  fund_provider: string;
  primary_ticker: string | null;
  ter_numeric: number | null;
  fund_size_numeric: number | null;
  rating: number | null;
  return_ytd: number | null;
  return_1y: number | null;
  return_3y: number | null;
  return_5y: number | null;
  category: string | null;
  distribution_policy: string | null;
  replication: string | null;
}

export interface CategoryConfig {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  filters: {
    category?: string;
    categories?: string[];
    nameContains?: string[];
    minFundSize?: number;
    distribution_policy?: string;
  };
  sortBy?: keyof ETFBasicInfo;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

const ETF_SELECT_FIELDS = `isin,name,fund_provider,primary_ticker,ter_numeric,fund_size_numeric,rating,return_ytd,return_1y,return_3y,return_5y,category,distribution_policy,replication`;

export async function getTopETFsForCategory(config: CategoryConfig): Promise<ETFBasicInfo[]> {
  try {
    let query = supabase.from('etf_funds').select(ETF_SELECT_FIELDS);
    if (config.filters.category) query = query.eq('category', config.filters.category);
    if (config.filters.categories?.length) query = query.in('category', config.filters.categories);
    if (config.filters.nameContains?.length) {
      const nameFilters = config.filters.nameContains.map(term => `name.ilike.%${term}%`).join(',');
      query = query.or(nameFilters);
    }
    if (config.filters.minFundSize) query = query.gte('fund_size_numeric', config.filters.minFundSize);
    if (config.filters.distribution_policy) query = query.eq('distribution_policy', config.filters.distribution_policy);
    query = query.not('fund_size_numeric', 'is', null).gte('fund_size_numeric', 10);
    const sortBy = config.sortBy || 'fund_size_numeric';
    query = query.order(sortBy, { ascending: config.sortOrder === 'asc' });
    if (sortBy === 'rating') {
      query = query.not('rating', 'is', null).order('fund_size_numeric', { ascending: false });
    }
    query = query.limit(config.limit || 50);
    const { data, error } = await query;
    if (error) { console.error('Error fetching ETFs:', error); return []; }
    return (data || []) as ETFBasicInfo[];
  } catch (error) {
    console.error('Error in getTopETFsForCategory:', error);
    return [];
  }
}

export const categoryConfigs: Record<string, CategoryConfig> = {
  'nejlepsi-sp500-etf': { slug: 'nejlepsi-sp500-etf', title: 'Nejlepší S&P 500 ETF', description: 'Top ETF fondy sledující index S&P 500', metaDescription: 'Nejlepší S&P 500 ETF fondy - srovnání ETF sledujících americký index S&P 500.', filters: { category: 'Akcie', nameContains: ['S&P 500', 'S&P500', 'SP500'], minFundSize: 100 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-msci-world-etf': { slug: 'nejlepsi-msci-world-etf', title: 'Nejlepší MSCI World ETF', description: 'Top globální ETF fondy', metaDescription: 'Nejlepší MSCI World ETF fondy - globální diverzifikované ETF.', filters: { category: 'Akcie', nameContains: ['MSCI World', 'World'], minFundSize: 100 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-nasdaq-etf': { slug: 'nejlepsi-nasdaq-etf', title: 'Nejlepší NASDAQ ETF', description: 'Top NASDAQ ETF fondy', metaDescription: 'Nejlepší NASDAQ ETF fondy - technologický index.', filters: { category: 'Akcie', nameContains: ['Nasdaq', 'NASDAQ'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-dividendove-etf': { slug: 'nejlepsi-dividendove-etf', title: 'Nejlepší dividendové ETF', description: 'Top dividendové ETF fondy', metaDescription: 'Nejlepší dividendové ETF fondy s pravidelnými výnosy.', filters: { category: 'Akcie', distribution_policy: 'Distributing', nameContains: ['Dividend', 'Income'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-technologicke-etf': { slug: 'nejlepsi-technologicke-etf', title: 'Nejlepší technologické ETF', description: 'Top tech ETF fondy', metaDescription: 'Nejlepší technologické ETF fondy na IT sektor.', filters: { category: 'Akcie', nameContains: ['Technology', 'Tech', 'Digital'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-celosvetove-etf': { slug: 'nejlepsi-celosvetove-etf', title: 'Nejlepší celosvětové ETF', description: 'Top globální ETF fondy', metaDescription: 'Nejlepší celosvětové ETF fondy.', filters: { category: 'Akcie', nameContains: ['World', 'Global', 'All-World', 'ACWI'], minFundSize: 100 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-americke-etf': { slug: 'nejlepsi-americke-etf', title: 'Nejlepší americké ETF', description: 'Top US ETF fondy', metaDescription: 'Nejlepší americké ETF fondy.', filters: { category: 'Akcie', nameContains: ['USA', 'US ', 'America', 'S&P', 'Nasdaq'], minFundSize: 100 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-evropske-etf': { slug: 'nejlepsi-evropske-etf', title: 'Nejlepší evropské ETF', description: 'Top EU ETF fondy', metaDescription: 'Nejlepší evropské ETF fondy.', filters: { category: 'Akcie', nameContains: ['Europe', 'Euro', 'STOXX', 'European'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-emerging-markets-etf': { slug: 'nejlepsi-emerging-markets-etf', title: 'Nejlepší Emerging Markets ETF', description: 'Top EM ETF fondy', metaDescription: 'Nejlepší Emerging Markets ETF.', filters: { category: 'Akcie', nameContains: ['Emerging', 'EM ', 'MSCI EM'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-dluhopisove-etf': { slug: 'nejlepsi-dluhopisove-etf', title: 'Nejlepší dluhopisové ETF', description: 'Top bond ETF fondy', metaDescription: 'Nejlepší dluhopisové ETF fondy.', filters: { category: 'Dluhopisy', minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-zlate-etf': { slug: 'nejlepsi-zlate-etf', title: 'Nejlepší zlato ETF', description: 'Top gold ETF fondy', metaDescription: 'Nejlepší zlato ETF.', filters: { category: 'Komodity', nameContains: ['Gold', 'Zlato'], minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-komoditni-etf': { slug: 'nejlepsi-komoditni-etf', title: 'Nejlepší komoditní ETF', description: 'Top commodity ETF fondy', metaDescription: 'Nejlepší komoditní ETF.', filters: { category: 'Komodity', minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-ai-etf': { slug: 'nejlepsi-ai-etf', title: 'Nejlepší AI ETF', description: 'Top AI ETF fondy', metaDescription: 'Nejlepší AI ETF na umělou inteligenci.', filters: { category: 'Akcie', nameContains: ['AI', 'Artificial Intelligence', 'Machine Learning'], minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-esg-etf': { slug: 'nejlepsi-esg-etf', title: 'Nejlepší ESG ETF', description: 'Top sustainable ETF fondy', metaDescription: 'Nejlepší ESG ETF.', filters: { nameContains: ['ESG', 'SRI', 'Sustainable', 'Green'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-value-etf': { slug: 'nejlepsi-value-etf', title: 'Nejlepší Value ETF', description: 'Top value ETF fondy', metaDescription: 'Nejlepší Value ETF.', filters: { category: 'Akcie', nameContains: ['Value'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-growth-etf': { slug: 'nejlepsi-growth-etf', title: 'Nejlepší Growth ETF', description: 'Top growth ETF fondy', metaDescription: 'Nejlepší Growth ETF.', filters: { category: 'Akcie', nameContains: ['Growth'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-small-cap-etf': { slug: 'nejlepsi-small-cap-etf', title: 'Nejlepší Small Cap ETF', description: 'Top small cap ETF fondy', metaDescription: 'Nejlepší Small Cap ETF.', filters: { category: 'Akcie', nameContains: ['Small', 'Russell 2000'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-healthcare-etf': { slug: 'nejlepsi-healthcare-etf', title: 'Nejlepší Healthcare ETF', description: 'Top healthcare ETF fondy', metaDescription: 'Nejlepší Healthcare ETF.', filters: { category: 'Akcie', nameContains: ['Health', 'Healthcare', 'Medical', 'Pharma'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-financni-etf': { slug: 'nejlepsi-financni-etf', title: 'Nejlepší finanční ETF', description: 'Top financial ETF fondy', metaDescription: 'Nejlepší finanční ETF.', filters: { category: 'Akcie', nameContains: ['Financial', 'Bank'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-energeticke-etf': { slug: 'nejlepsi-energeticke-etf', title: 'Nejlepší energetické ETF', description: 'Top energy ETF fondy', metaDescription: 'Nejlepší energetické ETF.', filters: { category: 'Akcie', nameContains: ['Energy', 'Oil', 'Gas'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-nemovitostni-etf': { slug: 'nejlepsi-nemovitostni-etf', title: 'Nejlepší nemovitostní ETF', description: 'Top REIT ETF fondy', metaDescription: 'Nejlepší REIT ETF.', filters: { category: 'Nemovitosti', minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
  'nejlepsi-japonske-etf': { slug: 'nejlepsi-japonske-etf', title: 'Nejlepší japonské ETF', description: 'Top Japan ETF fondy', metaDescription: 'Nejlepší japonské ETF.', filters: { category: 'Akcie', nameContains: ['Japan', 'Nikkei', 'TOPIX'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-cinske-etf': { slug: 'nejlepsi-cinske-etf', title: 'Nejlepší čínské ETF', description: 'Top China ETF fondy', metaDescription: 'Nejlepší čínské ETF.', filters: { category: 'Akcie', nameContains: ['China', 'Chinese', 'CSI', 'Hong Kong'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-stoxx600-etf': { slug: 'nejlepsi-stoxx600-etf', title: 'Nejlepší STOXX 600 ETF', description: 'Top EU index ETF fondy', metaDescription: 'Nejlepší STOXX 600 ETF.', filters: { category: 'Akcie', nameContains: ['STOXX 600', 'Euro STOXX'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-ftse100-etf': { slug: 'nejlepsi-ftse100-etf', title: 'Nejlepší FTSE 100 ETF', description: 'Top UK index ETF fondy', metaDescription: 'Nejlepší FTSE 100 ETF.', filters: { category: 'Akcie', nameContains: ['FTSE 100', 'UK 100'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-dax-etf': { slug: 'nejlepsi-dax-etf', title: 'Nejlepší DAX ETF', description: 'Top German index ETF fondy', metaDescription: 'Nejlepší DAX ETF.', filters: { category: 'Akcie', nameContains: ['DAX', 'Germany'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-clean-energy-etf': { slug: 'nejlepsi-clean-energy-etf', title: 'Nejlepší Clean Energy ETF', description: 'Top renewables ETF fondy', metaDescription: 'Nejlepší Clean Energy ETF.', filters: { category: 'Akcie', nameContains: ['Clean Energy', 'Renewable', 'Solar', 'Wind'], minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-biotechnologie-etf': { slug: 'nejlepsi-biotechnologie-etf', title: 'Nejlepší biotechnologie ETF', description: 'Top biotech ETF fondy', metaDescription: 'Nejlepší biotech ETF.', filters: { category: 'Akcie', nameContains: ['Biotech', 'Biotechnology', 'Genomic'], minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-robotika-etf': { slug: 'nejlepsi-robotika-etf', title: 'Nejlepší robotika ETF', description: 'Top robotics ETF fondy', metaDescription: 'Nejlepší robotika ETF.', filters: { category: 'Akcie', nameContains: ['Robot', 'Automation', 'Robotic'], minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-cloud-etf': { slug: 'nejlepsi-cloud-etf', title: 'Nejlepší Cloud ETF', description: 'Top cloud ETF fondy', metaDescription: 'Nejlepší Cloud ETF.', filters: { category: 'Akcie', nameContains: ['Cloud', 'SaaS', 'Software'], minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-kyberbezpecnost-etf': { slug: 'nejlepsi-kyberbezpecnost-etf', title: 'Nejlepší kyberbezpečnost ETF', description: 'Top cyber ETF fondy', metaDescription: 'Nejlepší cyber security ETF.', filters: { category: 'Akcie', nameContains: ['Cyber', 'Security'], minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-defense-etf': { slug: 'nejlepsi-defense-etf', title: 'Nejlepší Defense ETF', description: 'Top defense ETF fondy', metaDescription: 'Nejlepší Defense ETF.', filters: { category: 'Akcie', nameContains: ['Defense', 'Aerospace', 'Defence'], minFundSize: 10 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-spotrebni-etf': { slug: 'nejlepsi-spotrebni-etf', title: 'Nejlepší spotřební ETF', description: 'Top consumer ETF fondy', metaDescription: 'Nejlepší spotřební ETF.', filters: { category: 'Akcie', nameContains: ['Consumer', 'Retail', 'Luxury'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlepsi-asijsko-pacificke-etf': { slug: 'nejlepsi-asijsko-pacificke-etf', title: 'Nejlepší asijsko-pacifické ETF', description: 'Top APAC ETF fondy', metaDescription: 'Nejlepší asijsko-pacifické ETF.', filters: { category: 'Akcie', nameContains: ['Asia', 'Pacific', 'APAC'], minFundSize: 50 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 30 },
  'nejlevnejsi-etf': { slug: 'nejlevnejsi-etf', title: 'Nejlevnější ETF', description: 'ETF s nejnižšími poplatky', metaDescription: 'Nejlevnější ETF fondy podle TER.', filters: { minFundSize: 100 }, sortBy: 'ter_numeric', sortOrder: 'asc', limit: 50 },
  'nejlepsi-etf-2026': { slug: 'nejlepsi-etf-2026', title: 'Nejlepší ETF 2026', description: 'Top ETF fondy pro rok 2026', metaDescription: 'Nejlepší ETF fondy pro rok 2026.', filters: { minFundSize: 100 }, sortBy: 'rating', sortOrder: 'desc', limit: 200 },
  'etf-zdarma-degiro': { slug: 'etf-zdarma-degiro', title: 'ETF zdarma na DEGIRO', description: 'Core Selection ETF', metaDescription: 'ETF zdarma na DEGIRO.', filters: { minFundSize: 100 }, sortBy: 'fund_size_numeric', sortOrder: 'desc', limit: 50 },
};

/**
 * Get featured ETFs for srovnani-etf page
 * Returns top ETFs by different criteria for initial render
 */
export async function getFeaturedETFs(): Promise<{
  bySize: ETFBasicInfo[];
  byPerformance: ETFBasicInfo[];
  byRating: ETFBasicInfo[];
  lowCost: ETFBasicInfo[];
}> {
  try {
    // Fetch top by fund size
    const bySizePromise = supabase
      .from('etf_funds')
      .select(ETF_SELECT_FIELDS)
      .not('fund_size_numeric', 'is', null)
      .gte('fund_size_numeric', 100)
      .order('fund_size_numeric', { ascending: false })
      .limit(20);

    // Fetch top by 1Y performance
    const byPerformancePromise = supabase
      .from('etf_funds')
      .select(ETF_SELECT_FIELDS)
      .not('return_1y', 'is', null)
      .not('fund_size_numeric', 'is', null)
      .gte('fund_size_numeric', 50)
      .order('return_1y', { ascending: false })
      .limit(20);

    // Fetch top rated
    const byRatingPromise = supabase
      .from('etf_funds')
      .select(ETF_SELECT_FIELDS)
      .not('rating', 'is', null)
      .gte('rating', 4)
      .not('fund_size_numeric', 'is', null)
      .order('rating', { ascending: false })
      .order('fund_size_numeric', { ascending: false })
      .limit(20);

    // Fetch lowest cost
    const lowCostPromise = supabase
      .from('etf_funds')
      .select(ETF_SELECT_FIELDS)
      .not('ter_numeric', 'is', null)
      .not('fund_size_numeric', 'is', null)
      .gte('fund_size_numeric', 100)
      .lte('ter_numeric', 0.15)
      .order('ter_numeric', { ascending: true })
      .limit(20);

    const [bySizeResult, byPerformanceResult, byRatingResult, lowCostResult] = await Promise.all([
      bySizePromise,
      byPerformancePromise,
      byRatingPromise,
      lowCostPromise,
    ]);

    return {
      bySize: (bySizeResult.data || []) as ETFBasicInfo[],
      byPerformance: (byPerformanceResult.data || []) as ETFBasicInfo[],
      byRating: (byRatingResult.data || []) as ETFBasicInfo[],
      lowCost: (lowCostResult.data || []) as ETFBasicInfo[],
    };
  } catch (error) {
    console.error('Error in getFeaturedETFs:', error);
    return {
      bySize: [],
      byPerformance: [],
      byRating: [],
      lowCost: [],
    };
  }
}

/**
 * Get initial ETFs for srovnani-etf page (SSR)
 * Returns first 50 ETFs sorted by fund size for initial render
 */
export async function getInitialETFs(limit: number = 50): Promise<ETFBasicInfo[]> {
  try {
    const { data, error } = await supabase
      .from('etf_funds')
      .select(ETF_SELECT_FIELDS)
      .not('fund_size_numeric', 'is', null)
      .gte('fund_size_numeric', 10)
      .order('fund_size_numeric', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching initial ETFs:', error);
      return [];
    }

    return (data || []) as ETFBasicInfo[];
  } catch (error) {
    console.error('Error in getInitialETFs:', error);
    return [];
  }
}

/**
 * Calculate statistics from ETF array for hero sections
 */
export interface ETFStats {
  largestFund: { name: string; size: string; sizeRaw: number } | null;
  lowestTER: { name: string; ter: string; terRaw: number } | null;
  highestReturn1Y: { name: string; return: string; returnRaw: number } | null;
  avgTER: string;
  avgReturn1Y: string;
  totalFunds: number;
  terRange: string;
}

export function calculateETFStats(etfs: ETFBasicInfo[]): ETFStats {
  if (!etfs || etfs.length === 0) {
    return {
      largestFund: null,
      lowestTER: null,
      highestReturn1Y: null,
      avgTER: 'N/A',
      avgReturn1Y: 'N/A',
      totalFunds: 0,
      terRange: 'N/A',
    };
  }

  // Find largest fund by size
  const etfsWithSize = etfs.filter(e => e.fund_size_numeric != null);
  const largestBySize = etfsWithSize.length > 0
    ? etfsWithSize.reduce((max, e) => (e.fund_size_numeric! > max.fund_size_numeric! ? e : max))
    : null;

  // Find lowest TER
  const etfsWithTER = etfs.filter(e => e.ter_numeric != null && e.ter_numeric > 0);
  const lowestByTER = etfsWithTER.length > 0
    ? etfsWithTER.reduce((min, e) => (e.ter_numeric! < min.ter_numeric! ? e : min))
    : null;

  // Find highest TER for range
  const highestTER = etfsWithTER.length > 0
    ? etfsWithTER.reduce((max, e) => (e.ter_numeric! > max.ter_numeric! ? e : max))
    : null;

  // Find highest 1Y return
  const etfsWithReturn = etfs.filter(e => e.return_1y != null);
  const highestByReturn = etfsWithReturn.length > 0
    ? etfsWithReturn.reduce((max, e) => (e.return_1y! > max.return_1y! ? e : max))
    : null;

  // Calculate averages
  const avgTER = etfsWithTER.length > 0
    ? (etfsWithTER.reduce((sum, e) => sum + e.ter_numeric!, 0) / etfsWithTER.length).toFixed(2)
    : 'N/A';

  const avgReturn1Y = etfsWithReturn.length > 0
    ? (etfsWithReturn.reduce((sum, e) => sum + e.return_1y!, 0) / etfsWithReturn.length).toFixed(1)
    : 'N/A';

  // Format fund size (in billions or millions)
  const formatSize = (size: number): string => {
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)}B`;
    }
    return `${size.toFixed(0)}M`;
  };

  // Format TER range
  const terRange = lowestByTER && highestTER
    ? `${lowestByTER.ter_numeric!.toFixed(2)}% - ${highestTER.ter_numeric!.toFixed(2)}%`
    : 'N/A';

  return {
    largestFund: largestBySize ? {
      name: largestBySize.name.split(' UCITS')[0].split(' ETF')[0], // Shorten name
      size: formatSize(largestBySize.fund_size_numeric!),
      sizeRaw: largestBySize.fund_size_numeric!,
    } : null,
    lowestTER: lowestByTER ? {
      name: lowestByTER.name.split(' UCITS')[0].split(' ETF')[0],
      ter: `${lowestByTER.ter_numeric!.toFixed(2)}%`,
      terRaw: lowestByTER.ter_numeric!,
    } : null,
    highestReturn1Y: highestByReturn ? {
      name: highestByReturn.name.split(' UCITS')[0].split(' ETF')[0],
      return: `${highestByReturn.return_1y! > 0 ? '+' : ''}${highestByReturn.return_1y!.toFixed(1)}%`,
      returnRaw: highestByReturn.return_1y!,
    } : null,
    avgTER: avgTER !== 'N/A' ? `${avgTER}%` : avgTER,
    avgReturn1Y: avgReturn1Y !== 'N/A' ? `${parseFloat(avgReturn1Y) > 0 ? '+' : ''}${avgReturn1Y}%` : avgReturn1Y,
    totalFunds: etfs.length,
    terRange,
  };
}

/**
 * Get total ETF count
 */
export async function getTotalETFCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('etf_funds')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting ETF count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalETFCount:', error);
    return 0;
  }
}
