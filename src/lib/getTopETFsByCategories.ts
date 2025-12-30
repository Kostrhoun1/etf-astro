import { supabaseAdmin } from './supabase';
import { categoryMappings, CategoryDataServer } from './categoryMappings';

// Server-side version of getCategoryByETF
const getCategoryByETFServer = (category: string): string => {
  // Použij přímo kategorie z databáze
  const dbCategories = ['Akcie', 'Dluhopisy', 'Nemovitosti', 'Komodity', 'Krypto'];
  
  if (dbCategories.includes(category)) {
    return category;
  }
  
  // Default fallback
  return 'Akcie';
};

export interface ETFItem {
  isin: string;
  name: string;
  fund_provider: string;
  primary_ticker?: string;
  ter_numeric: number;
  fund_size_numeric: number;
  rating?: number;
  return_1y_czk?: number;
  return_1y_usd?: number;
  return_1y?: number;
  return_ytd_czk?: number;
  return_ytd_usd?: number;
  return_ytd?: number;
  return_3y_czk?: number;
  return_3y_usd?: number;
  return_3y?: number;
  return_5y_czk?: number;
  return_5y_usd?: number;
  return_5y?: number;
  category: string;
}

export interface CategoryDataWithETFs extends CategoryDataServer {
  etfs: ETFItem[];
}

export async function getTopETFsByCategories(): Promise<CategoryDataWithETFs[]> {
  try {
    // Fetch top ETFs for each category - omezíme na top 15 pro každou kategorii
    const { data: etfs, error } = await supabaseAdmin
      .from('etf_funds')
      .select(`
        isin,
        name,
        fund_provider,
        primary_ticker,
        ter_numeric,
        fund_size_numeric,
        rating,
        return_1y_czk,
        return_1y_usd,
        return_1y,
        return_ytd_czk,
        return_ytd_usd,
        return_ytd,
        return_3y_czk,
        return_3y_usd,
        return_3y,
        return_5y_czk,
        return_5y_usd,
        return_5y,
        category
      `)
      .not('fund_size_numeric', 'is', null)
      .gte('fund_size_numeric', 10) // Minimálně 10 mil EUR (místo 100)
      .order('fund_size_numeric', { ascending: false }) // Řaď podle velikosti (největší první)
      .limit(2000); // Vezmi top 2000 ETF fondů celkem pro lepší pokrytí kategorií

    if (error) {
      console.error('Error fetching ETFs:', error);
      return [];
    }

    if (!etfs || etfs.length === 0) {
      return [];
    }

    // Seskup ETF podle kategorií
    const etfsByCategory: { [key: string]: ETFItem[] } = {};

    etfs.forEach(etf => {
      const mappedCategory = getCategoryByETFServer(etf.category || '');
      if (!etfsByCategory[mappedCategory]) {
        etfsByCategory[mappedCategory] = [];
      }
      
      // Přidej pouze pokud není kategorie již plná (max 15 ETF na kategorii)
      if (etfsByCategory[mappedCategory].length < 15) {
        etfsByCategory[mappedCategory].push(etf as ETFItem);
      }
    });

    // Vytvoř finální strukturu dat
    const result: CategoryDataWithETFs[] = categoryMappings.map(category => ({
      ...category,
      etfs: etfsByCategory[category.id] || []
    }));

    // Filtruj pouze kategorie s ETF (alespoň 1 ETF na kategorii)
    return result.filter(category => category.etfs.length >= 1);

  } catch (error) {
    console.error('Error in getTopETFsByCategories:', error);
    return [];
  }
}